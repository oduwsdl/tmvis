var imagesData = [];
var imageLinks = [];

function getImageArray(data){

	imagesData = [];
	$("#gif #gifContent #gifApp").empty();
	$.each(data, function (index, obj) {
		if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
		imagesData.push(obj);
		}
	});

	for(var i = 0; i<imagesData.length; i++)
	{
		imageLinks[i] = $(imagesData[i].event_html).attr('src');
		console.log(imageLinks[i]);
	}

	var interval = document.getElementById("interval").value;

	createGif(imageLinks, interval);

	document.getElementById("gifButton").addEventListener("click", updateGif);
}

function updateGif(){
	$("#gifApp").empty();
	var interval = document.getElementById("interval").value;
	createGif(imageLinks, interval);
}
	



function createGif(image, Interval)
{
	gifshot.createGIF({
   	gifWidth: 450,
	gifHeight: 450,
	interval: Interval,
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
		//$("#gif div").appendChild(animatedImage);
		}
	});

}


