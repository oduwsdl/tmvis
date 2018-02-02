var imagesData_IG = [];

function drawImageGrid(data){

	imagesData_IG = [];
	$("#imageGrid .grid-container ul").empty();
	$.each(data, function (index, obj) {
		if($(obj.event_html).attr("src").indexOf("notcaptured") < 0){
			imagesData_IG.push(obj);
		}
	});
	var memStatStr = data.length+" mementos, "+imagesData_IG.length+" Unique Thumbnails";
	$(".collection_stats").html(memStatStr);
	console.log(memStatStr);
	$.each(imagesData_IG, function(i){
		$("#imageGrid ul").append("<li><a class='row' target='_blank' href='" + imagesData_IG[i].event_link + "'><img  style='width:285px;height:185px;' class='gridimage' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><span class='row gridimagedatetime'><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</span></li>");
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
