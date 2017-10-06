//'use strict';
/*********************************
*  AlSummarization (batch version)
*  An implementation for Ahmed AlSum's ECIR 2014 paper:
*   "Thumbnail Summarization Techniques for Web Archives"
*  Mat Kelly <mkelly@cs.odu.edu>
*
******************************* */
/* Run this with:
*  > node AlSummarization.js
*  Then visit a URI in your browser or curl it, e.g.,
*  > curl localhost:15421/?URI-R=http://matkelly.com
*  A user interface will be returned. If curling, useful info about the
*   summarization returned.
*/

var http = require('http');
var express = require('express');
var url = require('url');
var connect = require('connect');
var serveStatic = require('serve-static');
var Step = require('step');
var async = require('async');
var Futures = require('futures');
var Promise = require('es6-promise').Promise;
var Async = require('async');
var simhash = require('simhash')('md5');
var moment = require('moment');

var ProgressBar = require('progress');

var phantom = require('node-phantom');
var webshot = require('webshot'); // PhantomJS wrapper
var pjs = require('phantom');
var phridge = require('phridge');

var fs = require('fs');
var path = require('path');
var validator = require('validator');
var underscore = require('underscore');


var argv = require('minimist')(process.argv.slice(2));
//var prompt = require('sync-prompt').prompt;
var request = require('sync-request');

var mementoFramework = require('./_js/mementoFramework.js');
var Memento = mementoFramework.Memento;
var TimeMap = mementoFramework.TimeMap;
var SimhashCacheFile = require('./_js/simhashCache.js').SimhashCacheFile;

var colors = require('colors');
var im = require('imagemagick');
var gm = require('gm').subClass({ imageMagick: true });;

const Pageres = require('pageres');

var md5 = require('blueimp-md5');
console.log(md5);

var app = express();

var host = 'http://' + (process.env.SERVER_HOST || 'localhost'); // Format: scheme://hostname

var uriR = '';

var validStrategyParameters = ['alSummarization', 'random', 'temporalInterval', 'interval'];
var strategy = argv.strategy ? argv.strategy : validStrategyParameters[0];

var lineReader = require('line-reader');

var HAMMING_DISTANCE_THRESHOLD = 4;
var HAMMING_DISTANCE_THRESHOLD_INIT = 4;

function batchProcessWithAllStrategies(uriRs) {
  console.log('Creating cache file for '+ uriRs[0]);
  var cacheFile = new SimhashCacheFile(uriRs[0]);
  cacheFile.path += '.json';

  // **********************************
  // Invoke AlSummarization strategy
  // **********************************
  var fileContents = cacheFile.readFileContentsSync();
  
  //if (fileContents) {
  //  console.log('Found cache file at ' + cacheFile.path);
  //  processWithFileContents(data);
  //} else {
    console.log('GENERATING cache file at ' + cacheFile.path + ', one does not currently exist.');
    
    performAllStrategiesWithURIRs(uriRs);
  //}
}

function performAllStrategiesWithURIRs(uriRs) {
  var uri = uriRs[0];
  async.series([
    function(callback){performStrategy_alsum(uri, callback);},
    function(callback){performStrategy_interval(uri, callback);},
    function(callback){performStrategy_temporalInterval(uri, callback);},
    function(callback){performStrategy_random(uri, callback);}
    ], function(err, results) {
      console.log('Done processing ' + uri);
      uriRs.shift();
      
      
      
      checkAndProcessNextURI(uriRs);
      
      //performAllStrategiesWithURIRs(uriRs);
    }
  );
}

var repeatCount = 0; //prevent infinite loops in a hacky method that gets the data generated
var prevRepeatCount = 0;

function checkAndProcessNextURI(uriRs) {
  var remainingScreenshotsToGenerate = Object.keys(screenshotsToGenerate).length;
  if(remainingScreenshotsToGenerate != 0) {
    console.log(remainingScreenshotsToGenerate + ' screenshots still need to be generated');
    
    if(repeatCount < 5) {
      prevRepeatCount = repeatCount;
    }else {
      console.log('Too many repeats, we are done with this URI');
      fs.writeFile("./badURIs.txt", Object.keys(screenshotsToGenerate).join('\n'), function(err) {
			if(err) {
			  console.log('Could not save bad URIs file. :(');
			  return console.log(err);
			}

			console.log('Saved bad URIs to ./badURIs.txt');
	  }); 
      
      if(uriRs.length > 0) {
        performAllStrategiesWithURIRs(uriRs);
      }
      return;
    }
    
    if(uriRs.length > 0) {
      repeatCount++;
      setTimeout(function(){checkAndProcessNextURI(uriRs);}, 5000);
      return;
    }else {
      console.log('Remaining URIs');
      for(var uri in screenshotsToGenerate) {
        console.log(uri);
      }
    }
  } else {
    if (!uriRs || uriRs[0] === '' || uriRs.length == 0) {console.log('Done with all URIs'); return;}
    
    performAllStrategiesWithURIRs(uriRs);
  }
}

