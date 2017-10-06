var fs = require("fs");

function SimhashCacheFile(forUri) {
		//operation = "replace","append","read"

		//TODO, check if it already exists
		this.path = './cache/simhashes_' + forUri.replace(/[^a-z0-9]/gi, '').toLowerCase();

console.log('path is now ' + this.path);

		this.replaceContentWith = function(str){
			console.log(' - DELETING old cache file.');
			this.deleteCacheFile();
            console.log(' - WRITING new cache file...');
			this.writeFileContents(str);
		};

		this.writeFileContents = function(str){
			fs.appendFileSync(this.path, str);
			console.log(' - WRITING new cache file complete.');
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
			
			/*
			fs.readFile(this.path,"utf-8",function(err,data){
				if(err){
					//The cache file hasn't been created
					callbackFail();
					return;
				}

				callbackSuccess(data);
			});
			*/
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

		this.writeFileContentsAsJSON = function(str){
		    console.log('JSON written out as filename '+ this.path + '.json');
			fs.writeFile(this.path + '.json', str, function(err) {
			  if(err) {
			    throw error;
			  }
			});
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

}


module.exports = {
	SimhashCacheFile : SimhashCacheFile
}
