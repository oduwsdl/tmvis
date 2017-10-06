var fs = require("fs");

function SimhashCacheFile(forUri, isDebugMode){
		//operation = "replace","append","read"
		this.isDebugMode = isDebugMode
		//TODO, check if it already exists
		this.path = './cache/simhashes_' + forUri.replace(/[^a-z0-9]/gi, '').toLowerCase();

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
			this.ConsoleLogIfRequired("This is not the right thing to do. exists() is async and requires a callback. Change flow of caller");
			//fs.exists(this.path,function(){this.ConsoleLogIfRequired("The cache file at });
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