/**
* Start the application by initializing server instances
*/
function main() {
  console.log(('************************************\r\n' +
               'THUMBNAIL SUMMARIZATION - BATCH MODE\r\n' +
               '************************************').blue);
  

  var lines = fs.readFileSync('lulwah_ijdl.txt').toString().split("\n");
  batchProcessWithAllStrategies(lines);
}

function isValidStrategy(strategyIn) {
  for(var s = validStrategyParameters.length - 1; s >= 0; s--) {
    if (strategyIn == validStrategyParameters[s]) {
      return true;
    }
  }
  
  return false;
}


function performStrategy_interval(uri, cb) {
  var timemapHost = 'web.archive.org';
  var timemapPath = '/web/timemap/link/' + uri;
  var tmURI = 'http' + timemapHost + timemapPath;

  var cacheFile = new SimhashCacheFile(uri);
  cacheFile.path += '.json';
  if (!cacheFile.exists()) {
    console.log(('ERROR: Cache file at ' + cacheFile.path + ' does not exist. Not performing interval').red);
    return cb();
  }

  console.log('*************************INTERVAL STRATEGY*************************');
  var cacheFiles = fs.readdirSync('./cache/');
  var filteredCacheFiles = [];
  var mementos = [];
  
  
  console.log('Trying to read cache file at ' + __dirname + cacheFile.path.replace('./','/'));
  fs.readFile(__dirname + cacheFile.path.replace('./','/'), 'utf8', function(err, data) {
    mementos = JSON.parse(data);
    var alSumCount = countNumberOfScreenshotsCreatedByAlSumBasedOnCache(mementos);
    console.log('There were ' + mementos.length + ' mementos. AlSum chose ' + alSumCount);
    mementos = getIndexesForMementosNeededToBuildInterval(mementos, alSumCount);
    console.log(alSumCount + ' Mementos have been selected selected for interval');
    createThumbnailsForMementosWithAScreenshotURI(mementos, 'interval');
  
    return cb();
  });
}  

function performStrategy_temporalInterval(uri, cb) {
  var timemapHost = 'web.archive.org';
  var timemapPath = '/web/timemap/link/' + uri;
  var tmURI = 'http' + timemapHost + timemapPath;
  
  var cacheFile = new SimhashCacheFile(uri);
  cacheFile.path += '.json';
  if (!cacheFile.exists()) {
    console.log(('ERROR: Cache file at ' + cacheFile.path + ' does not exist. Not performing temporal interval').red);
    return cb();
  }


  console.log('*************************TEMPORAL INTERVAL STRATEGY*************************');
  var cacheFiles = fs.readdirSync('./cache/');
  var filteredCacheFiles = [];
  var mementos = [];


  fs.readFile(__dirname + cacheFile.path.replace('./','/'), 'utf8', function(err, data) {
	  mementos = JSON.parse(data);
	  var alSumCount = countNumberOfScreenshotsCreatedByAlSumBasedOnCache(mementos);
	  console.log('There were ' + mementos.length + ' mementos. AlSum chose ' + alSumCount);
	  mementos = selectMementosForTemporalInterval(mementos, alSumCount);
	  var myCount = 0;
	  for(var mm=0; mm<mementos.length; mm++){
		if(mementos[mm].screenshotURI) {
		 myCount++;
		}
	  }
  
	  console.log(alSumCount + ' Mementos have been selected selected for temporal interval');
	  createThumbnailsForMementosWithAScreenshotURI(mementos, 'temporalInterval');

	  return cb();
	});
}

function performStrategy_random(uri, cb) {
  var timemapHost = 'web.archive.org';
  var timemapPath = '/web/timemap/link/' + uri;
  var tmURI = 'http' + timemapHost + timemapPath;

  var cacheFile = new SimhashCacheFile(uri);
  cacheFile.path += '.json';
  if (!cacheFile.exists()) {
    console.log(('ERROR: Cache file at ' + cacheFile.path + ' does not exist. Not performing random').red);
    return cb();
  }

  console.log('*************************RANDOM STRATEGY*************************');
  var cacheFiles = fs.readdirSync('./cache/');
  var filteredCacheFiles = [];
  var mementos = [];

  fs.readFile(__dirname + cacheFile.path.replace('./','/'), 'utf8', function(err, data) {
	  mementos = JSON.parse(data);
	  var alSumCount = countNumberOfScreenshotsCreatedByAlSumBasedOnCache(mementos);
	  console.log('There were ' + mementos.length + ' mementos. AlSum chose ' + alSumCount);
	  mementos = getRandomSubsetOfMementosArray(mementos, alSumCount);
	  for(var mm = 0; mm < mementos.length; mm++) {
		mementos[mm].screenshotURI = 'toFill';
	  }
	  console.log(alSumCount + ' Mementos have been selected selected for random.');
	  createThumbnailsForMementosWithAScreenshotURI(mementos, 'random');
	
	  return cb();
	});
}


