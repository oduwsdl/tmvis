/* global $ */

function conditionallyLoadInterface () { // Based on whether the Simhash has been generated
  // console.log("Looking for "+metadata.simhashCacheURI+".json")
  $.ajax({
    url: metadata.simhashCacheURI + '.json'
  }).done(function (data, textStatus, xhr) {
    console.log('A Simhash cache file exists! Loading the interface')
    $('#dataState').html('')
    returnedJSON = data // Replace original JSON without URIs with post-simhash
    displayVisualization()
  }).fail(function (data, textStatus, xhr) {
    // console.log(textStatus)
    console.log('No Simhash cache file exists! Waiting for generation to finish.')
    $('#dataState').html($('#dataState').html() + '.')
    // console.log("TODO: here we would update the status message instead of simply adding another dot.")
    window.setTimeout(conditionallyLoadInterface, 500)
  })
}


function pollThenReplaceImage (img) {
  img.onerror = null
  img.onError = null
  $('#' + img.id).error(function () {}) // Mandatory callback?
  img.onerror = ''

  console.log('pollThenReplaceImage() ' + img.src)
  checkAgainIfImageExists(img)
  img.src = `${localAssetServer}_images/spinnerStatic.png`
}

function displayVisualization () {
  console.log(returnedJSON)
  if (!returnedJSON) {
    console.log('returnedJSON is null in displayVisualization')
  }
  // var str = "<table>"
  var cfstr = '<div id="coverflow">'
  for (var i = 0; i < returnedJSON.length; i++) {
    // Don't show the low hamming distance images in coverflow, previously also considered i==0
    if (returnedJSON[i].screenshotURI == null) {
      continue
    }

    cfstr +=
      `<div class="image-block" data-hammingDistance="${returnedJSON[i].hammingDistance}">
        <img width="200" height="200" onError="pollThenReplaceImage(this);" src='${localAssetServer}_images/spinnerStatic.png' id='${returnedJSON[i].screenshotURI.slice(0, -4)}_200' title='${localAssetServer}screenshots/${returnedJSON[i].screenshotURI.replace(".png", "_200.png")}' />
        <div class="caption">
         <h2>${returnedJSON[i].datetime}</h2>
         <h2><a target="_blank" href="${returnedJSON[i].uri}">${returnedJSON[i].uri}</a></h2>
         <h2 class="simhashValue">SimHash: ${returnedJSON[i].simhash}</h2>
         <h2 class="hammingDistanceValue">Hamming Distance: ${(returnedJSON[i].hammingDistance ? returnedJSON[i].hammingDistance: "N/A")}</h2>
       </div><!-- End caption, ideally this should use figure and figcaption tags -->
       <div class="reflection">
        <img width="200" height="200" onError="pollThenReplaceImage(this);" src="${localAssetServer}_images/spinnerStatic.png" id="${returnedJSON[i].screenshotURI.slice(0,-4)}_reflection" title="${localAssetServer}screenshots/${returnedJSON[i].screenshotURI.replace(".png","_200.png")}" />
         <div class="overlay"></div>
        </div><!-- End reflection -->
      </div>`
  }

  console.log('Done building DOM for coverflow')

  cfstr += '</div>'
  $('body').append(cfstr)
  $('#showJSON').click(function () {
    if($('#json').length){
      $('#json').remove()
      $(this).html('Show JSON')
      return
    }
    $('body').append('<textarea id="json">' + JSON.stringify(returnedJSON, undefined, 2) + '</textarea>')
    $(this).html('Hide JSON')
  })

  var beforeCount = $('div.image-block').length // UNUSED?
  var afterCount = $('div.image-block').length // UNUSED?

  $('#coverflow').coverflow({'active':Math.floor($('#coverflow').children().length / 2), // {'overlap': 0.7, 'duration': 300}
    'beforeSelect':function (e, i) {
      alert(e)
    }
  })

  // Get the subset of images that are ready, delay loading the rest while the server reprocesses
  $('img').each(function () {
    var title = $(this).attr('title')
    $(this).fadeOut(400, function () {
      $(this).attr('src', $(this).attr('title'))
    }).fadeIn(400)
  })

  var viewSwitcherHTML =
    `<ul id="viewSwitcher">
      <li class="active" id="switcher_coverFlow_li"><a id="switcher_coverFlow">CoverFlow</a></li>
      <li id="switcher_gridView_li"><a id="switcher_gridView">Grid View</a></li>
      <li id="switcher_timeline_li"><a id="switcher_timeline">Timeline</a></li>
      <!--<li><a id="switcher_anotherView">Another View</a></li>-->
    </ul>`

  $('body').append(viewSwitcherHTML)
  $('#viewSwitcher li a').click(function () { // activate view
    if ($(this).parent().hasClass('active')) {
      return // Do nothing if the current view button is clicked
    }

    $('.active').removeClass('active')
    $(this).parent().addClass('active')
    if ($(this).attr('id') === 'switcher_gridView' && $('#gv').length === 0) {
      var cf = $('#coverflow')
      var gv = cf.clone()
      gv.attr('id', 'gv')
      gv.removeClass()
      gv.css('width', '100%').fadeOut()
      gv.children().removeAttr('class').removeAttr('style').css('float', 'left').css('display', 'block')

      $('#coverflow').after(gv)
      $('#gv .reflection').remove() // can't use the selector until it's attached to the DOM
      $('#gv div').css('border', '1px solid black')
      $('#gv div img').css('background-color', 'white')
      $('#gv div').addClass('f1_container')

      $('#gv > div').each(function () {
        var figureHTML =
          `<figure class="shadow f1_card" style="width: 200px;">
            <div class="font face">${$(this).html()}</div>
            <figcaption class="back face center">${$($(this).find(".caption")[0]).html()}</figcaption>
          </figure>`

        $(this).append(figureHTML)

        $(this).find('.caption').remove()
        $(this).children('img').remove()
      })
      $('#gv').append('<br style="clear: both;" />')

      $('.f1_container').click(function () {
        $(this).toggleClass('active')
      })

      $('#coverflow').fadeOut()
      $('#timeline').fadeOut()
      $('#gv').fadeIn()
    } else if ($(this).attr('id') === 'switcher_coverFlow') {
      $('#gv').fadeOut()
      $('#timeline').fadeOut()
      $('#coverflow').fadeIn()
    } else if ($(this).attr('id') === 'switcher_gridView') {
      $('#coverflow').fadeOut()
      $('#timeline').fadeOut()
      $('#gv').fadeIn()
    } else if ($(this).attr('id') === 'switcher_timeline') {
      $('#coverflow').fadeOut()
      $('#gv').fadeOut()
      $('#timeline').fadeIn()
    }

  })

  var data = []

  for (var i = 0; i < returnedJSON.length; i++) {
    var memento = {
      id: i,
      type: 'point',
      start: new Date(returnedJSON[i].datetime),
      stack: false,
      zoomMax: 94670778000,
      zoomMin: 10000
    }

    var inSummarization = []
    var notInSummarization = []
    // This check really ought to not occur every time and this function should
    //  be functionalized

    if ((strategy === 'alSummarization' && !returnedJSON[i].hammingDistance || 
        (returnedJSON[i].hammingDistance < 4 && i !== 0) ||
        strategy !== 'alSummarization' && !returnedJSON[i].screenshotURI
    )) {
      console.log('Draw white dot, not included, for ' + returnedJSON[i].datetime)

      memento.className = 'notInSummarization'
      memento.content = '' // returnedJSON[i].datetime
      // memento.content = returnedJSON[i].datetime
      notInSummarization.push(memento)
    } else {
      console.log('Draw black dot, included, for ' + returnedJSON[i].datetime)
      var imgUri = returnedJSON[i].screenshotURI.replace('.png', '_200.png')

      memento.className = 'inSummarization'
      memento.content =
        `<img src="${localAssetServer}_images/spinnerStatic.png"
              title="${localAssetServer}screenshots/${returnedJSON[i].screenshotURI.replace('.png', '_200.png')}"
              id="${returnedJSON[i].screenshotURI.slice(0, -4)}_timeline"
              width="25" height="25" alt="foooo"
              onError="pollThenReplaceImage(this);" />&nbsp;${returnedJSON[i].datetime}`
      inSummarization.push(memento)
    }

    data.push(memento)
    memento = null
  }

  var options = {height: '300px'} // {stack: false,}
  $('body').append('<div id="timeline"></div>')
  var container = document.getElementById('timeline')
  var timeline = new vis.Timeline(container, new vis.DataSet(data), options)
}

