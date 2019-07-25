var jsonObjRes = {};
var histoData = {};
var mementosToRemove = [];
var curURIUnderFocus=null;
var curDeepLinkStateArr=[];
var curUniqueUserSessionID = null;
var generateAllClicked = false;
(function(window, document, undefined){


    var curZoom = 100;

    /*
     Mixins
     */

    var observable = function(obj){
        obj.bind = function(cb){
            this._callbacks = this._callbacks || [];
            this._callbacks.push(cb);
        };

        obj.trigger = function(){
            if(!this._callbacks) return;
            for(var i = 0; callback = this._callbacks[i]; i++)
                callback.apply(this, arguments);
        };

        return obj;
    };

    var transformable = function(obj){
        obj.move = function(e){
            if(!e.type === "move" || !e.deltaX) return;

            if(_.isUndefined(this.currOffset)) this.currOffset = 0;
            this.currOffset += e.deltaX;
            this.el.css({"left" : this.currOffset});
        };

        obj.zoom = function(e){
            if(!e.type === "zoom") return;
            this.el.css({ "width": e.width });
        };
    };

    var touchInit = 'ontouchstart' in document;
    if(touchInit) jQuery.event.props.push("touches");

    var draggable = function(obj){
        var drag;
        function mousedown(e){
            e.preventDefault();
            drag = {x: e.pageX};
            e.type = "dragstart";
            obj.el.trigger(e);
        };

        function mousemove(e){
            if(!drag) return;
            e.preventDefault();
            e.type = "dragging";
            e = _.extend(e, {
                deltaX: (e.pageX || e.touches[0].pageX) - drag.x
            });
            drag = { x: (e.pageX || e.touches[0].pageX) };
            obj.el.trigger(e);
        };

        function mouseup(e){
            if(!drag) return;
            drag = null;
            e.type = "dragend";
            obj.el.trigger(e);
        };

        if(!touchInit) {
            obj.el.bind("mousedown", mousedown);

            $(document).bind("mousemove", mousemove);
            $(document).bind("mouseup", mouseup);
        } else {
            var last;
            obj.el.bind("touchstart", function(e) {
                var now = Date.now();
                var delta = now - (last || now);
                var type = delta > 0 && delta <= 250 ? "doubletap" : "tap";
                drag = {x: e.touches[0].pageX};
                last = now;
                obj.el.trigger($.Event(type));
            });
            obj.el.bind("touchmove", mousemove);
            obj.el.bind("touchend", mouseup);
        };

        return obj;
    };



    // safari bug for too fast scrolling, h/t polymaps
    var safari = /WebKit\/533/.test(navigator.userAgent);
    var wheel = function(obj){
        function mousewheel(e){
            e.preventDefault();
            var delta = (e.wheelDelta || -e.detail);
            if(safari){
                var negative = delta < 0 ? -1 : 1;
                delta = Math.log(Math.abs(delta)) * negative * 2;
            };
            e.type = "scrolled";
            e.deltaX = delta;
            obj.el.trigger(e);
        };

        obj.el.bind("mousewheel DOMMouseScroll", mousewheel);
    };

    /*
     Utils
     */
    var Bounds = function(){
        this.min = +Infinity;
        this.max = -Infinity;
    };

    Bounds.prototype.extend = function(num){
        this.min = Math.min(num, this.min);
        this.max = Math.max(num, this.max);
    };


    Bounds.prototype.width = function(){
        return this.max - this.min;
    };

    Bounds.prototype.project = function(num, max){
        return (num - this.min) / this.width() * max;
    };


    // Handy dandy function to make sure that events are
    // triggered at the same time on two objects.'

    var sync = function(origin, listener){
        var events = Array.prototype.slice.call(arguments, 2);
        _.each(events, function(ev){
            origin.bind(function(e){
                if(e.type === ev && listener[ev])
                    listener[ev](e);
            });
        });
    };

    var template = function(query) {
        return _.template($(query).html());
    };

    var getYearFromTimestamp = function(timestamp) {
        var d = new Date();
        d.setTime(timestamp * 1000);
        return d.getFullYear();
    };

    var cleanNumber = function(str){
        return parseInt(str.replace(/^[^+\-\d]?([+\-]\d+)?.*$/, "$1"), 10);
    };


    /*
     Models
     */
    // Stores state
    var Timeline = function(data) {
        data = data.sort(function(a, b){ return a.timestamp - b.timestamp; });
        this.bySid  = {};
        this.series = [];
        this.bounds = new Bounds();
        this.bar      = new Bar(this);
        this.cardCont = new CardContainer(this);
        this.createSeries(data);
        // extend bounds for padding
        this.bounds.extend(this.bounds.min - 7889231);
        this.bounds.extend(this.bounds.max + 7889231);
        this.bar.render();
        sync(this.bar, this.cardCont, "move", "zoom");
        var e = $.Event("render");
        this.trigger(e);
    };
    observable(Timeline.prototype);

    Timeline.prototype = _.extend(Timeline.prototype, {
        createSeries : function(series){
            for(var i = 0; i < series.length; i++){
                this.add(series[i]);
            }
        },

        add : function(card){
            if(!(card.event_series in this.bySid)){
                this.bySid[card.event_series] = new Series(card, this);
                this.series.push(this.bySid[card.event_series]);
            }
            var series = this.bySid[card.event_series];
            series.add(card);
            this.bounds.extend(series.max());
            this.bounds.extend(series.min());
        }
    });



    /*
     Views
     */
    var Bar = function(timeline) {
        this.el = $(".timeline_notchbar");
        this.el.css({ "left": 0 });
        this.timeline = timeline;
        draggable(this);
        wheel(this);
        _.bindAll(this, "moving", "doZoom");
        this.el.bind("dragging scrolled", this.moving);
        this.el.bind("doZoom", this.doZoom);
        this.template = template("#year_notch_tmpl");
        this.el.bind("dblclick doubletap", function(e){
            e.preventDefault();
            $(".timeline_zoom_in").click();
        });
    };
    observable(Bar.prototype);
    transformable(Bar.prototype);

    Bar.prototype = _.extend(Bar.prototype, {
        moving : function(e){
            var parent  = this.el.parent();
            var pOffset = parent.offset().left;
            var offset  = this.el.offset().left;
            var width   = this.el.width();
            // check to make sure we have a delta
            if(_.isUndefined(e.deltaX)) e.deltaX = 0;

            // check to make sure the bar isn't out of bounds
            if(offset + width + e.deltaX < pOffset + parent.width())
                e.deltaX = (pOffset + parent.width()) - (offset + width);
            if(offset + e.deltaX > pOffset)
                e.deltaX = pOffset - offset;

            // and move both this and the card container.
            e.type = "move";
            this.trigger(e);
            this.move(e);
        },

        doZoom : function(e, width){
            var that = this;
            var notch = $(".timeline_notch_active");
            var getCur = function() {
                return notch.length > 0 ? notch.position().left : 0;
            };
            var curr = getCur();

            // needs fixin for offset and things, time fer thinkin'
            this.el.animate({"width": width + "%"}, {
                step: function(current, fx) {
                    var e = $.Event("dragging");
                    var delta = curr - getCur();
                    e.deltaX = delta;
                    that.moving(e);
                    curr = getCur();
                    e   = $.Event("zoom");
                    e.width = current + "%";
                    that.trigger(e);
                }
            });
        },

        render : function(){
            var timestamp, year, html, date;
            var earliestYear = getYearFromTimestamp(this.timeline.bounds.min);
            var latestYear   = getYearFromTimestamp(this.timeline.bounds.max);

            // calculate divisions a bit better.
            for (i = earliestYear; i < latestYear; i++) {
                date      = new Date();
                date.setYear(i);
                date.setMonth(0);
                date.setDate(1);
                timestamp = date.getTime() / 1000 | 0;
                year      = i;
                html      = this.template({'timestamp' : timestamp, 'year' : year });
                this.el.append($(html).css("left", (this.timeline.bounds.project(timestamp, 100) | 0) + "%"));
            }
        }
    });



    var CardContainer = function(timeline){
        this.el = $("#timeline_card_scroller_inner");
    };
    observable(CardContainer.prototype);
    transformable(CardContainer.prototype);

    var COLORS = ["#EDC047", "#948989", "#91ADD1", "#929E5E", "#9E5E23", "#C44846", "#065718", "#EDD4A5", "#CECECE"];

    var color = function(){
        var chosen;
        if (COLORS.length > 0) {
            chosen = COLORS[0];
            COLORS.shift();
        } else {
            chosen = "#444";
        }
        return chosen;
    };

    var Series = function(series, timeline) {
        this.timeline = timeline;
        this.name     = series.event_series;
        this.color    = this.name.length > 0 ? color() : "#000";
        this.cards    = [];
        _.bindAll(this, "render", "showNotches", "hideNotches");
        this.template = template("#series_legend_tmpl");
        this.timeline.bind(this.render);
    };
    observable(Series.prototype);

    Series.prototype = _.extend(Series.prototype, {
        add : function(card){
            var crd = new Card(card, this);
            this.cards.splice(this.sortedIndex(crd), 0, crd);
        },

        sortedIndex : function(card){
            return _.sortedIndex(this.cards, card, this._comparator);
        },

        _comparator : function(crd){
            return crd.timestamp;
        },


        hideNotches : function(e){
            e.preventDefault();
            this.el.addClass("series_legend_item_inactive");
            _.each(this.cards, function(card){
                card.hideNotch();
            });
        },

        showNotches : function(e){
            e.preventDefault();
            this.el.removeClass("series_legend_item_inactive");
            _.each(this.cards, function(card){
                card.showNotch();
            });
        },

        render : function(e){
            if(!e.type === "render") return;
            if(this.name.length === 0) return;
            this.el = $(this.template(this));
            $(".series_nav_container").append(this.el);
            this.el.toggle(this.hideNotches,this.showNotches);
        }
    });

    _(["min", "max"]).each(function(key){
        Series.prototype[key] = function() {
            return _[key].call(_, this.cards, this._comparator).timestamp;
        };
    });


    var Card = function(card, series) {
        this.series = series;
        var card = _.clone(card);
        this.timestamp = card.timestamp;
        this.attributes = card;
        this.attributes.topcolor = series.color;
        this.template = template("#card_tmpl");
        this.ntemplate = template("#notch_tmpl");
        _.bindAll(this, "render", "activate", "position");
        this.series.timeline.bind(this.render);
        this.series.bind(this.deactivate);
        this.series.timeline.bar.bind(this.position);
    };

    Card.prototype = _.extend(Card.prototype, {
        get : function(key){
            return this.attributes[key];
        },

        $ : function(query){
            return $(query, this.el);
        },

        render : function(e){
            if(!e.type === "render") return;
            this.offset = this.series.timeline.bounds.project(this.timestamp, 100);
            var html = this.ntemplate(this.attributes);
            this.notch = $(html).css({"left": this.offset + "%"});
            $(".timeline_notchbar").append(this.notch);
            this.notch.click(this.activate);
        },

        cardOffset : function() {
            if (!this.el) return {
                onBarEdge : function() {
                    return undefined;
                }
            };

            var that = this;
            var item = this.el.children(".item");
            var currentMargin = this.el.css("margin-left");
            var timeline = $("#timeline");
            var right = (that.el.offset().left + item.width()) - (timeline.offset().left + timeline.width());
            var left = (that.el.offset().left) - timeline.offset().left;

            return {
                item : item,
                currentMargin : currentMargin,
                left  : left,
                right : right,

                onBarEdge : function() {
                    if (right > 0 && currentMargin === that.originalMargin) {
                        return 'right';
                    }

                    if (left < 0 && that.el.css("margin-left") !== that.originalMargin) {
                        return 'default';
                    }

                    if (left < 0 && that.el.css("margin-left") === that.originalMargin) {
                        return 'left';
                    }
                }
            };
        },

        position : function(e) {
            if (e.type !== "move" || !this.el) return;

            if (this.cardOffset().onBarEdge() === 'right') {
                this.el.css({"margin-left": -(this.cardOffset().item.width() + 7)}); /// AGGGHHHHHHH, fix this
                this.$(".css_arrow").css("left", this.cardOffset().item.width());
                return;
            }

            if(this.cardOffset().onBarEdge() === 'default') {
                this.el.css({"margin-left": this.originalMargin});
                this.$(".css_arrow").css("left", 0);
            }
        },

        moveBarWithCard : function() {
            var e = $.Event('moving');
            var onBarEdge = this.cardOffset().onBarEdge();

            if (onBarEdge === 'right') {
                e.deltaX = -(this.cardOffset().item.width());
                this.series.timeline.bar.moving(e);
            }
            if (onBarEdge === 'left') {
                e.deltaX = (this.cardOffset().item.width());
                this.series.timeline.bar.moving(e);
            }
            this.position($.Event('move'));
        },

        activate : function(e){
            this.hideActiveCard();
            // draw the actual card
            if (!this.el) {
                this.el = $(this.template(this.attributes));
                this.el.css({"left": this.offset + "%"});
                $("#timeline_card_scroller_inner").append(this.el);
                this.originalMargin = this.el.css("margin-left");
            }
            this.el.show().addClass("card_active");
            var max = _.max(_.toArray(this.$(".item_user_html").children()), function(el){ return $(el).width() })
            if(max !== -Infinity && $(max).width() > 150){ /// AGGGHHHHHHH, fix this
                this.$(".item_label").css("width", $(max).width());
            } else {
                this.$(".item_label").css("width", 150);
            }
            this.moveBarWithCard();
            this.notch.addClass("timeline_notch_active");
        },

        hideActiveCard : function() {
            $(".card_active").removeClass("card_active").hide();
            $(".timeline_notch_active").removeClass("timeline_notch_active");
        },

        hideNotch : function(){
            this.notch.hide().removeClass("timeline_notch_active").addClass("series_inactive");
            if(this.el) this.el.hide();
        },

        showNotch : function(){
            this.notch.removeClass("series_inactive").show();
        }

    });

    var ctor = function(){};
    var inherits = function(child, parent){
        ctor.prototype  = parent.prototype;
        child.prototype = new ctor();
        child.prototype.constructor = child;
    };

    // Controls
    var Control = function(direction){
        this.direction = direction;
        this.el = $(this.prefix + direction);
        var that = this;
        this.el.bind('click', function(e) {
            e.preventDefault();
            that.click(e);
        });
    };



    var Zoom = function(direction) {
        Control.apply(this, arguments);
    };
    inherits(Zoom, Control);

    Zoom.prototype = _.extend(Zoom.prototype, {
        prefix : ".timeline_zoom_",
        click : function() {
            curZoom += (this.direction === "in" ? +100 : -100);
            if (curZoom >= 100) {
                $(".timeline_notchbar").trigger('doZoom', [curZoom]);
            } else {
                curZoom = 100;
            }
        }
    });


    var Chooser = function(direction) {
        Control.apply(this, arguments);
        this.notches = $(".timeline_notch");
    };
    inherits(Chooser, Control);

    Chooser.prototype = _.extend(Control.prototype, {
        prefix: ".timeline_choose_",
        click: function(e){
            var el;
             /*Just commenting the following line, as the click of next and previous must be taken only to Thumbnail part,
             * So have manually added up a class to the nothces itself, in <script id="notch_tmpl" type="text/jst"> of timeline_*.html */
           // var notches    = this.notches.not(".series_inactive");

            // uncommenting again as to follow the old style of navigating to even non-thumbnails
            var notches    = this.notches.not(".series_inactive");

            var isOnlyNTMSelected = false;
            if($(".series_legend_item_inactive").length == 1){
                if($(".series_legend_item_inactive").attr("data-series") == "Thumbnails" ){

                            isOnlyNTMSelected = true;
                }
            }

            if(this.direction.indexOf("unique") >= 0){
                isOnlyNTMSelected = false;
            }else{
                isOnlyNTMSelected = true;
            }

            if(!isOnlyNTMSelected){
                  notches    = notches.not(".notch_Non-Thumbnail");
            }


            var curCardIdx = notches.index($(".timeline_notch_active"));
            var numOfCards = notches.length;
            if (this.direction === "next" || this.direction === "uniquenext") {
                el = (curCardIdx < numOfCards ? notches.eq(curCardIdx + 1) : false);
            } else {
                el = (curCardIdx > 0 ? notches.eq(curCardIdx - 1) : false);
            }
            if(!el) return;
            el.trigger("click");
        }
    });


  // takes care of the drawbacks from timeline-setter resetting problem
  window.onload = function() {
      //window.location.href = window.location.origin;
      //alert("Windows loaded back");
      if(localStorage.getItem("getHistogramPageClicked") == "true"){

          localStorage.setItem("getHistogramPageClicked","false");
          var curInputObj = JSON.parse(localStorage.getItem("curInputObj"));
          $('.argumentsForm #uriIP').val(curInputObj["uri"]);
          $('.argumentsForm #urirIP').val(curInputObj["urir"]);
          $('.argumentsForm #collectionNo').val(curInputObj["collectionIdentifer"]);
          $('.argumentsForm #hammingDistance').val(curInputObj["hammingDistance"] );
          $('.argumentsForm input[value='+curInputObj["primesource"] +']').prop("checked",true).trigger("click");
          getHistogramPage(); // this makes the call for getting the initial stats.
      }else{
        //alert("doesn't have the local storage set, using the Query parameters");
        //GET Request-> "http://localhost:3000/GetResponse/?URI-R=http://4genderjustice.org/&ci=1068&primesource=archiveit&hdt=4"
        var pathname = window.location.pathname;
        if(pathname == "/" || pathname == "/index.html"){
          return true;
        }else{
          if(updateDeepLinkStateArr()){

            $('.argumentsForm #uriIP').val(curDeepLinkStateArr[5]);
            $('.argumentsForm #urirIP').val(curDeepLinkStateArr[5]);
            $('.argumentsForm #collectionNo').val( curDeepLinkStateArr[2]);
            var hammingDistance = curDeepLinkStateArr[3];
            if(hammingDistance == "" || hammingDistance == undefined || hammingDistance == null){
                hammingDistance = 4;
            }

            $('.argumentsForm #hammingDistance').val(hammingDistance);
            $('.argumentsForm #hammingdistanceValue').html(hammingDistance);
            $('.argumentsForm .primesrcsection input[type=radio][value='+ curDeepLinkStateArr[1] +']').prop("checked",true).trigger("click");
            if(curDeepLinkStateArr[4] == "stats"){
		      getStats();
	        }else if(curDeepLinkStateArr.length > 6){
		      console.log(curDeepLinkStateArr);
		      var from = curDeepLinkStateArr[6].substring(0,4)+"/"+curDeepLinkStateArr[6].substring(4,6)+"/"+curDeepLinkStateArr[6].substring(6,8);
		      var to = curDeepLinkStateArr[7].substring(0,4)+"/"+curDeepLinkStateArr[7].substring(4,6)+"/"+curDeepLinkStateArr[7].substring(6,8);
		      
			  var fromDate = formatDateRange(from);
			  var toDate = formatDateRange(to);
			  var theDateRange = "Requested Date Range: " + fromDate + " - " + toDate;
			  $(".statsWrapper .Memento_Date_Range").html(theDateRange);
                
			  getDateRangeSummary(fromDate, toDate);

	        }else if(curDeepLinkStateArr[4] == "summary"){
                getSummary();
            }else{
              getHistogramPage();
            }
          }else{
              return false;
          }
        }
      }
  }

function uriAnalysisForAttributes(uri){
  if(uri == ""){
    return;
  }
  var urir;
  if(uri.match(/\/[0-9]{14}\//g) == null){
    if(uri.match(/\/\*\//g) != null){ // incase the given URI is timemap URI-TM
      tmIndicator = uri.match(/\/\*\//g)[0];
      urir = uri.split(tmIndicator)[1]; // uri is here now
      var prePartToURIR = uri.split(tmIndicator)[0];
      var hdt = 4;
      var primesource = "";
      var ci = "all";
      if(prePartToURIR.indexOf("archive-it") > -1){
        primesource = "archiveit";
        ci = parseInt(prePartToURIR.match(/org\/[0-9]*/g)[0].split("/")[1]); // checking for a numerical valuef or COllection Identifier
        if(isNaN(ci)){
            ci = "all";
        }
      }else if(prePartToURIR.indexOf("archive.org") > -1){
        primesource = "internetarchive";
      }else{
        alert("not a valid input for URI, pass a valid URI-R || URI-M || URI-TM");
        return false;
      }
      $('.argumentsForm #urirIP').val(urir);
      $('.argumentsForm #collectionNo').val(ci);
      $('.argumentsForm input[value='+primesource+']').prop("checked",true).trigger("click");

    }else{
      urir = uri; // one and the same - case where the URI-R is directly given
      $('.argumentsForm #urirIP').val(urir);
    }
  }else{ // Incase of URI-M
    dtstr = uri.match(/\/[0-9]{14}\//g)[0];
    urir = uri.split(dtstr)[1]; // uri is here now
    var prePartToURIR = uri.split(dtstr)[0];
    var hdt = 4;
    var primesource = "";
    var ci = "all";
    if(prePartToURIR.indexOf("archive-it") > -1){
      primesource = "archiveit";
      ci = parseInt(prePartToURIR.match(/org\/[0-9]*/g)[0].split("/")[1]);
      if(isNaN(ci)){
          ci = "all";
      }
    }else if(prePartToURIR.indexOf("archive.org") > -1){
      primesource = "internetarchive";
    }else{
      alert("not a valid input for URI, pass a valid URI-R or URI-M");
      return false;
    }
    $('.argumentsForm #urirIP').val(urir);
    $('.argumentsForm #collectionNo').val(ci);
    $('.argumentsForm input[value='+primesource+']').prop("checked",true).trigger("click");
  }
}
var notificationSrc= null;

function startEventNotification(){
  notificationSrc= new EventSource('/notifications/'+getUniqueUserSessionId());
  var preVal = 2;
       notificationSrc.onmessage = function(e) {
           console.log(e.data);
           var streamedObj = JSON.parse(e.data);
           // if(streamedObj.usid != uniqueSessionId){
           //     return false;
           // }
           var curLog = "<p>"+streamedObj.data+"</p>";


           if(streamedObj.data === "streamingStarted"){

               $('#serverStreamingModal .logsContent').empty();
               $('#logtab .logsContent').empty();

               setProgressBar(2);
               // un comment the following line after POC
               if($(".tabContentWrapper").css("display") == "none"){
                 $('#serverStreamingModal').modal('show');
               }

           }else if (streamedObj.data.indexOf("percentagedone-") == 0) {
              value = parseInt(streamedObj.data.split("-")[1]);
              if (value > preVal){
                preVal = value;
              }
              if(preVal > 100){
                preVal = 95;
              }
             setProgressBar(preVal);
               if(preVal == 100){
                    $('#serverStreamingModal').hide();
               }
           }
           else if( streamedObj.data === "readyToDisplay"){
           //  alert(" Ready for display");
           //  $(".getSummary").trigger("click");
             $('#serverStreamingModal .logsContent').empty();

             // Temparory disabled for this step: for avoiding the refresh issue... automatically refreshing the page when the results are available
               //window.location.reload();

            setProgressBar(2);
             $('#serverStreamingModal').modal('hide');
             $(".tabContentWrapper").show();
             if(notificationSrc != null){
               notificationSrc.close();
             }
           }
           else if(streamedObj.data === "statssent"){
               $('#serverStreamingModal .logsContent').empty();
                setProgressBar(2);
                // for avoiding the refresh issue... automatically refreshing the page when the results are available
                //window.location.reload();
               $('#serverStreamingModal').modal('hide');
               if(notificationSrc != null){
                 notificationSrc.close();
               }
             }
           else{
             $("#serverStreamingModal .logsContent").prepend(curLog);
              $('#logtab .logsContent').prepend(curLog);
             // $('#serverStreamingModal .modal-body').animate({
             //      scrollTop: $("#bottomModal").offset().top
             //  }, 20);
           }
       };
}


function setProgressBar(value){
  $(".progress-bar-space .progress-bar-striped").html(value+"%");
  $(".progress-bar-space .progress-bar-striped").attr("aria-valuenow", value);
  $(".progress-bar-space .progress-bar-striped").css("width",value+"%");
}

function getHistogramPage(){
    var toDisplay= "Internet Archive";
    if($("input[name='primesource']:checked").val() == "archiveit" ){
        toDisplay= "Archive-It";
    }
    getHistoData(toDisplay);
    $(".getStats").click(function(event){
        getStats();
    });
}
    
function getHistoData(toDisplay){
  var collectionIdentifer = $('.argumentsForm #collectionNo').val().trim();
  if(collectionIdentifer == ""){
      collectionIdentifer = "all";
  }
  //var hammingDistance = $('.argumentsForm #hammingDistance').val();
  var hammingDistance = $(".statsWrapper .on").val();

  if(hammingDistance == "" || hammingDistance===undefined){
    hammingDistance = $('.argumentsForm #hammingDistance').val();
  }

  var role = "histogram";
  if($("body").find("form")[0].checkValidity()){
        $(".time_container").hide();
        $(".Explain_Threshold").hide();
       var pathForAjaxCall = "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+"0"+"/"+"0" +"/" +$('.argumentsForm #urirIP').val().trim();

       startEventNotification();
       var ENDPOINT = "/alsummarizedtimemap";
       var address= ENDPOINT+ pathForAjaxCall;  //var address= ENDPOINT+"/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+$('.argumentsForm #urirIP').val()
       $("#busy-loader").show();
       $('#serverStreamingModal .logsContent').empty();
       $('#serverStreamingModal').modal('show');
      $.ajax({
        type: "GET",
        url: address, // uncomment this for deployment
        beforeSend: function(xhr) {
            xhr.setRequestHeader("x-my-curuniqueusersessionid",  getUniqueUserSessionId());
        },
        dataType: "text",
        timeout: 0,
        success: function( data, textStatus, jqXHR) {
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
          try{
              data = $.trim(data).split("...");
              if(data.length > 1){
                  if(data [1] == ""){
                      data = data [0];
                  }else{
                      data = data [1];
                  }
              }
              else{
                  data = data [0];
              }

              histoData= $.parseJSON(data);
	      console.log(histoData);
              if(histoData.length > 12){
                  document.getElementById('generateAllThumbnails').style.display = "none";
              }
              document.getElementById("histoWrapper").style.display = "block";
	      var endPoint = histoData.length - 1;

	      var fromYear = histoData[0].event_display_date.substring(0,4);
	      var fromMonth = histoData[0].event_display_date.substring(5,7);
	      var fromDate = histoData[0].event_display_date.substring(8,10);

	      var toYear = histoData[endPoint].event_display_date.substring(0,4);
	      var toMonth = histoData[endPoint].event_display_date.substring(5,7);
	      var toDate = histoData[endPoint].event_display_date.substring(8,10);

	      var fromDateStr= fromYear+"-"+fromMonth +"-"+fromDate;
	      var toDateStr= toYear+"-"+toMonth +"-"+toDate;
	      var dateRangeStr= fromDateStr + " - " + toDateStr;
	      $(".histoWrapper .Mementos_Considered").html("TimeMap from "+ toDisplay +": "+ histoData.length +" mementos | "+dateRangeStr);
              getHistogram(toDisplay, histoData);
          $(".modal-backdrop").remove();
          $('#serverStreamingModal').modal('hide');
          }
          catch(err){
            alert("Some problem fetching the response, Please refresh and try again.");
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
            $(".tabContentWrapper").hide();
          }
        },
        error: function( data, textStatus, jqXHR, err) {
          var errMsg = "Some problem fetching the response, Please refresh and try again.";
          $("#busy-loader").hide();
          $('#serverStreamingModal').modal('hide');
          console.log("readyState: " + jqXHR.readyState);
          console.log("responseText: "+ jqXHR.responseText);
          console.log("status: " + jqXHR.status);
          console.log("text status: " + textStatus);
          console.log("error: " + err);
          alert(errMsg);
        }
      });
    }
}
   
function getStats(){
  document.getElementById("histoWrapper").style.display = "none";
  var collectionIdentifer = $('.argumentsForm #collectionNo').val();
  if(collectionIdentifer == ""){
      collectionIdentifer = "all";
  }
  var hammingDistance = $('.argumentsForm #hammingDistance').val();
  if(hammingDistance == ""){
      hammingDistance = 4;
  }

  var role = "stats";
  if($("body").find("form")[0].checkValidity()){
      startEventNotification();
      var ENDPOINT = "/alsummarizedtimemap";
      var address= ENDPOINT+"/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+"0"+"/"+"0"+"/"+$('.argumentsForm #urirIP').val();
      $("#busy-loader").show();
      $('#serverStreamingModal .logsContent').empty();
       $('#logtab .logsContent').empty();
	var path = "/alsummarizedview" + "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+$('.argumentsForm #urirIP').val();
       history.pushState({},"Stats State",path);
      $('#serverStreamingModal').modal('show');
      $.ajax({
            type: "GET",
            url: address, // uncomment this for deployment
            beforeSend: function(xhr) {
                xhr.setRequestHeader("x-my-curuniqueusersessionid",  getUniqueUserSessionId());
            },
            dataType: "text",
            timeout: 90000000,
            success: function( data, textStatus, jqXHR) {
                $("#busy-loader").hide();
                $('#serverStreamingModal .logsContent').empty();
                $('#serverStreamingModal').modal('hide');
                try{
                    jsonObjRes= $.parseJSON(data);
                    var htmlStr="&nbsp;";
                    var curUniqThumbCount = 0;
                    jsonObjRes.forEach(function(item,index,arry){
                      if(curUniqThumbCount != item['unique']){
                        htmlStr+= "<button type='button' class='btn btn-secondary' name='thresholdDistance' title='No Of unique thumbnails:"+item['unique'] +"' timetowait='"+item['timetowait']+"' value='"+ item['threshold']+"'>"+item['unique'] +"</button>";
                      }
                        curUniqThumbCount = item['unique'];
                    });

                    var memStatStr = htmlStr;
                    var toDisplay= "Internet Archive";
                    if($("input[name='primesource']:checked").val() == "archiveit" ){
                      toDisplay= "Archive-It";
                    }
                    var fromDate= new Date(jsonObjRes[0].fromdate);
                    var fromDateStr= fromDate.getFullYear()+"-"+fromDate.getMonth() +"-"+fromDate.getDate();
                    var toDate = new Date(jsonObjRes[0].todate);
                    var toDateStr= toDate.getFullYear()+"-"+toDate.getMonth() +"-"+toDate.getDate();
                    var dateRangeStr= fromDateStr + " - " + toDateStr;
                    $(".statsWrapper .Mementos_Considered").html("TimeMap from "+toDisplay +": "+ jsonObjRes[0]["totalmementos"] +" mementos | "+dateRangeStr);
                    $(".paraOnlyOnStatsResults").show();
                    
                    $(".statsWrapper .collection_stats").html(memStatStr);


                    //  $(".statsWrapper .collection_stats").attr("title","Date Range: "+dateRangeStr)
                    if(  $(".statsWrapper button[type='button']").eq(1).length != 0){
                      $(".statsWrapper button[type='button']").eq(1).trigger("click");
                    }else{
                      $(".statsWrapper button[type='button']").eq(0).trigger("click");
                    }

                    $(".statsWrapper").show();
                    $(".getSummary").show();


                    //$(".approxTimeShowingPTag").show(800).delay(5000).fadeOut();
                    $(".modal-backdrop").remove();
                    $('#serverStreamingModal').modal('hide');

                }catch(err){
                    alert($.trim(data));
                    $('#serverStreamingModal .logsContent').empty();
                      $('#serverStreamingModal').modal('hide');
                    $(".statsWrapper").hide();
                    $(".tabContentWrapper").hide();
                }
            },
            error: function( data, textStatus, jqXHR,err) {
              // $("#busy-loader").hide();
              // $('#serverStreamingModal .logsContent').empty();
              //   $('#serverStreamingModal').mo dal('hide');
               var errMsg = "Some problem fetching the response, Please refresh and try again.";   
              console.log("readyState: " + jqXHR.readyState);
              console.log("responseText: "+ jqXHR.responseText);
              console.log("status: " + jqXHR.status);
              console.log("text status: " + textStatus);
              console.log("error: " + err);
              if(textStatus == 'error')
              {
                window.location.reload();
              }else{
                alert(errMsg);
              }
            }
        });
      }
}

function getSummary(){
    
  // Remove histogram
  document.getElementById("histoWrapper").style.display = "none";
    
  var collectionIdentifer = $('.argumentsForm #collectionNo').val().trim();
  if(collectionIdentifer == ""){
      collectionIdentifer = "all";
  }
  //var hammingDistance = $('.argumentsForm #hammingDistance').val();
  var hammingDistance = $(".statsWrapper .on").val();
    
  if (generateAllClicked == true) {
    hammingDistance = "0";
  }

  if(hammingDistance == "" || hammingDistance===undefined){
    hammingDistance = $('.argumentsForm #hammingDistance').val();
  }

  var role = "summary"; // basically this is set to "stats" if the First Go button is clicked, will contain "summary" as the value if Continue button is clicked
  if($("body").find("form")[0].checkValidity()){
        $(".time_container").hide();
        $(".Explain_Threshold").hide();
       var pathForAjaxCall = "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+"0"+"/"+"0"+"/" +$('.argumentsForm #urirIP').val().trim();

       var summaryPath = "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role +"/"+ $('.argumentsForm #urirIP').val().trim();

       var summaryStatePath = "/alsummarizedview" +summaryPath;
       changeToSummaryState(summaryStatePath);

       startEventNotification();
       var ENDPOINT = "/alsummarizedtimemap";
       var address= ENDPOINT+ pathForAjaxCall;  //var address= ENDPOINT+"/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+$('.argumentsForm #urirIP').val()
       $("#busy-loader").show();
       $('#serverStreamingModal .logsContent').empty();
       $('#serverStreamingModal').modal('show');
      $.ajax({
        type: "GET",
        url: address, // uncomment this for deployment
        beforeSend: function(xhr) {
          xhr.setRequestHeader("x-my-curuniqueusersessionid",  getUniqueUserSessionId());
        },
        dataType: "text",
        timeout: 0,
        success: function( data, textStatus, jqXHR) {
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
          try{
              data = $.trim(data).split("...");
              if(data.length > 1){
                  if(data [1] == ""){
                      data = data [0];
                  }else{
                      data = data [1];
                  }
              }
              else{
                  data = data [0];
              }

              jsonObjRes= $.parseJSON(data);
              // following code segment makes the screenshot URI got with event_html | event_html_similarto properties to a html fragment
              jsonObjRes[0].event_html= "<img src='"+jsonObjRes[0].event_html+"' width='300px' />";
              var noOfUniqueMementos = 1;
              for(var i=1;i< jsonObjRes.length;i++){
                  jsonObjRes[i].event_html= "<img src='"+jsonObjRes[i].event_html+"' width='300px' />";
                  jsonObjRes[i].event_html_similarto= "<img src='"+jsonObjRes[i].event_html_similarto+"' width='300px' />";
              }


              var dateRangeStr= jsonObjRes[0].event_display_date.split(",")[0] + " - " + jsonObjRes[jsonObjRes.length-1].event_display_date.split(",")[0];
              var toDisplay= "Internet Archive";
              if($("input[name='primesource']:checked").val() == "archiveit" ){
                toDisplay= "Archive-It";
              }

              $(".statsWrapper .Mementos_Considered").html("TimeMap from "+toDisplay +": "+ jsonObjRes.length +" mementos | "+dateRangeStr);
              $(".paraOnlyOnStatsResults").hide();
              $(".statsWrapper").show();

               window.timeline = new Timeline(jsonObjRes);
              // place where the notch width is being reduced t0 2px.
              $("[data-notch-series='Non-Thumbnail Mementos']").width("2px");
              // Color is changed in the Array at 284 line as that is the right place
              // $("[data-notch-series='Non-Thumbnail Mementos']").css("background","#948989");
              new Zoom("in");
              new Zoom("out");
              var chooseNext = new Chooser("next");
              var choosePrev = new Chooser("prev");
              var chooseUniqueNext = new Chooser("uniquenext");
              var chooseUniquePrev = new Chooser("uniqueprev");
              chooseNext.click();
              $(document).bind('keydown', function(e) {
                  if (e.keyCode === 39) {
                      chooseNext.click();
                  } else if (e.keyCode === 37) {
                      choosePrev.click();
                  } else {
                      return;
                  }
              });
              console.log(jsonObjRes);
              drawImageGrid(jsonObjRes); // calling Image Grid Function here
              drawImageSlider(jsonObjRes);
              getImageArray(); //calling GIF function
              $(".modal-backdrop").remove();
              $('#serverStreamingModal').modal('hide');
          }
          catch(err){
            alert("Some problem fetching the response, Please refresh and try again.");
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
            $(".tabContentWrapper").hide();
          }
        },
        error: function( data, textStatus, jqXHR, err) {
          var errMsg = "Some problem fetching the response, Please refresh and try again.";
          $("#busy-loader").hide();
          $('#serverStreamingModal').modal('hide');
          console.log("readyState: " + jqXHR.readyState);
          console.log("responseText: "+ jqXHR.responseText);
          console.log("status: " + jqXHR.status);
          console.log("text status: " + textStatus);
          console.log("error: " + err);
          
          if(textStatus == 'error')
          {
            window.location.reload();
          }else{
            alert(errMsg);
          }
        }
      });
    }
    //resetting this in order to have an option of unique thumbnails
    generateAllThumbnails = false;
}

function getDateRangeSummary(from, to){
	
  // Remove histogram
  document.getElementById("histoWrapper").style.display = "none";
    
  var collectionIdentifer = $('.argumentsForm #collectionNo').val().trim();
  if(collectionIdentifer == ""){
      collectionIdentifer = "all";
  }
  //var hammingDistance = $('.argumentsForm #hammingDistance').val();
  var hammingDistance = $(".statsWrapper .on").val();

  if(hammingDistance == "" || hammingDistance===undefined){
    hammingDistance = $('.argumentsForm #hammingDistance').val();
  }

  var fromFormatted = from.substring(0,4)+from.substring(5,7)+from.substring(8,10);
  var toFormatted = to.substring(0,4)+to.substring(5,7)+to.substring(8,10);

  var role = "summary"; // basically this is set to "stats" if the First Go button is clicked, will contain "summary" as the value if Continue button is clicked
  if($("body").find("form")[0].checkValidity()){
        $(".time_container").hide();
        $(".Explain_Threshold").hide();
       var pathForAjaxCall = "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+from+"/"+to+"/" +$('.argumentsForm #urirIP').val().trim();
       console.log("Made it here!");

       var summaryPath = "/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+"/"+fromFormatted+"/"+toFormatted+"/" +$('.argumentsForm #urirIP').val().trim();
       var summaryStatePath = "/alsummarizedview" +summaryPath;
       changeToSummaryState(summaryStatePath);

       startEventNotification();
       var ENDPOINT = "/alsummarizedtimemap";
       var address= ENDPOINT+ pathForAjaxCall;  //var address= ENDPOINT+"/"+$('.argumentsForm input[name=primesource]:checked').val()+"/"+collectionIdentifer+"/"+hammingDistance+"/"+role+from+to"/"+$('.argumentsForm #urirIP').val()
       $("#busy-loader").show();
       $('#serverStreamingModal .logsContent').empty();
       $('#serverStreamingModal').modal('show');
      $.ajax({
        type: "GET",
        url: address, // uncomment this for deployment
        beforeSend: function(xhr) {
          xhr.setRequestHeader("x-my-curuniqueusersessionid",  getUniqueUserSessionId());
        },
        dataType: "text",
        timeout: 0,
        success: function( data, textStatus, jqXHR) {
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
          try{
              data = $.trim(data).split("...");
              if(data.length > 1){
                  if(data [1] == ""){
                      data = data [0];
                  }else{
                      data = data [1];
                  }
              }
              else{
                  data = data [0];
              }

              jsonObjRes= $.parseJSON(data);
              // following code segment makes the screenshot URI got with event_html | event_html_similarto properties to a html fragment
              jsonObjRes[0].event_html= "<img src='"+jsonObjRes[0].event_html+"' width='300px' />";
              var noOfUniqueMementos = 1;
              for(var i=1;i< jsonObjRes.length;i++){
                  jsonObjRes[i].event_html= "<img src='"+jsonObjRes[i].event_html+"' width='300px' />";
                  jsonObjRes[i].event_html_similarto= "<img src='"+jsonObjRes[i].event_html_similarto+"' width='300px' />";
              }


              var dateRangeStr= jsonObjRes[0].event_display_date.split(",")[0] + " - " + jsonObjRes[jsonObjRes.length-1].event_display_date.split(",")[0];
              var toDisplay= "Internet Archive";
              if($("input[name='primesource']:checked").val() == "archiveit" ){
                toDisplay= "Archive-It";
              }

              $(".statsWrapper .Mementos_Considered").html("TimeMap from "+toDisplay +": "+ jsonObjRes.length +" mementos | "+dateRangeStr);
              $(".paraOnlyOnStatsResults").hide();
              $(".statsWrapper").show();

              window.timeline = new Timeline(jsonObjRes);
              // place where the notch width is being reduced t0 2px.
              $("[data-notch-series='Non-Thumbnail Mementos']").width("2px");
              // Color is changed in the Array at 284 line as that is the right place
              // $("[data-notch-series='Non-Thumbnail Mementos']").css("background","#948989");
              new Zoom("in");
              new Zoom("out");
              var chooseNext = new Chooser("next");
              var choosePrev = new Chooser("prev");
              var chooseUniqueNext = new Chooser("uniquenext");
              var chooseUniquePrev = new Chooser("uniqueprev");
              chooseNext.click();
              $(document).bind('keydown', function(e) {
                  if (e.keyCode === 39) {
                      chooseNext.click();
                  } else if (e.keyCode === 37) {
                      choosePrev.click();
                  } else {
                      return;
                  }
              });
              console.log(jsonObjRes);
              drawImageGrid(jsonObjRes); // calling Image Grid Function here
              drawImageSlider(jsonObjRes);
              getImageArray(); //calling GIF function
              $(".modal-backdrop").remove();
              $('#serverStreamingModal').modal('hide');
	      //localStorage.setItem("submitRangeClicked", "false");
          }
          catch(err){
            alert("Some problem fetching the response, Please refresh and try again.");
            $("#busy-loader").hide();
            $('#serverStreamingModal').modal('hide');
            $(".tabContentWrapper").hide();
          }
        },
        error: function( data, textStatus, jqXHR) {
          var errMsg = "Some problem fetching the response, Please refresh and try again.";
          $("#busy-loader").hide();
          $('#serverStreamingModal').modal('hide');
          console.log("readyState: " + jqXHR.readyState);
          console.log("responseText: "+ jqXHR.responseText);
          console.log("status: " + jqXHR.status);
          console.log("text status: " + textStatus);
          console.log("error: " + err);
          if(textStatus == 'error')
          {
            window.location.reload();
          }else{
            alert(errMsg);
          }
        }
      });
    }
}

$(function(){
  $(".cancelProcess").click(function(event){

    //console.log("Cancel clicked");
    localStorage.removeItem("getHistogramPageClicked");
    localStorage.removeItem("curInputObj");
    //window.location.reload();
    window.location = "/";
    
  });

    // Analyses the input pattern and finds all the parameters
    $(document).on('focusout','#uriIP',function(){
          var uri = $(this).val();
          uriAnalysisForAttributes(uri);
    });
    //var source = new EventSource('/notifications/'+getCookie("clientId"));

     // following is commented to first stabilise the single step process
    $(".getJSONFromServer").click(function(event){


        event.preventDefault();
        uriAnalysisForAttributes($("#uriIP").val().trim());
        $(".tabContentWrapper").hide();
        $(".statsWrapper").hide();
        var collectionIdentifer = $('.argumentsForm #collectionNo').val().trim();
        if(collectionIdentifer == ""){
            collectionIdentifer = "all";
        }
        var hammingDistance = $('.argumentsForm #hammingDistance').val().trim();
        if(hammingDistance == ""){
            hammingDistance = 4;
        }

        var role = "histogram"
        if($(this).parents("body").find("form")[0].checkValidity()){
            localStorage.setItem("getHistogramPageClicked", "true");
            var curInputJsobObj = {};
            curInputJsobObj["uri"]= $("#uriIP").val().trim();
            curInputJsobObj["urir"]= $("#urirIP").val().trim();
            curInputJsobObj["primesource"]= $('.argumentsForm input[name=primesource]:checked').val();
            if(curInputJsobObj["primesource"]=="internetarchive"){
              curInputJsobObj["collectionIdentifer"]= "all";

            }else{
              curInputJsobObj["collectionIdentifer"]= $('.argumentsForm #collectionNo').val().trim();

            }
            if(!parseInt(curInputJsobObj["collectionIdentifer"])){
              curInputJsobObj["collectionIdentifer"] = "all";
            }
            curInputJsobObj["hammingDistance"]=   $('.argumentsForm #hammingDistance').val();
            curInputJsobObj["role"]= role;
            localStorage.setItem("curInputObj", JSON.stringify(curInputJsobObj));
            //window.location.reload();
            if(notificationSrc != null){
              notificationSrc.close();
            }
            window.location.href = window.location.origin+generateDeepLinkState(curInputJsobObj);
        }else{
          if( $("#uriIP").val().trim()==""){
            alert("Please enter an URI-R, required field.");
          }
        }
      });

    // work around for the timeline setting stuff
    $(".getSummary").click(function(event){
      getSummary();
    });
	
    $("#submitRange").click(function(event){
	//localStorage.setItem("submitRangeClicked,"true");
	var from = document.getElementById("fromInput").value;
	var to = document.getElementById("toInput").value;

	from.toString();
	to.toString();
	    
     	if(isValidDate(from) && isValidDate(to)){
		var fromDate = formatDateRange(from);
		var toDate = formatDateRange(to);
		var theDateRange = "Requested Date Range: " + fromDate + " - " + toDate;
		$(".statsWrapper .Memento_Date_Range").html(theDateRange);
		getDateRangeSummary(fromDate, toDate);
	}
	else{
		document.getElementById('date_error').style.display = "block";
	}
    });
    
    $("#generateAllThumbnails").click(function(event){
        generateAllClicked = true;
        getSummary();
    });

    $(document).ready(function () {
        $(document).on("click",".close_button", function(){
            if($(this).hasClass('off'))
            {
                $(this).addClass('on');
                $(this).removeClass('off');
                this.parentElement.style.opacity = '.3';
                mementosToRemove.push($(this).parent().find("img").attr("src"));
            }
            else
            {
                $(this).addClass('off');
                $(this).removeClass('on');
                this.parentElement.style.opacity = '1';
                var found_it = mementosToRemove.indexOf($(this).parent().find("img").attr("src"));
                mementosToRemove.splice(found_it,1);
            }
            console.log(mementosToRemove);
        });
    });

    $("#updateMementos").click(function(event){
        //upon button click images marked for deletion must be removed
        //from array passed to functions
        if(mementosToRemove.length == imagesData_IG.length)
        {
            document.getElementById("updateMementosError").innerHTML = "Cannot delete all mementos.";
        }
        else if(mementosToRemove.length > 0)
        {
            document.getElementById("updateMementosError").innerHTML = "";
            document.getElementById("revertMementos").style.display = "block";
            $("#gifApp").empty();
            for(var i = 0; i < mementosToRemove.length; i++)
            {
                for(var j = 0; j < jsonObjRes.length; j++)
                {
                    if($(jsonObjRes[j].event_html).attr("src") == mementosToRemove[i])
                    {
                        jsonObjRes.splice(j, 1);
                        break;
                    }
                }
            }
            drawImageSlider(jsonObjRes);
            drawImageGrid(jsonObjRes);
            getImageArray();
            mementosToRemove = [];
        }
        else
        {
            document.getElementById("updateMementosError").innerHTML = "Please select mementos for removal.";
        }
    });

    $("#revertMementos").click(function(event){
        location.reload();
    });

    $(document).on("click","button[name=thresholdDistance]",function(){
      $('button[name=thresholdDistance].on').removeClass('on')
      $(this).addClass("on");
      if($(this).attr("timetowait") == 0){
        $(".approxTimeShowingPTag").html(' <1 minute ');
      }else{
        $(".approxTimeShowingPTag").html('<label class="timetowait">'+$(this).attr("timetowait") +'</label> minutes ');
      }
    });

  });
})(window, document);

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function delete_cookie (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getUniqueUserSessionId() {
  if(curUniqueUserSessionID == null){
    curUniqueUserSessionID = Date.now()*Math.floor((Math.random() * 10) + 1);
    return curUniqueUserSessionID;
  }else{
    return curUniqueUserSessionID;
  }
}



function generateDeepLinkState(curInputJsobObj){
  return "/alsummarizedview/"+curInputJsobObj["primesource"]+"/"+curInputJsobObj["collectionIdentifer"]+"/"+curInputJsobObj["hammingDistance"]+"/"+curInputJsobObj["role"]+"/"+curInputJsobObj["urir"];
}

function generateDeepLinkStateForSummary(curInputJsobObj){
  return "/alsummarizedview/"+curInputJsobObj["primesource"]+"/"+curInputJsobObj["collectionIdentifer"]+"/"+curInputJsobObj["hammingDistance"]+"/"+curInputJsobObj["role"]+"/"+curInputJsobObj["urir"];
}

function changeToSummaryState(curURLState) {
    var state = {},
        title = "Smmary State",
        path  = curURLState;
    history.pushState(state, title, path);
}

function updateDeepLinkStateArr() {
    //format of the deep link: http://localhost:3000/alsummarizedview/archiveit/1068/4/stats/http://4genderjustice.org/
    //curDeepLinkStateArr=[alsummarizedview,archiveIt,1068,4,stats,http://4genderjustice.org];
    var pathname = window.location.pathname;
    var deepLinkStr = pathname.slice(1);
    var deepLinkParts = deepLinkStr.split("/");
    if(deepLinkParts[0] == "alsummarizedview" && (deepLinkParts[1].toLowerCase()=="archiveit" || deepLinkParts[1].toLowerCase()=="internetarchive"  )  && (deepLinkParts[4]=="stats" || deepLinkParts[4]=="summary" || deepLinkParts[4]=="histogram")){
      curDeepLinkStateArr[0] = deepLinkParts[0];
      curDeepLinkStateArr[1] = deepLinkParts[1];
      curDeepLinkStateArr[4]= deepLinkParts[4];
      if(isNaN(deepLinkParts[2]) ){ //taking care of CI
        if(deepLinkParts[2] != "all"){
          alert("The value after 3rd backword slash(/) has to be either a numeric value or 'all', Please correct that !");
          return false;
        }
      }
      if(isNaN(deepLinkParts[3])){ // hamming distance is not being a number
        alert("The value after 4th backword slash(/) has to be a numeric value, Please correct that !");
        return false;
      }
      else{
        curDeepLinkStateArr[2] = deepLinkParts[2];
        curDeepLinkStateArr[3]= deepLinkParts[3];
        if(curDeepLinkStateArr[4] == "summary" && !(isNaN(Number(deepLinkParts[5]))) && !(isNaN(Number(deepLinkParts[6]))))
        {
            curDeepLinkStateArr[6] = deepLinkParts[5];
            curDeepLinkStateArr[7] = deepLinkParts[6];
            curDeepLinkStateArr[5] = deepLinkStr.split("/"+curDeepLinkStateArr[7]+"/")[1];

        }
        else    
            curDeepLinkStateArr[5] = deepLinkStr.split("/"+deepLinkParts[4]+"/")[1];

        return true;
      }
    }else{
      alert("Something went wrong with the request URI");
      return false;
    }

}

function formatDateRange(dateInput){	
	var Month = dateInput.substring(5,7);
	var Date = dateInput.substring(8,10);
	var Year = dateInput.substring(0,4);
	
	var fullDate = Year + "-" + Month + "-" + Date;
	return fullDate;
}

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{4}\/\d{2}\/\d{2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Find index of last memento
    var endPoint = histoData.length - 1;
	
    // Get date of first memento
    var fromYear = histoData[0].event_display_date.substring(0,4);
    var fromMonth = histoData[0].event_display_date.substring(5,7);
    fromMonth = fromMonth - 1;
    var fromDay = histoData[0].event_display_date.substring(8,10);
	
    // Get date of last memento
    var toYear = histoData[endPoint].event_display_date.substring(0,4);
    var toMonth = histoData[endPoint].event_display_date.substring(5,7);
    toMonth = toMonth - 1;
    var toDay = histoData[endPoint].event_display_date.substring(8,10);
	
    month = month - 1;
    
    // Create date objects
    var from = new Date(fromYear, fromMonth, fromDay);
    var to = new Date(toYear, toMonth, toDay);
    var compareDate = new Date(year, month, day);
    
    // Check if input within possible range of mementos
    if(compareDate < from || compareDate > to){
	    console.log("out of range");
	    return false;
    }
    // Check the range of the day
    return day > 0 && day <= monthLength[month];
};

window.addEventListener('popstate', function(e) {
    location.reload();
});
