var watermark = require('image-watermark');
var options = {
    'text' : 'sample watermark entjknetk hyny',
    'override-image' : true,
    'align' : 'ltr',
    'color' : 'rgb(255, 255, 0)'
};
watermark.embedWatermark(__dirname+'/assets/screenshots/timemapSum_httpwaybackarchiveitorg106820150701215641http4genderjusticeorg.png', options);
