//Hide and Show Collection Number
function yesnoCheck() {
    if (document.getElementById('archiveit').checked) {
        document.getElementById('collectionNo').style.display = 'inline';
    }
    else document.getElementById('collectionNo').style.display = 'none';

}

//Sliders
function updateTextH(value) {
	document.getElementById("hammingdistanceValue").innerHTML = value;
}


function updateTextS(value) {
	document.getElementById("screenshotValue").innerHTML = value;
}
