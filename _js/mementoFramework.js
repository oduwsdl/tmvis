/**
* An objective representation of an archived resource
* @param uri The location of the resource
* @param datetime The time at which the resource was archives
* @param rel The representation of the resource in the parent timemap (this likely doesn't belong here)
*/
function Memento(uri,datetime,rel){
	this.uri = uri;
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


			var foundMementoObject = new Memento(uri,dt,rel); //could be a timegate or timemap as well


			if(!rel){
				console.log("rel was undefined");
				console.log(mementoEntry);
				return;
			}


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