function createThumbnailsForMementos(mementos, strategy) {
  for(var i = 0; i < mementos.length; i++) { // Generate filename of to-be thumbnail
    mementos[i].screenshotURI = strategy + '_' + mementos[i].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';  
  }
  
  var t = new TimeMap();
  t.mementos = mementos;
  t.strategy = strategy;
  t.createScreenshotsForMementos();
}

function createThumbnailsForMementosWithAScreenshotURI(mementos, strategy) {
  for(var i = 0; i < mementos.length; i++) { // Generate filename of to-be thumbnail
    if (mementos[i].screenshotURI) {
      mementos[i].screenshotURI = strategy + '_' + mementos[i].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';  
    }
  }
  
  var t = new TimeMap();
  t.mementos = mementos;
  t.strategy = strategy;
  t.createScreenshotsForMementos();
}

function countNumberOfScreenshotsCreatedByAlSumBasedOnCache(mementos) {
  var screenshotCount = 0;
  for(var m = 0; m < mementos.length; m++) {
    if (mementos[m].screenshotURI) {
      screenshotCount++;
    }
  }
  return screenshotCount;
}

function getIndexesForMementosNeededToBuildInterval(mementos, alSumCount) {
  console.log("AlSUM:" + alSumCount);
  var selectedMementos = 0;
  var iterationFactor = Math.floor(mementos.length / alSumCount);
  for(var i = 0; i < mementos.length && selectedMementos < alSumCount; i++) {
    if (i % iterationFactor === 0) {
      mementos[i].screenshotURI = 'toFill';
      selectedMementos++;
    } else {
      mementos[i].screenshotURI = null;
    }
  }
  console.log("Selected Mementos: "+selectedMementos);
  
  // Correction for floor
  if (selectedMementos < alSumCount) {
    if(!mementos[mementos.length-1].screenshotURI) {
      mementos[mementos.length-1].screenshotURI = 'toFill';
    } else {
      mementos[mementos.length-2].screenshotURI = 'toFill';
    }
  }
  
  return mementos;
}

function selectMementosForTemporalInterval(mementos, alSumCount) {

  var indexes = [];
  var lastMonthYearSignature = '';
  
  // 1. Get only one memento per month-year
  var whitelistedMementoCount = 0;

  for(var i = 0; i < mementos.length; i++) {
    // Moment does not support RFC1123, use UNIX timestamp conversion
    var theMoment =  moment.unix(convertRFC1123toUnixTimesStamp(mementos[i].datetime)); 
    var monthYearSignature = theMoment.month() + '' + theMoment.year();
    if (monthYearSignature !== lastMonthYearSignature) {
      mementos[i].screenshotURI = 'toFill';
      whitelistedMementoCount++;
     // console.log("R"+whitelistedMementoCount);
    }else {
      mementos[i].screenshotURI = null;
    }
    lastMonthYearSignature = monthYearSignature;
  }  
  
  console.log('WHITELISTED ' + whitelistedMementoCount + ' mementos');
  
  // 2. Remove mementos from the end with similar year signature 
  if (whitelistedMementoCount > alSumCount) {
     var pivotYear = -1;
     for (var i = mementos.length - 1; i >= 0; i--) { 
       // Include only mementos flagged for inclusion
       if (mementos[i].screenshotURI) {
         var theMoment =  moment.unix(convertRFC1123toUnixTimesStamp(mementos[i].datetime)); 
         var theMomentYear = theMoment.year();
         if (theMomentYear === pivotYear) {
           mementos[i].screenshotURI = null;
           
           whitelistedMementoCount--;
         } else if (theMomentYear < pivotYear) {
           pivotYear = theMomentYear;
         }else {
           var lastMementoMoment = moment.unix(convertRFC1123toUnixTimesStamp(mementos[mementos.length - 1].datetime));
           pivotYear = lastMementoMoment.year();         
         }
       }
       
       if(whitelistedMementoCount === alSumCount) {
  		  break;
  		}   
     }
 
     if(whitelistedMementoCount > alSumCount) { // Done filtering by month, still too many
       console.log('Still too many mementos. Reduce by another means.');
       while (whitelistedMementoCount > alSumCount) {
         var randomIndex = getRandomInt(0, mementos.length - 1);
         if (mementos[randomIndex].screenshotURI) {
           mementos[randomIndex].screenshotURI = null;
           whitelistedMementoCount--;
         }
       }
     }
     
     console.log('REDUCED whitelist to ' + whitelistedMementoCount + ' mementos');
  
     for(var mm=0, i=0; mm<mementos.length; mm++){
       if(mementos[mm].screenshotURI) {
         i++;
         //console.log('#' + i + ' (' + mm + '/' + mementos.length + '): ' + mementos[mm].datetime + ' ' + mementos[mm].screenshotURI);
       }
     }
  } else {
    console.log('Monthly was too strict. We need to re-add mementos');
  }
  
  return mementos;
}

//TODO: move this to util functions
function getRandomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function convertRFC1123toUnixTimesStamp(inputString) {
  return parseInt((new Date(inputString)).getTime()) / 1000;
}  