function checkAgainIfImageExists (imgIn) {
  console.log('running checkAgainIfImageExists() for ' + imgIn.title)
  setTimeout(replaceImageIfAvailable, 3000, $(imgIn))
}

function replaceImageIfAvailable (img) {
  var src = $(img).attr('title')
  console.log('Running replaceImageIfAvailable for ' + src)

  $.ajax({
    url: src
  }).success(function () {
    $('#' + $(img).attr('id')).attr('src', src)
    $('#' + $(img).attr('id') + '_reflection').attr('src', src)
    $('#' + $(img).attr('id') + '_timeline').attr('src', src)
  }).fail(function (xhr, status, err) { // If the image has not been generated yet, this 404 will cause a CORS problem, disregard it.
    console.log('Failed. The image might not be generated yet. Trying again in 3.')
    console.log(err)
    setTimeout(replaceImageIfAvailable, 3000, $(img))
  })
}

function buildQuerystringAndGo () {
  var strategy = $('#form_strategy option:selected').attr('value')
  // var access = $("#form_access option:selected").attr("value")
  var urir = $('#form_urir').attr('value')
  // var queryString = "?strategy=" + strategy + "&access=" + access + "&URI-R=" + urir
  var queryString = '?strategy=' + strategy + '&URI-R=' + urir

  window.location.href = thumbnailServer + queryString
}

/** Change the dropdown UI to reflect parameters passed in */
function setStrategyAndAccessInUI () {
  var strategy = $($('body')[0]).data('strategy')
  var access = $($('body')[0]).data('access')

  $('#form_strategy').val(strategy)
  $('#form_access').val(access)
}
