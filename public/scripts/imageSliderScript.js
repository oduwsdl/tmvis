	var imagesData = [];
	var indexImage = 0;
			var timeoutId;
	$(document).ready(function () {
		$('#myImage').mousemove(
			function (event) {
				var x = event.clientX - $(this).offset().left;
				var columnWidth = $('#myImage').outerWidth() / imagesData.length;
				var column = Math.floor(x / columnWidth);
				indexImage = column;
				$('#myImage').attr('src', $(imagesData[column].event_html).attr("src"));

				$.each(imagesData[column], function(i){
					$('#myContent').empty();
					$('#myContent').append("<p><br><b> Datetime: " +(imagesData[column].event_display_date).split(",")[0] + ", " + (imagesData[column].event_display_date).split(",")[1] + "</b></a>");
				});
			}
		);

		$('#myImage').click(function(event) {
			var x = event.clientX - $(this).offset().left;
			var columnWidth = $('#myImage').outerWidth() / imagesData.length;
			var column = Math.floor(x / columnWidth);

			window.open(imagesData[column].event_link);
		});

		/*var curJSONFileName= "timemapsumjson_"+collectionsList[parseInt(location.search.split("=")[1])-1].replace(/[^a-z0-9]/gi, '').toLowerCase();

		$.ajax({
			url: curJSONFileName+'.json',
			dataType: 'json',
			success: function(data) {
				$.each(data, function (index, obj) {
					if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
						imagesData.push(obj);
					}
				});
				$('#myImage').attr('src', $(imagesData[0].event_html).attr("src"));
				slideImage(0);
			}
		});*/

		console.log(imagesData);


		$('#play').click(function() {
			slideImage(indexImage);
			timeoutId = setInterval ( slideImage, 1000 );
		});

		$('#pause').click(function() {
			clearInterval(timeoutId);
		});
	});

	function drawImageSlider(data){
		imagesData = [];
		indexImage = 0;
		$.each(data, function (index, obj) {
					if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
						imagesData.push(obj);
					}
		});
		$('#myImage').attr('src', $(imagesData[0].event_html).attr("src"));
		slideImage(0);


		$('.tabContentWrapper').waitForImages(function() {
			$("#busy-loader").hide();
		   	$(".tabContentWrapper").show();  /* now that all the 3 visualization graphs are initialized and images are got to clinet side and ready to be rendered,
		   										now unhiding the tab content */
		});
	}



	var slideImage = function(step) {
			if ( step == undefined ){
				//console.log("step is undefied now");
				step = 1;
			}
			clearTimeout ( timeoutId );
			var indx = $('#myImage:visible').index('#myImage');


			if ( step != 0 ) {
			   $('#myImage:visible').show();
			}

			indexImage = indexImage + step;

			if ( indexImage >= imagesData.length ) {
				indexImage = 0;
				if(!$(".playinloop").prop("checked")){
					// added the below two lines in this if block to stop the re-looping of images that was happening on play click
					clearInterval(timeoutId);
					return;
				}

			} else if ( indexImage < 0 ) {
				indexImage = imagesData.length - 1;
			}
			//If step == 0, we don't need to do any fadein our fadeout
			if ( step != 0 ) {
			   $('#myImage:eq(' + indx + ')').show();
				timeoutId = setTimeout ( slideImage, 1000 );
			}

			console.log(indexImage);
			$('#myImage').attr('src', $(imagesData[indexImage].event_html).attr("src"));
			$.each(imagesData[indexImage], function(i){
						$('#myContent').empty();
						$('#myContent').append("<p><br><b> Datetime: " + (imagesData[indexImage].event_display_date).split(",")[0] + ", " + (imagesData[indexImage].event_display_date).split(",")[1] + "</b></a>");
			});
	};