/**
* Display thumbnail interface based on passed in JSON
* @param fileContents JSON string consistenting of an array of mementos
* @param response handler to client's browser interface
*/
function processWithFileContents(fileContents) {
  var t = createMementosFromJSONFile(fileContents);
  console.log('There were ' + t.mementos.length + ' mementos');
  t.calculateHammingDistancesWithOnlineFiltering();
  t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI();
  t.createScreenshotsForMementos(function() {console.log('Done creating screenshots'); });
}

/**
* Convert a string from the JSON cache file to Memento objects
* @param fileContents JSON string consistenting of an array of mementos
*/
function createMementosFromJSONFile(fileContents) {
  var t = new TimeMap();
  t.mementos = JSON.parse(fileContents);
  return t;
}

TimeMap.prototype.toString = function() {
  return '{' +
    '"timemaps":[' + this.timemaps.join(',') + '],' +
    '"timegates":[' + this.timegates.join(',') + '],' +
    '"mementos":[' + this.mementos.join(',') + ']' +
  '}';
};


/**
* Extend Memento object to be more command-line friendly without soiling core
*/
Memento.prototype.toString = function() {
  return JSON.stringify(this);
};

// Add Thumbnail Summarization attributes to Memento Class without soiling core
Memento.prototype.simhash = null;
Memento.prototype.captureTimeDelta = -1;
Memento.prototype.hammingDistance = -1;
Memento.prototype.simhashIndicatorForHTTP302 = '00000000';
var simhashesCreated = 0;

/**
* Fetch URI-M HTML contents and generate a Simhash
*/
Memento.prototype.setSimhash = function() {
  // Retain the URI-R for reference in the promise (this context lost with async)
  var thaturi = this.uri;
  var thatmemento = this;

  return (new Promise(function(resolve, reject) {
    var buffer2 = '';
    var memento = this; // Potentially unused? The 'this' reference will be relative to the promise here
    var mOptions = url.parse(thaturi);
    //console.log("Starting a simhash: "+ mOptions.host+ mOptions.path);
    var req = http.request({
        'host': mOptions.host, 
        'path': mOptions.path,
        'headers': {'Accept-Datetime': 'Thu, 31 May 2007 20:35:00 GMT'}
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(data) {
        buffer2 += data.toString();
      });

      if (res.statusCode !== 200) {
        thatmemento.simhash = Memento.prototype.simhashIndicatorForHTTP302;
      }

      res.on('end', function(d) {
        var md5hash = md5(thatmemento.originalURI); // URI-R cannot be passed in the raw

        if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 && thatmemento.simhash != '00000000') {

          var sh = simhash((buffer2).split('')).join('');
          //console.log(sh);
          //var retStr = getHexString(sh);
          var retStr = sh; // Changing the Simhash to a bin string from hex for more refined calculation

          if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302) {
            // Normalize so not undefined
            retStr = Memento.prototype.simhashIndicatorForHTTP302;

            // Gateway timeout from the archives, remove from consideration
            resolve('isA302DeleteMe');
          }

          buffer2 = '';
          buffer2 = null;

          //console.log(retStr + ' - ' + mOptions.host + mOptions.path);
          simhashesCreated++;
          
          thatmemento.simhash = retStr;

          resolve(retStr);
        }else {
          // We need to delete this memento, it's a duplicate and a "soft 302" from archive.org
          resolve('isA302DeleteMe');
        }
      });

      res.on('error', function(err) {
        console.log('REJECT!');
        reject(Error('Network Error'));
        console.log('Simhash rejected');
      });
    });

	req.on('timeout', function () {
	  console.log('timeout for ' + thaturi);
	  req.abort();
	  resolve('isA302DeleteMe');
	});
	req.on('error', function (e) {
	  console.log('timeout');
	  console.log(e);
	  req.abort();
	  resolve('isA302DeleteMe');
	});	
	req.setTimeout(60000);
    req.end();
  }));
}

function nextURI(uris, cb, nextStrategyCallback) {
  uris.shift();
  
  if (uris.length > 0) {
    if (uris[0].length === 0) { // Skip blank lines in input file, recurse
      uris.shift();
      nextURI(uris, cb, nextStrategyCallback);
      return;
    }
	cb(uris, nextStrategyCallback);
  } else {
    nextStrategyCallback();
  }
}

/**
* Given a URI, return a TimeMap from the Memento Aggregator
* @param uri The URI-R in-question
*/
function performStrategy_alsum(uri, cb) {
  //var uri = uris[0];
  var timemapHost = 'web.archive.org';
  var timemapPath = '/web/timemap/link/' + uri;

  console.log('Starting many asynchronous operations...');
  var tm = new TimeMap();
  tm.original = uri;
  tm.strategy = 'alSum';
  
  try {
	  async.series([
		  function(callback) {tm.fetchTimemap('http://' + timemapHost + timemapPath, callback);},
		  function(callback) {tm.calculateSimhashes(callback);},
		  function(callback) {tm.saveSimhashesToCache(callback);},
		  function(callback) {tm.calculateHammingDistancesWithOnlineFiltering(callback);},
		  function(callback) {tm.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);},
		  function(callback) {tm.writeJSONToCache(callback);},
		  function(callback) {tm.createScreenshotsForMementos(callback);}],
		function(err, result) {
			if (err) {
			  console.log('ERROR with http://' + timemapHost + timemapPath + ' : ' +err);
			}else {
			  console.log('Processing of ' + 'http://' + timemapHost + timemapPath + ' complete.');  
			}
		
			return cb();
			//nextURI(uris, performStrategy_alsum, cb);
		  }
	  );
  
  } catch(err) {
    console.log('Exception: ' + err + ' ' + uri);
    return cb();
  }
} 

