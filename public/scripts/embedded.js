function embedImageGrid() {
    $("#embedGrid").css("display", "block");

    var imageGridEmbed = $("#imageGrid .grid-container").html();
    var regex = /<button\b[^>]*>(.*?)<\/button>/g;
    imageGridEmbed = imageGridEmbed.replace(regex, "");
    imageGridEmbed += `<link href="`+window.location.origin+`/styles/sitestyle.css" rel="stylesheet"/>
    <link href='http://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
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
