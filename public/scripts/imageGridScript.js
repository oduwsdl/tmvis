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
		$("#imageGrid ul").append("<li class='button_container normalImage'><a class='row' target='_blank' href='" + imagesData_IG[i].event_link + "'><img  style='width:285px;height:185px;' class='gridimage' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><button name='chooseMementos' class='close_button off'>x</button><span class='row gridimagedatetime'><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</span></li>");
		//console.log("<li><a target='_blank' href='" + imagesData_IG[i].event_link + "'><img style='height:150px;' src='" + $(imagesData_IG[i].event_html).attr('src')+"'></img></a><b>Datetime: </b>" + (imagesData_IG[i].event_display_date).split(",")[0] + ", " + (imagesData_IG[i].event_display_date).split(",")[1] + "</li>");
	});
}

//Images stored in the grid must be kept track of
//Images removed must be removed from the array
//Most efficient way to keep track?
//Update when update button is hit
//Images marked for removal must be tagged appropriately upon button click
//Mark must be removed upon button off click
//jsonObjRes holds original list of images in the grid
//Original list must be left intact for constant comparision and best performance


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