// Fisher-Yates shuffle per http://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubsetOfMementosArray(arr, size) {
  var shuffled = arr.slice(0);
  var i = arr.length;
  var temp;
  var index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }

  return shuffled.slice(0, size);
}

function getTimeDiffBetweenTwoMementoURIs(newerMementoURI, olderMementoURI) {
  var newerDate = newerMementoURI.match(/[0-9]{14}/g)[0];  // Newer
  var olderDate = olderMementoURI.match(/[0-9]{14}/g)[0];  // Older

  if (newerDate && olderDate) {
    try {
	  var diff = (parseInt(newerDate) - parseInt(olderDate));
	  return diff;
    }catch (e) {
	  console.log(e.message);
    }
  }else {
    throw new Exception('Both mementos in comparison do not have encoded datetimes in the URIs:\r\n\t' + newerMemento.uri + '\r\n\t' + olderMemento.uri);
  }
}







/*****************************************
   // SUPPLEMENTAL TIMEMAP FUNCTIONALITY
***************************************** */

TimeMap.prototype.fetchTimemap = function(uri, callback) {
  console.log('Fetching TimeMap for ' + uri);
  var opt = url.parse(uri);
  var tm = this;
  opt['headers'] = {'Accept-Datetime': 'Thu, 31 May 2007 20:35:00 GMT'}
  
  
  http.get(opt, function (res) {
    var buffer = '';
    res.setEncoding('utf8');
    res.on('data', function(data) {
        buffer += data.toString();
    });
    
    res.on('end', function(d) {
      tm.str = buffer;
      tm.originalURI = uri;
      tm.createMementos();

      if (tm.mementos.length === 0) {
        console.log('There were no mementos for ' + uri + ' :(');
        throw "NoMementosForURI";
      }
      callback();
    });
  }).on('error', function(err) {
  
  });
}


TimeMap.prototype.calculateSimhashes = function(callback) {
  
  var theTimeMap = this;
  console.log('Calculating Simhashes for ' + theTimeMap.originalURI);
  var arrayOfSetSimhashFunctions = [];

  for (var m = 0; m < this.mementos.length; m++) {
    this.mementos[m].originalURI = this.originalURI; 
    arrayOfSetSimhashFunctions.push(this.mementos[m].setSimhash());
  }

  function echoNumberOfMementosComplete(uri,totalNumberOfMementos) {
    console.log(' - ' + simhashesCreated + '/' + totalNumberOfMementos + ' simhashes generated for ' + uri);
  }
  simhashesCreated = 0;
  var reportSimhashStatus = setInterval(echoNumberOfMementosComplete, 2000, this.originalURI, this.mementos.length);

  // console.time('simhashing');
  var theTimemap = this;
  return Promise.all(
    arrayOfSetSimhashFunctions
  ).catch(function(err) {
    console.log('OMFG, an error!');
    console.log(err);
  }).then(function() {
    clearInterval(reportSimhashStatus);

    var mementosRemoved = 0;
    var numberOfMementosPre302Trimming = theTimemap.mementos.length;
    // Remove all mementos whose payload body was a Wayback soft 302
    for (var i = theTimemap.mementos.length - 1; i >= 0; i--) {
      if (theTimemap.mementos[i].simhash === 'isA302DeleteMe' || theTimemap.mementos[i].simhash === '00000000') {
        theTimemap.mementos.splice(i, 1);
        mementosRemoved++;
      }
    }

    // console.timeEnd('simhashing');
    console.log('REMOVED ' + mementosRemoved + ' mementos removed due to Wayback "soft 3xxs". ' + numberOfMementosPre302Trimming + ' --> ' + theTimemap.mementos.length);
    if (callback) {callback('');}
  });
}

TimeMap.prototype.saveSimhashesToCache = function(callback,format) {
  // TODO: remove dependency on global timemap t
  console.log('CACHING simhashes to a local file');
  var strToWrite = '';
  for (var m = 0; m < this.mementos.length; m++) {
    if (this.mementos[m].simhash != Memento.prototype.simhashIndicatorForHTTP302) {
      strToWrite += this.mementos[m].simhash + ' ' + this.mementos[m].uri + ' ' + this.mementos[m].datetime + '\r\n';
    }
  }

  var cacheFile = new SimhashCacheFile(this.original);
  cacheFile.replaceContentWith(strToWrite);

  if (callback) {callback('');}
}

