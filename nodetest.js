// this file to test few of the modules seperately

var fs = require('fs-extra');
var filePath = __dirname+'/cache/simhashes_archiveithdt71068http4genderjusticeorg.json';


function isExists(filePath){
  try {
    console.log('Checking if ' + filePath + ' exists');
    fs.statSync(filePath);
  } catch(err) {
    if(err.code == 'ENOENT'){
      console.log('doesnt exists');
      return false;
    }
  }
  console.log('file exists');
  return true;
}
isExists(filePath)
