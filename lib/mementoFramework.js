/**
* An objective representation of an archived resource
* @param uri The location of the resource
* @param datetime The time at which the resource was archives
* @param rel The representation of the resource in the parent timemap (this likely doesn't belong here)
*/
function Memento(uri,datetime,rel){
	//a little variation to be added to craw timestamp+id_ so as to get just the original content to compute simhash on
	//this.uri = uri;
	this.uri = uri;
	//console.log("inside building Memento, uri ->  "+uri)
	this.datetime = datetime;
	this.rel = rel;
};


/**
* Used to objectify a returned TimeMap text
* @param str The raw string of the fetched TimeMap
*/
function TimeMap(str){
	this.str = str;
	this.mementos = [];
	this.timemaps = [];
	this.timegates = [];
	this.createMementos = function createMementos(){
		//console.log("tmstr: "+this.str);
		var mementoEntries = this.str.split(/\s*,\s</g);
		for(mementoEntry in mementoEntries){
			var str = mementoEntries[mementoEntry];
			var uri = str.substr(0,str.indexOf(">"));
			uri = uri.replace("<",""); //remove first character of first line and any remaining
			var relRegex = /rel=\".*?\"/gm;
			var dtRegex = /datetime=\".*?\"/gm;
			var rels = str.match(relRegex);
			var dts = str.match(dtRegex);
			var dt, rel;
			if(rels){rel = rels[0].substring(5,rels[0].length - 1);}
			if(dts){dt = dts[0].substring(10,dts[0].length - 1);}

			if(!rel){
				console.log("rel was undefined");
				console.log(mementoEntry);
				return;
			}
			/* This conditional branch is just to have the 'id_' to be added at the end of timestamp,
			* So that using the Memento URI the original content is retrived
			*/
			if(rel.indexOf("memento") > -1){//is A memento

				var regExpForDTStr = /\/\d{14}\// // to match something lile /12345678912345id_/
				var matchedString = uri.match(regExpForDTStr)
				if(matchedString != null){
					uri = uri.replace(matchedString[0],(matchedString[0].toString().replace(/\/$/,"id_/"))) // by default only the first occurance is replaced
				}

				//	uri = uri.replace("/http","id_/http"); //replaced by above code segment
			}


			var foundMementoObject = new Memento(uri,dt,rel); //could be a timegate or timemap as well


			if(rel.indexOf("memento") > -1){//isA memento

				this.mementos.push(foundMementoObject);

			}else if(rel.indexOf("timegate") > -1){
				this.timegates.push(foundMementoObject);
			}else if(rel.indexOf("timemap") > -1){
				this.timemaps.push(foundMementoObject);
			}
			// --ByMahee - dont why the following line is wriiten, this is supposed to be foundMementoObject instood
			delete foundMemento;
		}
	};
};




module.exports = {
	Memento: Memento,
	TimeMap: TimeMap
}
