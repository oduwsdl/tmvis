var imagesData_IG = [];

function drawImageGrid(data) {
	var URI = $("#uriIP").val();
	var multURI = false; // Did user enter 1 or more URIs

	if(URI.indexOf(',') > 0) {
		URI = URI.split(',');
		multURI = true;
	}

	imagesData_IG = [];
	$("#imageGrid .grid-container ul").empty(); // Clear the grid before appending
	$.each(data, function (index, obj) {
		if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
			imagesData_IG.push(obj);
		}
	});
	var memStatStr = data.length+" mementos, "+imagesData_IG.length+" Unique Thumbnails";
	$(".collection_stats").html(memStatStr);
	console.log(memStatStr);
	$.each(imagesData_IG, function(i) {
		if(multURI) { // If more than 1 URI, add URI stamp
			var link = imagesData_IG[i].event_link;
			link = link.replace(":80",""); // Remove port

			for(var j = 0; j < URI.length; ++j) {
				// Grab the URI that goes with the current thumbnail
				var uriStamp = link.match(/^[A-z\.\/\?\;\:]*\d{4}\d{2}\d{2}\d{6}\/https?\:\/\//g);
				uriStamp = link.replace(uriStamp, "");

				$("#imageGrid ul").append("<li class='button_container normalImage'><button name='chooseMementos' class='close_button off'>x</button><button name='chooseMementos' class='refresh_button'><i class='fa fa-refresh'></i></button><a class='row' target='_blank' href='" + imagesData_IG[i].event_link + "'><img  style='width:285px;height:185px;' class='gridimage' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><span class='row gridimagedatetime'><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</br><b>URI: </b>" + uriStamp + "</span></li>");
			}
		}
		else {
			$("#imageGrid ul").append("<li class='button_container normalImage'><a class='row' target='_blank' href='" + imagesData_IG[i].event_link + "'><img  style='width:285px;height:185px;' class='gridimage' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><button name='chooseMementos' class='refresh_button'><i class='fa fa-refresh'></i></button><button name='chooseMementos' class='close_button off'>x</button><span class='row gridimagedatetime'><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</span></li>");
		}
		//console.log("<li><a target='_blank' href='" + imagesData_IG[i].event_link + "'><img style='height:150px;' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</li>");
	});
}

/*	$(document).ready(function () {
		var curJSONFileName= "timemapsumjson_"+collectionsList[parseInt(location.search.split("=")[1])-1].replace(/[^a-z0-9]/gi, '').toLowerCase();
		$.ajax({
			url: curJSONFileName+'.json',
			dataType: 'json',
			success: function(data) {
				$.each(data, function (index, obj) {
					if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
						imagesData_IG.push(obj);
					}
				});
				var memStatStr = " - "+data.length+" mementos, "+imagesData_IG.length+" Unique Thumbnails(k=4)";
				$(".collection_stats").html(memStatStr);
				console.log(memStatStr);
				$.each(imagesData_IG, function(i){
						$("ul").append("<li><a target='_blank' href='" + imagesData_IG[i].event_link + "'><img style='height:150px;' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</li>");
						console.log("<li><a target='_blank' href='" + imagesData_IG[i].event_link + "'><img style='height:150px;' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</li>");
				});
			}
		});
	});*/