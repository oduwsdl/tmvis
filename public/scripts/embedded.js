var embeddedURI = 'http://localhost:3000/?isFromEmbedd=true&uri=http://4genderjustice.org/&primesource=archiveit&ci=1068&hd=4';//this usually has to be read dynamically, getting cors origin error here , to be resolved
$(document).ready(function(){

	if(getParamValue("isFromEmbedd") == "true"){

		$('.argumentsForm #urirIP').val(getParamValue("uri"));
        $('.argumentsForm #collectionNo').val(getParamValue("ci"));
        $('.argumentsForm #hammingDistance').val(getParamValue("hd"));
        $('.argumentsForm input[value='+getParamValue("primesource") +']').prop("checked");
		$(".getJSONFromServer").trigger('click');
	}

});

function triggerGo(){
	if(getParamValue("isFromEmbedd") == "true"){

		$('.argumentsForm #urirIP').val(getParamValue("uri"));
        $('.argumentsForm #collectionNo').val(getParamValue("ci"));
        $('.argumentsForm #hammingDistance').val(getParamValue("hd"));
        $('.argumentsForm input[value='+getParamValue("primesource") +']').prop("checked");
		$(".getJSONFromServer").trigger('click');
	}
}


function getParamValue(paramName)
{
     var url = embeddedURI.split("?")[1]; //get rid of "?" in querystring
    //var url = top.document.getElementById("tmvis_iframe").src.split("?")[1]; //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName)
            return pArr[1]; //return value
    }
}


//http://tmvis.cs.odu.edu/?isFromEmbedd=true&uri=http://4genderjustice.org/&primesource=archiveit&ci=1068&hd=4
