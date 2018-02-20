var fs = require("fs");
var fse = require('fs-extra');
var wjf = require('write-json-file');
function SimhashCacheFile(forUri, isDebugMode){

		//operation = "replace","append","read"
		console.log("foruri->"+forUri )
		console.log("isDebugmode->"+isDebugMode )

		this.isDebugMode = isDebugMode
		//TODO, check if it already exists
		if (!fs.existsSync(__dirname+"/cache")){
	    fs.mkdirSync(__dirname+"/cache");
		}
		this.path = './cache/simhashes_' + forUri.replace(/[^a-z0-9]/gi, '').toLowerCase();
		this.timemapSumJsonPath= './cache/timemapsumjson_'+forUri.replace(/[^a-z0-9]/gi, '').toLowerCase();
		console.log('path is now ' + this.path);

		this.replaceContentWith = function(str){
			this.ConsoleLogIfRequired("in replaceContentWith()");
			this.ConsoleLogIfRequired("> deleting old cache file");
			this.deleteCacheFile();
			this.ConsoleLogIfRequired("> done deleting cache file, writing new contents");
			this.writeFileContents(str);
			this.ConsoleLogIfRequired("> done writing new contents to cache");
		};

		this.writeFileContents = function(str){
			fs.appendFileSync(this.path,str);
			this.ConsoleLogIfRequired("Wrote simhash to "+this.path);
		};

		this.deleteCacheFile = function(){
			//fs.unlinkSync(this.path)
			fs.unlink(this.path,function(){})
		};

		this.readFileContentsSync = function(callbackSuccess, callbackFail){
            try {
             console.log('checking for file ' + this.path);
				var x = fs.readFileSync(this.path, 'utf-8');
				return x;
            }catch(e) {
              // No file by that name
              //console.log('There was no cache file at ' + this.path);
              return null;
            }
		};

		this.readFileContents = function(callbackSuccess, callbackFail) {
			fs.readFile(this.path, 'utf-8', function(err,data){
				if(err) {
					//The cache file hasn't been created
					callbackFail();
					return;
				}

				callbackSuccess(data);
			});
		};

		// The following is the write using FS, but looks to be failing for huge strings
		// this.writeFileContentsAsJSON = function(str){
		//     console.log('JSON written out as filename '+ this.path + '.json');
		// 	fs.writeFile(this.path + '.json', str, function(err) {
		// 	  if(err) {
		// 			console.log(err);
		// 	    throw error;
		// 	  }
		// 	});
		// };

		//The following is the write using FES, but looks to be failing for huge strings
		this.writeFileContentsAsJSON = function(str){
		  console.log('JSON written out as filename '+ this.path + '.json');
			fse.outputJson(this.path + '.json', str, function(err) {
				if(err) {
					console.log(err);
			    throw err;
			  }
			});
			// wjf(this.path + '.json', str).then(() => {
			// 	console.log('done writing ');
			// });

		};


		this.writeThumbSumJSONOPContentToFile = function(str){
		    console.log('ThumbSumJSON written out as filename '+ this.timemapSumJsonPath + '.json');
			fse.outputJson(this.timemapSumJsonPath + '.json', str, function(err) {
				if(err) {
					console.log(err);
			    throw err;
			  }
			});
			// wjf(this.timemapSumJsonPath + '.json',str).then(() => {
			// 	console.log('done writing ');
			// });



		};



		this.exists = function(){
		  try {
		    console.log('Checking if ' + this.path + ' exists');
				fs.statSync(this.path);
		  } catch(err) {
			if(err.code == 'ENOENT') return false;
		  }
		  return true;

		}
   this.ConsoleLogIfRequired= function (msg){
	   if(this.isDebugMode){
	     console.log(msg);
	   }
	 }


}

module.exports = {
	SimhashCacheFile : SimhashCacheFile
}
