function embedImageGrid() {
    $("#embedGrid").css("display", "block");

    var imageGridEmbed = $("#imageGrid .grid-container").html();
    var regex = /<button\b[^>]*>(.*?)<\/button>/g;
    imageGridEmbed = imageGridEmbed.replace(regex, "");
    imageGridEmbed += `
    <link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style>
        body{
            padding-bottom: 0px;
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

        #uri-label {
            margin: 25px 0px 10px 5px;
            font-size: 16px;
        }

        .paraOnlyOnStatsResults {

        }

        .uriexample {
            font-weight: initial;
        }

        .statsWrapper p {
            font-family: inherit !important;
        }

        .histoWrapper p {
            font-family: inherit !important;
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


        #busy-loader {
            background: url(ajax-loader.gif) no-repeat scroll center center #FFF;
            position: absolute;
            height: 100%;
            width: 100%;
            opacity: 0.6;
            z-index: 1000;
            left:0;
            top:0;
        }

        .gridimage {
            width: 300px !important;
            height: 200px !important;
        }

        .inputTitle, #interval, .inputControl-addon {
            display: inline-block;
            margin: 20px 0 10px;
        }

        #interval {
            width: 45px;
        }

        #gifApp {
            margin: 10px 0 0;
        }

        .inputControl-addon {
            margin-right: 30px;
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
    imageSliderEmbed += `<link href="`+window.location.origin+`/styles/sitestyle.css" rel="stylesheet"/>
    <link href='http://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="`+window.location.origin+`/scripts/imageSliderScript.js"></script>
    <script>
        imagesData=`+JSON.stringify(imagesData)+`
    </script>`;
    
    var iframe = document.createElement('iframe');
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(imageSliderEmbed);
    iframe.width = "600px";
    iframe.height = "450px";
    iframe.scrolling = "no";
    iframe.frameBorder = "0";

    $("#embedSlider").val(new XMLSerializer().serializeToString(iframe));
    $("#embedSlider").select();
}