TimeMap.prototype.writeJSONToCache = function(callback) {
  var cacheFile = new SimhashCacheFile(this.original);
  cacheFile.writeFileContentsAsJSON(JSON.stringify(this.mementos));
  if (callback) {callback('');}
}

/**
* Converts the target URI to a safe semantic filename and attaches to relevant memento.
* Selection based on passing a hamming distance threshold
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI = function(callback) {
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  
  // TODO: verify that the number of mementos meets our magic threshold of 4<x<16
  
  var summarizedMementoCountOk = false;
  var currentHammingThreshold = HAMMING_DISTANCE_THRESHOLD;
  while(!summarizedMementoCountOk) {
	  var mementosSelected = 0;
  
	  this.mementos.forEach(function(memento,m) {
		var uri = memento.uri;
		// console.log("Hamming distance = "+memento.hammingDistance);
		if (memento.hammingDistance < currentHammingThreshold  && memento.hammingDistance >= 0) {
		  // console.log(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD);
		  memento.screenshotURI = null;
		} else {
		  var filename = 'alSum_' + uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'; // Sanitize URI->filename
		  memento.screenshotURI = filename;
		  ++mementosSelected;
		}
	  });

	  if (currentHammingThreshold === HAMMING_DISTANCE_THRESHOLD_INIT) {
		if (mementosSelected < 4) {
		  console.log('ABORTING due to too few mementos as base hamming threshold');

		  callback(new Error("INSUFFICIENT_MEMENTOS: " + mementosSelected));
		  return;
		}
	  }
      
      console.log('HAMMING filtering resulted in ' + mementosSelected + ' mementos.');
	  if (mementosSelected < 4) {
	    console.log('HAMMING threshold surpassed, revert!');
	    callback(new Error('CANNOT MEET memento count requirements of 4<x<16'));
		// Revert to previous hamming distance
	  } else if (mementosSelected > 16) {
		currentHammingThreshold += 1;
		console.log('HAMMING threshold insufficient, increasing to ' + currentHammingThreshold);
	  } else {
	    console.log('HAMMING criteria met with ' + mementosSelected + ' mementos and hamming = ' + currentHammingThreshold);
	    summarizedMementoCountOk = true;
	  }
  }
  console.log('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back');
  if (callback) {callback('');}
}



/**
* Converts the filename of each previously selected memento a a valid image filename and associate
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplySelectedMementosAScreenshotURI = function(strategy,callback) {
  var ii = 0;
  for (var m in this.mementos) {
    if (this.mementos[m].selected) {
      var filename = strategy + '_' + this.mementos[m].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';
      this.mementos[m].screenshotURI = filename;
      ii++;
    }
  }

  console.log('Done creating filenames for ' + ii + ' mementos');

  if (callback) {callback('');}
}

/**
* Select random mementos from the TimeMap up to a specified quantity
* @param callback The next procedure to execution when this process concludes
* @param numberOfMementosToChoose The count threshold before the selection strategy has been satisfied
*/
TimeMap.prototype.supplyChosenMementosBasedOnUniformRandomness = function(callback, numberOfMementosToChoose) {
  var _this = this;
  if (numberOfMementosToChoose > this.mementos.length) {
    console.log('Number to choose is greater than number existing.');
    return;
  }

  var numberOfMementosLeftToChoose = numberOfMementosToChoose;
  while (numberOfMementosLeftToChoose > 0) {
    var randomI = Math.floor(Math.random() * this.mementos.length);
    if (!this.mementos[randomI].selected) {
      this.mementos[randomI].selected = true;
      numberOfMementosLeftToChoose--;
    } // Duplicately selected would take an else, so it's unnecessary

  }

  callback();
}

/**
* TODO: document
* @param callback The next procedure to execution when this process concludes
* @param numberOfMementosToChoose The count threshold before the selection strategy has been satisfied
*/
TimeMap.prototype.supplyChosenMementosBasedOnTemporalInterval = function(callback, numberOfMementosToChoose) {
  var _this = this;
  console.log('OriginalURI is ' + _this.originalURI);
  if (numberOfMementosToChoose > this.mementos.length) {
    console.log('Number to choose is greater than number existing.');
    return;
  }

  var lastMonthRecorded = -1;

  var selectedIndexes = []; // Maintaining memento indexes to prune
  for (var i = 0; i < this.mementos.length; i++) {
    var datetimeAsDate = new Date(this.mementos[i].datetime);
    var thisYYYYMM = datetimeAsDate.getFullYear() + '' + datetimeAsDate.getMonth();

    if (thisYYYYMM !== lastMonthRecorded) {
      this.mementos[i].selected = true;
      lastMonthRecorded = thisYYYYMM;
      console.log(this.mementos[i].datetime + ' accepted');
      selectedIndexes.push(i);
    }else {
      console.log(this.mementos[i].datetime + ' rejected (same month as previous selected)');
    }
  }

  var beforeOK = this.mementos.filter(function(el) {
    return el.selected !== null;
  });

  console.log('We are going to choose ' + numberOfMementosToChoose + ' --- ' + selectedIndexes);
  // Prune based on numberOfMementosToChoose
  while (selectedIndexes.length > numberOfMementosToChoose) {
    var mementoIToRemove = Math.floor(Math.random() * selectedIndexes.length);
    console.log(selectedIndexes.length + ' is too many mementos, removing index ' + mementoIToRemove);
    console.log(this.mementos[mementoIToRemove].datetime + ' was ' + this.mementos[mementoIToRemove].selected);
    delete this.mementos[selectedIndexes[mementoIToRemove]].selected;
    console.log('Now it is ' + this.mementos[mementoIToRemove].selected);
    selectedIndexes.splice(mementoIToRemove, 1);
  }

  var monthlyOK = this.mementos.filter(function(el) {
    return el.selected;
  });

  console.log(beforeOK.length + ' --> ' + monthlyOK.length + ' passed the monthly test');

  callback();
};

