var imageLinks = [];
var timeStampedImages = [];
var URIStampedImages =[];
var timeAndURIStampedImages = [];

function getImageArray(){
	$("#gif #gifContent #gifApp").empty();
	imageLinks = [];
	timeStampedImages = [];
	URIStampedImages = [];
	timeAndURIStampedImages = [];

	for(var i = 0; i<imagesData_IG.length; i++)
	{
		imageLinks[i] = $(imagesData_IG[i].event_html).attr('src');
		console.log(imageLinks[i]);
	}
	var interval = document.getElementById("interval").value;

	watermark();
	createGif(imageLinks, interval);

	document.getElementById("gifButton").addEventListener("click", updateGif);
}

function updateGif(){
	$("#gifApp").empty();
	var interval = document.getElementById("interval").value;
	var timeWatermarkOption = document.getElementById("timeWatermarkOption");
	var URIWatermarkOption = document.getElementById("URIWatermarkOption");

	if(timeWatermarkOption.checked == true && URIWatermarkOption.checked == true) {
		createGif(timeAndURIStampedImages,interval);
	} else if(timeWatermarkOption.checked == true) {
		createGif(timeStampedImages,interval);
	} else if(URIWatermarkOption.checked == true) {
		createGif(URIStampedImages,interval);
	} else{
		createGif(imageLinks, interval);
	}
}


function watermark(){	
	var URI = $("#uriIP").val();
	URI = URI.split(',');
	var regexForPort = /(\/http:\/\/.*):(\80*)/g;
	var regexForHTTPS = /(https?:\/\/)/gi;
	for(var i = 0; i<imagesData_IG.length; i++)
	{
		var img = new Image();
		img.src = imageLinks[i];

		var timeStamp = imagesData_IG[i].event_display_date;
		watermarkImage(img,timeStamp,i,timeStampedImages);

		var link = imagesData_IG[i].event_link;
		link = link.replace(":80","");
		
		for(var j = 0; j<URI.length; j++)
		{
			var uri = URI[j];
			uri = uri.replace(regexForHTTPS,"");
			uri = uri.replace(/\/$/, "");

			if(link.indexOf(uri) > 0)
			{
				var URIStamp = uri;
				URIStamp.replace(/\s/g,"");
				watermarkImage(img,URIStamp,i,URIStampedImages);

				var timeAndURIStamp =  URIStamp + "\n" + imagesData_IG[i].event_display_date;
				watermarkImage(img,timeAndURIStamp,i,timeAndURIStampedImages);
			}
		}
	}
}


function watermarkImage(elemImage, text, counter,array) {
	var testImage = new Image();
	testImage.onload = function() {
		var h = testImage.height, w = testImage.width, img = new Image();
				   
		img.onload = function() {
		     
			var canvas = Object.assign(document.createElement('canvas'), {width: w, height: h});
			var ctx = canvas.getContext('2d');
			ctx.drawImage(testImage, 0, 0);
			ctx.drawImage(img, 0, 0);
					      
			try {
					elemImage.src = canvas.toDataURL('image/png');
					array[counter] = elemImage.src;
					//console.log(elemImage.src);
			}
			catch (e) {
					console.error('Cannot watermark image with text:', {src: elemImage.src, text: text, error: e});
			}
		};
				   
		img.src = 'data:image/svg+xml;base64,' + window.btoa(
					  '<svg xmlns="http://www.w3.org/2000/svg" height="' + h + '" width="' + w + '">' +
						  '<foreignObject width="100%" height="100%">' +
							  '<div xmlns="http://www.w3.org/1999/xhtml">' +
								  '<div style="position: absolute;' +
								                        'left: 0;' +
								                        'bottom: 0;' +
								                        'font-family: Tahoma;' +
								                        'font-size: 30pt;' +
								                        'background: #000;' +
								                        'color: #fff;' +
								                        'padding: 0.25em;' +
								                        'border-radius: 0.25em;' +
								                        'opacity: 0.6;' +
								                        'margin: 0 0.125em 0.125em 0;' +
								   '">' + text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</div>' +
							  '</div>' +
						   '</foreignObject>' +
					   '</svg>'
		);
	};
		testImage.src = elemImage.src;
}


function createGif(image, interval)
{
	gifshot.createGIF({
   	gifWidth: 1024,
	gifHeight: 768,
	interval: interval,
	numFrames: 10,
	images: image,
	frameDuration: 1,
	fontWeight: 'normal',
	fontSize: '16px',
	fontFamily: 'sans-serif',
	fontColor: '#ffffff',
	textAlign: 'center',
	textBaseline: 'bottom',
	sampleInterval: 10,
	numWorkers: 4
	}, function (obj) {
		if (!obj.error) {
		var image = obj.image, animatedImage = document.createElement('img');
		animatedImage.src = image;
		animatedImage.style.border = "1px solid black";
		animatedImage.style.width = "400px";
		animatedImage.style.height = "300px";
		document.getElementById("gifApp").appendChild(animatedImage);
		
		document.getElementById("gifDownload").href = image;
		}
	});

}


