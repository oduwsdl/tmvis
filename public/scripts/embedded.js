function embedImageGrid() {
    $("#embedGrid").css("display", "block");

    var imageGridEmbed = $("#imageGrid .grid-container").html();
    var regex = /<button\b[^>]*>(.*?)<\/button>/g;
    imageGridEmbed = imageGridEmbed.replace(regex, "");
    imageGridEmbed += `<link href="`+window.location.origin+`/styles/sitestyle.css" rel="stylesheet"/>
    <link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
        body{
            padding-bottom: 0px;
        }
    </style>`;

    var iframe = document.createElement('iframe');
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(imageGridEmbed);
    iframe.width = "100%";
    iframe.height = "25%";
    iframe.frameBorder = "0";

    $("#embedGrid").val(new XMLSerializer().serializeToString(iframe));
    $("#embedGrid").select();
}

function embedImageSlider() {
    $("#embedSlider").css("display", "block");

    var imageSliderEmbed = $("#imageSlider .imageslider_wrapper").html();
    var regex = /<h2>(.*?)<\/h2>/gm;
    imageSliderEmbed = imageSliderEmbed.replace(regex,"")
    imageSliderEmbed += `<link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script>
    	var imagesData=`+JSON.stringify(imagesData)+`;
    	var indexImage = 0;
	    $(document).ready(function () {
			$('#myImage').mousemove(
				function (event) {
					var x = event.clientX - $(this).offset().left;
					var columnWidth = $('#myImage').outerWidth() / imagesData.length;
					var column = Math.floor(x / columnWidth);
					indexImage = column;
					$('#myImage').attr('src', $(imagesData[column].event_html).attr("src"));

					$.each(imagesData[column], function(i) {
						$('#myContent').empty();
						$('#myContent').append("<p><br><b> Datetime: " +(imagesData[column].event_display_date).split(",")[0] + ", " + (imagesData[column].event_display_date).split(",")[1] + "</b></a>");
					});
				}
			);

			$('#sliderNext').click(function() {
				slideImage(1)
			});

			$('#sliderPrev').click(function() {
				slideImage(-1)
			});
		});

        var slideImage = function(step) {
			if ( step == undefined ) {
				//console.log("step is undefined now");
				step = 1;
			}
			var indx = $('#myImage:visible').index('#myImage');


			if ( step != 0 ) {
				$('#myImage:visible').show();
			}

			indexImage = indexImage + step;

			if ( indexImage >= imagesData.length ) {
				indexImage = 0;

			} else if ( indexImage < 0 ) {
				indexImage = imagesData.length - 1;
			}
			//If step == 0, we don't need to do any fadein our fadeout
			if ( step != 0 ) {
				$('#myImage:eq(' + indx + ')').show();
			}

			console.log(indexImage);
			$('#myImage').attr('src', $(imagesData[indexImage].event_html).attr("src"));
			$.each(imagesData[indexImage], function(i) {
				$('#myContent').empty();
				$('#myContent').append("<p><br><b> Datetime: " + (imagesData[indexImage].event_display_date).split(",")[0] + ", " + (imagesData[indexImage].event_display_date).split(",")[1] + "</b></p>");
			});
		}
    </script>
    <style>
    	//Sliders
        .slidecontainer {
            width: 100%; /* Width of the outside container */
        }

        /* The slider itself */
        .slider {
            -webkit-appearance: none;  /* Override default CSS styles */
            appearance: none;
            width: 100%; /* Full-width */
            height: 20px; /* Specified height */
            border-radius: 5px;
            background: #d7dcdb; /* Grey background */
            outline: none; /* Remove outline */
            opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
            -webkit-transition: .2s; /* 0.2 seconds transition on hover */
            transition: opacity .2s;
        }

        /* Mouse-over effects */
        .slider:hover {
            opacity: 1; /* Fully shown on mouse-over */
        }

        /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none; /* Override default look */
            appearance: none;
            width: 25px; /* Set a specific slider handle width */
            height: 25px; /* Slider handle height */
            background: #23726D; /* Green background */
            cursor: pointer; /* Cursor on hover */
            border-radius: 50%;
        }

        .slider::-moz-range-thumb {
            width: 25px; /* Set a specific slider handle width */
            height: 25px; /* Slider handle height */
            background: #23726D; /* Green background */
            cursor: pointer; /* Cursor on hover */
            border-radius: 50%;
        }

        button {
            background-color : #eef;
        }

        .collection_name {
            font-size: 16px;
            margin-left: 0.5%
        }

        .container-fluid {
            max-width:90%;
        }

        #collectionNo {
            display: none;
        }

        output {
            display:inline;
        }

        .time_container {
            color:dimgrey;
        }

        .btn-secondary.on {
            background-color: #3379b7;
            color:white !important;
        }

        .getSummary {
            vertical-align: top !important;
        }

        .getDateRangeSummary {
            vertical-align: top !important;
        }

        h2 {
            font-family: 'Oswald', sans-serif !important;
            font-size: 2em;
            font-weight: 200;
            margin: 0 0 10px;
            text-align: center;
        }

        p {
            font-family: 'Oswald', sans-serif !important;
        }

        .container {
            width: 1200px;
            height: 350px;
            margin: 0 auto;
        }

        .content_focusedWrapper {
            margin-top: 5%;
        }

        .item_user_html img {
            width: 250px;
            height: 200px;
        }

        .item_user_html h2{
            font-family: 'Oswald',sans-serif !important;
            /*font-weight: bolder;*/
        }

        .gridImagePlusContentWrapper {
            text-align: center;
        }

        #myImage {
            //margin-left: 33%;
            border: 1px solid black;
            cursor: pointer;
            box-shadow: 0 0 5px #ddd;
            box-sizing: border-box;
        }

        #myContent {
            /*margin-left: 38%;*/
        }

        h2 {
            font-family: 'Oswald',sans-serif !important;
            font-size: 1em;
            font-weight: 100;
            margin: 0 0 10px;
            text-align: center;
        }

        h1 {
            font-family: 'Oswald',sans-serif !important;
            font-size: 2em;
            font-weight: 200;
            margin: 0 0 10px;
            text-align: center;
        }

        .container {
            width: 1200px;
            margin: 0 auto;
        }

        #controls {
            margin-top : 30px;
        }

        /*li {
            display : inline-block;
            padding : 5px;
            border : 1px solid #ccc;
            background-color : #eee;
            cursor : pointer;
        }*/

        #sliderPrev, #sliderNext {
            border-radius: 50%;
            position: relative;
        }

        #sliderPrev:focus, #sliderNext:focus {
            outline-style: none;
        }

        #sliderPrev {
            transform: translate(-10%,-10%);
        }

        #sliderNext {
            transform: translate(10%,-10%);
        }

        .heightSet {
            max-height: 300px;
        }

        hr {
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #fff;
            margin: 25px 0;
            clear: both;
        }

        .centered {
            text-align: center;
        }

        /* ----- Image grids ----- */

        ul.rig {
            list-style: none;
            font-size: 0px; /* should match li left margin */
        }

        ul.rig li {
            display: inline-block;
            background: #fff;
            border: 2px solid #ddd;
            font-size: 16px;
            font-size: 0.8rem;
            vertical-align: top;
            box-shadow: 0 0 5px #ddd;
            box-sizing: border-box;
            margin: 10px;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            cursor: pointer;
        }

        ul.rig li img {
            max-width: 100%;
            height: auto;
            margin: auto;
            /* margin: 0 0 10px; */
        }

        .gridimage {
            width: 300px !important;
            height: 200px !important;
        }

        .intervalTab{
            margin: 10px 0 10px;
        }

        .inputTitle, #interval, .inputControl-addon {
            display: inline-block;
            margin: 20px 0 10px;
        }

        .inputControl-addon {
            margin-right: 30px;
        }
    </style>`;
    
    var iframe = document.createElement('iframe');
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(imageSliderEmbed);
    iframe.width = "600px";
    iframe.height = "450px";
    iframe.scrolling = "no";
    iframe.frameBorder = "0";

    $("#embedSlider").val(new XMLSerializer().serializeToString(iframe));
    $("#embedSlider").select();
}