/**
* Generate a screenshot with all mementos that pass the passed-in criteria test
* @param callback The next procedure to execution when this process concludes
* @param withCriteria Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementos = function(callback, withCriteria) {
  function hasScreenshot(e) {
    return e.screenshotURI !== null;
  }

  var self = this;

  var criteria = hasScreenshot;
  if (withCriteria) {criteria = withCriteria; }
  
  console.log('Creating screenshots for ' + self.mementos.filter(criteria).length + ' mementos...');
    
  var totalCount = self.mementos.filter(criteria).length;
  async.eachLimit(
    shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
    1,
    function(item, callback) {
      self.createScreenshotForMemento(item, self.strategy, callback)
    },           // Create a screenshot
    function doneCreatingScreenshots(err) {      // When finished, check for errors
      if (err) {
        console.log('Error creating screenshot');
        console.log(doneCount + '/' + self.mementos.length + ' complete');
        console.log(err);
      }
      phridge.disposeAll();
      if(callback){callback('');}
    }
  );
};

function sanitizeURIForPathname(uriR) {
 var sanitizedURI = uriR.replace('httpwebarchiveorgweb','').replace('http','_').replace('www','');
  //console.warn('sanitizing ' + uriR + ' to ' + sanitizedURI);
  return sanitizedURI;
}

TimeMap.prototype.createScreenshotForMemento = function(memento, strategy, callback) {
  addURIMToLog(memento.uri, strategy);
  callback();
  return;


  var uri = memento.uri;
  var uriDir = md5(this.original);
  uriDir = this.original ? this.original : this.original_uri; // Change screenshots dir to URIM instead of hash
  //sanitizeURIForPathname(this.original);

  memento.screenshotURI = sanitizeURIForPathname(memento.screenshotURI);

  var filename = memento.uri;
  console.log(filename);
  callback();
  
  return;
  var fileDescriptor;
  try {
    var fileExists = fs.statSync(path.join(__dirname + '/screenshots/' + uriDir + '/' + memento.screenshotURI));
    if (fileExists) {
      throw 'nofile';
    }

    console.log(memento.screenshotURI + ' already exists...continuing');
    callback();
    return;
  }catch (e) { //(new Date()).getTime()
    console.log(' - ' + memento.screenshotURI + ' does not exist...generating');
  }
  if (fileDescriptor) {
    fs.closeSync(fileDescriptor);
  }

  var options = {
    'phantomConfig': {
      'ignore-ssl-errors': true,
      'local-to-remote-url-access': true // ,
      // 'default-white-background': true,
    },
    // Remove the Wayback UI
    'onLoadFinished': function() {
      document.getElementById('wm-ipp').style.display = 'none';
    },
    'timeout': 60000
  };

  webshot(uri, 'screenshots/' + uriDir + '/' + filename, options, function(err) {
    if (err) {
      console.log('Error creating a screenshot for ' + uri);
      console.log(filename);
      console.log(err);
      //callback('Screenshot failed!');
      addToErrorQueue(uri);
      callback();
    }else {
      /*
      fs.chmodSync('./screenshots/' + uriDir + '/' + filename, '755');
      gm('./screenshots/' + uriDir + '/' + filename)
      .resize(200, 150)
      .write('./screenshots/' + uriDir + '/' + (filename.replace('.png', '_200.png')), function(err) {
        if (!err) {
          console.log(' - SCALED ' + filename + ' to 200 pixels, deleting original asynchronously.');
          deleteFile('./screenshots/' + uriDir + '/' + filename);
        } else {
          console.log('We could not downscale ./screenshots/' + uriDir + '/' + filename + ' :(');
        }
      });
      console.log(' - CREATED screenshot ' + uri);
      removeFromScreenshotsToGenerateQueue(filename);
      callback();
      */
    }
    callback();
  });


  
};


var screenshotsToGenerate = {};

function addToScreenshotsToGenerateQueue(filename) {
  console.log('ADDING to queue '+ filename + ', new length: '+ Object.keys(screenshotsToGenerate).length);
  screenshotsToGenerate[filename] = 'TODO';
  repeatCount = 0;
}

