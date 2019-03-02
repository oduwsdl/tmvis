
$(document).ready(function{
		  
		  var imagesData = [];

		function getImageArray(data){

			imagesData = [];
				$("#gif .gifContent").empty();
				$.each(data, function (index, obj) {
					if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
						imagesData.push(obj);
					}
				});

				var imageLinks = [];
				for(var i = 0; i<imagesData.length; i++)
				{
					imagesData[i].event_link = imageLinks[i];
				}

			var interval = document.getElementById("interval").value;

			//create(imageLinks, interval);
	
			var all = ['https://i.imgur.com/YiOWGYW.jpg',
				'https://i.imgur.com/yWh0K3Q.jpg',
				'https://i.imgur.com/ddrHwef.jpg',
				'https://i.imgur.com/sptDxw4.jpg',
				'https://i.imgur.com/kpfvVHr.jpg',
				'https://i.imgur.com/GWtiJFA.jpg',
				'https://i.imgur.com/GcscISf.jpg',
				'https://i.imgur.com/RlZDKhp.jpg',
				'https://i.imgur.com/92aMyyI.jpg',
				'https://i.imgur.com/qhD0lTl.jpg',
				'https://i.imgur.com/Pr3SN.jpg',
				'https://i.imgur.com/L4tUONy.jpg',
				'https://i.imgur.com/ua5dHQ8.jpg',
				'https://i.imgur.com/ypcGpcf.jpg',
				'https://i.imgur.com/qjOOur1.jpg',
				'https://i.imgur.com/MvwKG.jpg',
				'https://i.imgur.com/CeQWjg9.jpg',
				'https://i.imgur.com/vEgajTc.jpg',
				'https://i.imgur.com/UlPaqaG.jpg',
				'https://i.imgur.co/o6bfcka.jpg'];
	
			
		}
		  create(all,0.7);
		  });


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
