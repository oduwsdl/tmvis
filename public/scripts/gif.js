var imageLinks = [];
var stampedImages = [];

function getImageArray(){
	console.log("Here's a gif!");
	$("#gif #gifContent #gifApp").empty();
	imageLinks = [];
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

	if(document.getElementById("watermarkOption").checked == true)
	{
		createGif(stampedImages,interval);
	}
	else{
		createGif(imageLinks, interval);
	}
}
	
function watermark(){	
	for(var i = 0; i<imagesData_IG.length; i++)
	{
		
		var stamp = imagesData_IG[i].event_display_date;
		var img= new Image();
		img.src = imageLinks[i];
		watermarkImage(img,stamp,i);
	}
}


function watermarkImage(elemImage, text, counter) {
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
					stampedImages[counter] = elemImage.src;
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
   	gifWidth: 400,
	gifHeight: 300,
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
		document.getElementById("gifApp").appendChild(animatedImage);
		
		document.getElementById("gifDownload").href = image;
		}
	});

}