function removeFromScreenshotsToGenerateQueue(filename) {
  delete screenshotsToGenerate[filename];
  console.log('REMOVING from queue '+ filename + ', new length: ' + Object.keys(screenshotsToGenerate).length);
  repeatCount = 0;
}

function addToErrorQueue(uri) { //TODO:
  console.log('Added to error queue: ' + uri);
}

function deleteFile(path) {
  fs.unlink(path, function(err) {
    if (!err) {
      console.log(' - DELETED ' + path);
    } else {
      console.log('Error deleting ' + path);
    }
  });
}

TimeMap.prototype.calculateHammingDistancesWithOnlineFiltering = function(callback) {
  var lastSignificantMementoIndexBasedOnHamming = 0;

  console.log('CALCULATING hamming distances for ' + this.mementos.length + ' mementos');
  for (var m = 0; m < this.mementos.length; m++) {
    if (m > 0) { // Hamming distance is only applicable once we have a basis
      if (typeof this.mementos[m]['simhash'] == 'object') { // Odd behavior of the simhash attr being reported as an obj, correct it here
        this.mementos[m]['simhash'] = this.mementos[m]['simhash'] + '';
      }
      
      if ((this.mementos[m]['simhash'].match(/0/g) || []).length === 32) {
        console.log('ENCOUNTERED simhash of 0s, returning.'); 
        continue;
      }
      this.mementos[m].hammingDistance = getHamming(this.mementos[m].simhash, this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash);
      this.mementos[m].hammingBasis = this.mementos[lastSignificantMementoIndexBasedOnHamming].datetime;
      
      if (this.mementos[m].hammingDistance >= HAMMING_DISTANCE_THRESHOLD) { // Filter the mementos if hamming distance is too small
        lastSignificantMementoIndexBasedOnHamming = m;
      }
    }
    console.log(' - memento[' + m + '] hamming: ' + this.mementos[m].hammingDistance + ' ' + this.mementos[m]['simhash']);
  }

  if (callback) {callback(''); }
};

/**********************************
        RELEVANT yet ABSTRACTED generic functions
   ********************************* */

function getHamming(str1_bin, str2_bin) {
  if (!str1_bin || !str2_bin) { // Catch nulls
    return 0;
  }

  if (str1_bin.length !== str2_bin.length) {
    // Resilience instead of crashing
    console.log('Unequal lengths when both strings must be equal to calculate hamming distance:');
    console.log(str1_bin + ' ' + str2_bin + ' ' + str1_bin.length + ' ' + str2_bin.length);
    return 0;
  }else if (str1_bin === str2_bin) {
    return 0;
  }

  var calculatedHammingDistance = 0;  
  //var str1_bin = Hex2BinWithPadding(str1_hex);
  //var str2_bin = Hex2BinWithPadding(str2_hex);
  
  for (var ii = 0; ii < str1_bin.length; ii++) {
    if (str1_bin[ii] !== str2_bin[ii]) {
      calculatedHammingDistance++;
    }
  }
  
  return calculatedHammingDistance;
}

// Fischer-Yates shuffle so we don't fetch the memento in-order but preserve
// them as objects and associated attributes
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

/**********************************
        UTILITY FUNCTIONS
   *********************************
TODO: break these out into a separate file
*/

// Graceful exit
process.on('SIGINT', function() {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit();
});

// Useful Functions
function checkBin(n) {
  return /^[01]{1,64}$/.test(n);
}

function checkHex(n) {
  return /^[0-9A-Fa-f]{1,64}$/.test(n);
}

function Bin2Hex(n) {
  if (!checkBin(n)) {
    return 0;
  }

  return parseInt(n,2).toString(16);
}

// Turns (e.g.) 4e to 01001110 instead of 1001110
function Hex2BinWithPadding(n) {
  if (!checkHex(n)) {
    return 0;
  }
  
  var binStr = '';
  for(var i = 0; i < n.length; i++) {
    var targetChar = n.charAt(i);
    var targetCharAsNaiveHex = parseInt(targetChar,16).toString(2);
    pad = '0000'
    binStr += (pad + targetCharAsNaiveHex).slice(-pad.length)
  }
  
  return binStr;
}

function addURIMToLog(urim, strategy) {
  console.log('adding to log: '+urim);
  //console.log(__dirname + '/urisToGenerateScreenshots.log');
	fs.appendFileSync(__dirname + '/urisToGenerateScreenshots.log', strategy + ' ' + urim + '\n',encoding='utf8', function(err) {
	  if(err) {
	  console.log('error!');
	  console.log(err);
		throw error;
	  }
	});
}

function Hex2Dec(n) {
  if (!checkHex(n)) {
    return 0;
  }

  return parseInt(n,16).toString(10);
}

function getHexString(onesAndZeros) {
  var str = '';
  for (var i = 0; i < onesAndZeros.length; i = i + 4) {
    str += Bin2Hex(onesAndZeros.substr(i,4));
  }

  return str;
}

/* *********************************
    end UTILITY FUNCTIONS
********************************* */

exports.main = main;
main();
