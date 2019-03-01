
var imagesData_IG = [];

function getImageArray(data){

	imagesData_IG = [];
		$("#gif .gifContent").empty();
		$.each(data, function (index, obj) {
			if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
				imagesData_IG.push(obj);
			}
		});

		var imageLinks = [];
		for(var i = 0; i<imagesData_IG.length; i++)
		{
			imagesData_IG[i].event_link = imageLinks[i];
		}

	var interval = document.getElementById("interval").value;

	create(imageLinks, interval);
}

function create(image, int)
{
	gifshot.createGIF({
    gifWidth: 200,
    gifHeight: 200,
    interval: int,
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
	        document.getElementById("gifApp").appendChild(animatedImage);
	        //$("#gif div").appendChild(animatedImage);
	    }
	});

}
