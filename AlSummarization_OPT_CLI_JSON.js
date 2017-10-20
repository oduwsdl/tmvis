'use strict'
/* ********************************
*  AlSummarization
*  An implementation for Ahmed AlSum's ECIR 2014 paper:
*   "Thumbnail Summarization Techniques for Web Archives"
*  Mat Kelly <mkelly@cs.odu.edu>
******************************************
* AlSummarization_OPT_CLI_JSON
* using the existing code and tweeking it to the code that returns the JSON Alone,
* And some code to be added to optimize the process of selecting which memento to
* be considered for simhash generation.
* OPT in the file name stands for optimization, Where id_ is appended at the end to return only the original content
*  Run this with:
*   > node AlSummarization_OPT_CLI_JSON.js URI-R
*
* Updated
*  > node AlSummarization_OPT_CLI_JSON.js URI-R [--debug] [--hdt 4] [--ia || --ait || -mg] [--oes] [--ci 1068] [--os || --s&h]
*  ex: node AlSummarization_OPT_CLI_JSON.js http://4genderjustice.org/ --oes --debug --ci 1068
* debug -> Run in debug mode
* hdt -> Hamming Distance Threshold
* ia -> Internet Archive
* ait -> Archive IT
* mg -> Memegator
* oes -> Override Existing Simhashes
* debug -> to get the debugging comments on the scree
* ci -> Collection Identifier, incase of ait
* os -> Only Simhash
* s&h -> Both Simhash and Hamming Distance
* Maheedhar Gunnam <mgunn001@odu.edu>
*/

var http = require('http')
//var express = require('express')
var url = require('url')
var connect = require('connect')
var serveStatic = require('serve-static')
// var Step = require('step')
var async = require('async')
// var Futures = require('futures')
var Promise = require('es6-promise').Promise
var Async = require('async')
var simhash = require('simhash')('md5')
var moment = require('moment')

var ProgressBar = require('progress')
var phantom = require('node-phantom')

var fs = require('fs')
var path = require('path')
var validator = require('validator')
var underscore = require('underscore')

var webshot = require('webshot') // PhantomJS wrapper

var argv = require('minimist')(process.argv.slice(2))
var prompt = require('syncprompt')

var mementoFramework = require('./_js/mementoFramework.js')
var Memento = mementoFramework.Memento
var TimeMap = mementoFramework.TimeMap
var SimhashCacheFile = require('./_js/simhashCache.js').SimhashCacheFile

var colors = require('colors')
var im = require('imagemagick')
var rimraf = require('rimraf')

//var faye = require('faye') // For status-based notifications to client

// Faye's will not allow a URI-* as the channel name, hash it for Faye
var md5 = require('md5')

var prompt = require('prompt')
var zlib = require('zlib')
//var app = express()

var uriR = ''
var isDebugMode = argv.debug? argv.debug: false
var HAMMING_DISTANCE_THRESHOLD = argv.hdt?  argv.hdt: 4
var isToOverrideCachedSimHash = argv.oes? argv.oes: false
// by default the prime src is gonna be Archive-It
var primeSrc = argv.ait? 1: (argv.ia ? 2:(argv.mg?3:1))
var isToComputeBoth = argv.os? false: true // By default computes both simhash and hamming distance
var collectionIdentifier = argv.ci?  argv.ci: 'all'

ConsoleLogIfRequired("Primary source: ( ait -> 1, ia ->2 & mg -> 3)"+primeSrc)
ConsoleLogIfRequired("collectionIdentifier for Archive-It :"+collectionIdentifier)
//return
/* *******************************
   TODO: reorder functions (main first) to be more maintainable 20141205
****************************** */

/**
* Start the application by initializing server instances
*/
function main () {

  ConsoleLogIfRequired(('*******************************\r\n' +
               'THUMBNAIL SUMMARIZATION SERVICE\r\n' +
               '*******************************').blue)
  ConsoleLogIfRequired("--By Mahee - for understanding")

  var endpoint = new CLIEndpoint()
  endpoint.headStart()
}


/**
* Setup the public-facing attributes of the service
*/
function CLIEndpoint () {
  var theEndPoint = this


  // Parameters supplied for means of access:
  this.validAccessParameters = ['interface', 'wayback', 'embed']

  // Parameter supplied for summarization strategy:
  this.validStrategyParameters = ['alSummarization', 'random', 'temporalInterval', 'interval']

  this.isAValidAccessParameter = function (accessParameter) {
    return theEndPoint.validAccessParameters.indexOf(accessParameter) > -1
  }

  this.isAValidStrategyParameter = function (strategyParameter) {
    return theEndPoint.validStrategyParameters.indexOf(strategyParameter) > -1
  }


  // this is method this.respondToClient, modified for CLI
  this.headStart = function () {
    var headers = {}
    var response ={}
    var URIRFromCLI = ""

    // if (process.argv.length <= 2) {
    //     ConsoleLogIfRequired("No Arguments given");
    //     process.exit(-1);
    // }else{
    //   var param = process.argv[2];
    //   ConsoleLogIfRequired('Param: ' + param);
    //   process.exit(-1);
    // }
    ConsoleLogIfRequired("argv:"+ JSON.stringify(argv))
    ConsoleLogIfRequired("argv url :"+ argv["_"][0])
    ConsoleLogIfRequired("argv length:"+ argv.length)
    ConsoleLogIfRequired("isDebugMode:"+isDebugMode)

    if (process.argv.length <= 2) {
        ConsoleLogIfRequired('No Argument was passed.. Trying with URI-R = http://www.cs.odu.edu/~mweigle/Research/')
        URIRFromCLI = '/?URI-R=http://www.cs.odu.edu/~mweigle/Research/'
    }else{
        URIRFromCLI = '/?URI-R='+process.argv[2]
    }

    ConsoleLogIfRequired('URI-R From CLI: ' + URIRFromCLI)

    var query = url.parse(URIRFromCLI, true).query
    ConsoleLogIfRequired("--- ByMahee: Query URL from client = "+ JSON.stringify(query))
    /******************************
       IMAGE PARAMETER - allows binary image data to be returned from service
    **************************** */
    if (query.img) {
      // Return image data here
      var fileExtension = query.img.substr('-3') // Is this correct to use a string and not an int!?
      ConsoleLogIfRequired('fetching ' + query.img + ' content')
      var img = fs.readFileSync(__dirname + '/' + query.img)
      ConsoleLogIfRequired("200, {'Content-Type': 'image/'" + fileExtension +'}')
      return
    }

    /******************************
       URI-R PARAMETER - required if not img, supplies basis for archive query
    **************************** */

    function isARESTStyleURI (uri) {
      return (uri.substr(0, 5) === '/http')
    }

    if (query['URI-R']) { // URI-R is specied as a query parameter
      ConsoleLogIfRequired('URI-R valid, using query parameter.')
    }

    // ByMahee --- Actually URI is being set here
    uriR = query['URI-R']
    ConsoleLogIfRequired("--ByMahee: uriR = "+uriR)

    var access = theEndPoint.validAccessParameters[0] // Not specified? access=interface
    // Override the default access parameter if the user has supplied a value
    //  via query parameters
    if (query.access) {
      access = query.access
    }

    if (!theEndPoint.isAValidAccessParameter(access)) { // A bad access parameter was passed in
      ConsoleLogIfRequired('Bad access query parameter: ' + access)
      return
    }

    headers['X-Means-Of-Access'] = access

    var strategy = theEndPoint.validStrategyParameters[0] // Not specified? access=interface
    var strategyHeuristic = true // If no strategy is expicitly specified, test-and-guess

    if (query.strategy) {
      strategy = query.strategy
      strategyHeuristic = false
    }

    if (!theEndPoint.isAValidStrategyParameter(strategy)) { // A bad strategy parameter was passed in
      ConsoleLogIfRequired('Bad strategy query parameter: ' + strategy)
      response.writeHead(501, headers)
      response.write('The strategy parameter was incorrect. Try one of ' + theEndPoint.validStrategyParameters.join(',') + ' or omit it entirely from the query string\r\n')
      response.end()
      return
    }

    headers['X-Summarization-Strategy'] = strategy

    if (!uriR.match(/^[a-zA-Z]+:\/\//)) {
      uriR = 'http://' + uriR
    }// Prepend scheme if missing


    headers['Content-Type'] = 'text/html' // application/json

    ConsoleLogIfRequired('New client request URI-R: ' + query['URI-R'] + '\r\n> Access: ' + access + '\r\n> Strategy: ' + strategy)

    if (!validator.isURL(uriR)) { // Return "invalid URL"
      consoleLogJSONError('Invalid URI')
      return
    }

    function consoleLogJSONError (str) {
      ConsoleLogIfRequired('{"Error": "' + str + '"}')
    }

    // ByMahee -- setting the  incoming data from request into response Object
    response.thumbnails = [] // Carry the original query parameters over to the eventual response
    response.thumbnails['access'] = access
    response.thumbnails['strategy'] = strategy

    /*TODO: include consideration for strategy parameter supplied here
            If we consider the strategy, we can simply use the TimeMap instead of the cache file
            Either way, the 'response' should be passed to the function representing the chosen strategy
            so the function still can return HTML to the client
    */
    var t = new TimeMap()

    t.originalURI = query['URI-R']

    // TODO: optimize this out of the conditional so the functions needed for each strategy are self-contained (and possibly OOP-ified)
    if (strategy === 'alSummarization') {
      var cacheFile = new SimhashCacheFile(uriR,isDebugMode)
      cacheFile.path += '.json'
      ConsoleLogIfRequired('Checking if a cache file exists for ' + query['URI-R'] + '...')
    //  ConsoleLogIfRequired('cacheFile: '+JSON.stringify(cacheFile))
      cacheFile.readFileContents(
        function success (data) {
          // A cache file has been previously generated using the alSummarization strategy

          // ByMahee -- ToDo: We can even add a prompt from user asking whether he would want to recompute hashes here
          ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Success ReadFile Content, processWithFileContents is called next ")

            if(isToOverrideCachedSimHash){
              ConsoleLogIfRequired("Responded to compute latest simhahes, Proceeding....");
              getTimemapGodFunctionForAlSummarization(query['URI-R'], response)
            }else{
              ConsoleLogIfRequired("Responded to continue with the exisitng cached simhashes file. Proceeding..");
              processWithFileContents(data, response)
            }
          //ByMahee -- UnComment Following Line(UCF)
         //  processWithFileContents(data, response)
        },
        function failed () {
          //ByMahee -- calling the core function responsible for AlSummarization, if the cached file doesn't exist
          ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Failed ReadFile Content (meaning file doesn't exist), getTimemapGodFunctionForAlSummarization is called next ")
          //ByMahee -- UCF
          getTimemapGodFunctionForAlSummarization(query['URI-R'], response)
        }

      )
    } else if (strategy === 'random') {
      t.setupWithURIR(response, query['URI-R'], function selectRandomMementosFromTheTimeMap () {
        var numberOfMementosToSelect = 16 // TODO: remove magic number
        t.supplyChosenMementosBasedOnUniformRandomness(generateThumbnailsWithSelectedMementos, numberOfMementosToSelect)
        setTimeout(function () {
          var client = new faye.Client(notificationServer)

          client.publish('/' + md5(t.originalURI), {
            'uriM': 'done'
          })
        }, 2000)
      })

    } else if (strategy === 'temporalInterval') {
      t.setupWithURIR(response, query['URI-R'], function selectOneMementoForEachMonthPresent () { // TODO: refactor to have fewer verbose callback but not succumb to callback hell
        t.supplyChosenMementosBasedOnTemporalInterval(generateThumbnailsWithSelectedMementos, 16) // TODO: remove magic number, current scope issues with associating with callback
        setTimeout(function () {
          var client = new faye.Client(notificationServer)

          client.publish('/' + md5(t.originalURI), {
            'uriM': 'done'
          })
        }, 2000)

      })
    } else if (strategy === 'interval') {
      t.setupWithURIR(response, query['URI-R'], function selectMementosBasedOnInterval () { // TODO: refactor to have fewer verbose callback but not succumb to callback hell
        t.supplyChosenMementosBasedOnInterval(generateThumbnailsWithSelectedMementos, Math.floor(t.mementos.length / 16)) // TODO: remove magic number, current scope issues with associating with callback
      })

      setTimeout(function () {
        var client = new faye.Client(notificationServer)

        client.publish('/' + md5(t.originalURI), {
          'uriM': 'done'
        })
      }, 2000)
    }

    // TODO: break apart callback hell
    function generateThumbnailsWithSelectedMementos () {
      // suboptimal route but reference to t must be preserved
      // TODO: move this to TimeMap prototype
      t.supplySelectedMementosAScreenshotURI(strategy, function (callback) {
        t.printMementoInformation(response, function () {
          t.createScreenshotsForMementos(
            function () {
              ConsoleLogIfRequired('Done creating screenshots')
            }
          )
        })
      })
    }
  }
}





/**
* Delete all derived data including caching and screenshot - namely for testing
* @param cb Callback to execute upon completion
*/
function cleanSystemData (cb) {
  // Delete all files in ./screenshots/ and ./cache/
  var dirs = ['screenshots', 'cache']
  dirs.forEach(function (e, i) {
    rimraf(__dirname + '/' + e + '/*', function (err) {
      if (err) {
        throw err
      }
      ConsoleLogIfRequired('Deleted contents of ./' + e + '/')
    })

    ConsoleLogIfRequired(e)
  })

  if (cb) {
    cb()
  }
}

/**
* Display thumbnail interface based on passed in JSON
* @param fileContents JSON string consistenting of an array of mementos
* @param response handler to client's browser interface
*/
function processWithFileContents (fileContents, response) {

  var t = createMementosFromJSONFile(fileContents)
  /* ByMahee -- unnessessary for the current need
  t.printMementoInformation(response, null, false) */

  ConsoleLogIfRequired("Existing file contents are as follows:")
  ConsoleLogIfRequired("**************************************************************************************************");
  console.log(JSON.stringify(t));
    if(isToComputeBoth){
      t.calculateHammingDistancesWithOnlineFiltering()
      t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI()
      t.createScreenshotsForMementos(function () {
        ConsoleLogIfRequired.log('Done creating screenshots')
      })
    }
}

/**
* Convert a string from the JSON cache file to Memento objects
* @param fileContents JSON string consistenting of an array of mementos
*/
function createMementosFromJSONFile (fileContents) {
  var t = new TimeMap()
  t.mementos = JSON.parse(fileContents)
  return t
}

TimeMap.prototype.toString = function () {
  return '{' +
    '"timemaps":[' + this.timemaps.join(',') + '],' +
    '"timegates":[' + this.timegates.join(',') + '],' +
    '"mementos":[' + this.mementos.join(',') + ']' +
  '}'
}


/**
* Extend Memento object to be more command-line friendly without soiling core
*/
Memento.prototype.toString = function () {
  return JSON.stringify(this)
}

// Add Thumbnail Summarization attributes to Memento Class without soiling core
Memento.prototype.simhash = null
Memento.prototype.captureTimeDelta = -1
Memento.prototype.hammingDistance = -1
Memento.prototype.simhashIndicatorForHTTP302 = '00000000'

/**
* Fetch URI-M HTML contents and generate a Simhash
*/
Memento.prototype.setSimhash = function (callback) {
  // Retain the URI-R for reference in the promise (this context lost with async)
  var thaturi = this.uri
  var thatmemento = this
    var buffer2 = ''
    var memento = this // Potentially unused? The 'this' reference will be relative to the promise here
    var mOptions = url.parse(thaturi)
    ConsoleLogIfRequired('Starting a simhash: ' + mOptions.host + mOptions.path)
    var req = http.request({
      'host': mOptions.host,
      'path': mOptions.path,
      'port':80,
      'headers': {'User-Agent': 'TimeMap Summarization instance - Contact (@WebSciDL)Twitter, (@maheedhargunnam)Twitter'}
    }, function (res) {
      // var hd = new memwatch.HeapDiff()

      if (res.statusCode !== 200) { // setting the simhash to be '0000000' for all the mementos which has a status of non 200
        thatmemento.simhash = Memento.prototype.simhashIndicatorForHTTP302
      }

      var outputBuffer;
      // res.setEncoding('utf8')
      if( res.headers['content-encoding'] == 'gzip' ) {
         var gzip = zlib.createGunzip();
         res.pipe(gzip);
         outputBuffer = gzip;
       } else {
         outputBuffer = res;
       }

      outputBuffer.setEncoding('utf8')
      //res.setEncoding('utf8')


      outputBuffer.on('data', function (data) {
        buffer2 += data.toString()
      })


      outputBuffer.on('end', function (d) {

        /*** ByMahee -- commented the following block as the client and server doesn't have to be in publish and subscribe mode
        //var md5hash = md5(thatmemento.originalURI) // URI-R cannot be passed in the raw
        ConsoleLogIfRequired("-- By Mahee -- Inside On response end of http request of setSimhash")
        ConsoleLogIfRequired("ByMahe -- here is the buffer content of " +mOptions.host+mOptions.path+":")
        ConsoleLogIfRequired(buffer2)
        ConsoleLogIfRequired("========================================================")  */
        //ConsoleLogIfRequired("Buffer Length ("+mOptions.host + mOptions.path +"):-> "+ buffer2.length)
        if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 && thatmemento.simhash != '00000000') {

          var sh = simhash((buffer2).split('')).join('')
         ConsoleLogIfRequired("ByMahee -- computed simhash for "+mOptions.host+mOptions.path+" -> "+ sh)

          var retStr = getHexString(sh)

          if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302) {
            // Normalize so not undefined
            retStr = Memento.prototype.simhashIndicatorForHTTP302

            // Gateway timeout from the archives, remove from consideration
            // resolve('isA302DeleteMe')
            callback()
          }

          buffer2 = ''
          buffer2 = null

        //  ConsoleLogIfRequired("Hex Code for Simhash:"+retStr + ' & URI-R:' + mOptions.host + mOptions.path)

          thatmemento.simhash = retStr
          callback()
        //  resolve(retStr)
        } else {
          // We need to delete this memento, it's a duplicate and a "soft 302" from archive.org
          callback()
         //callback('isA302DeleteMe')
        }
      })

      outputBuffer.on('error', function (err) {
        ConsoleLogIfRequired('Error generating Simhash in Response')
      })
    })

    req.on('error', function (err) {
      ConsoleLogIfRequired('Error generating Simhash in Request')
      ConsoleLogIfRequired(err)
      callback()
    //  ConsoleLogIfRequired("-- By Mahee -- Inside On request error of http request of setSimhash")
    })

    req.end()
}

/**
* Given a URI, return a TimeMap from the Memento Aggregator
* TODO: God function that does WAY more than simply getting a timemap
* @param uri The URI-R in-question
*/
function getTimemapGodFunctionForAlSummarization (uri, response) {
  ConsoleLogIfRequired("--ByMahee -- Inside function : getTimemapGodFunctionForAlSummarization")
  ConsoleLogIfRequired("--ByMahee -- Applying AlSummarization on given URI-R = "+ uri)

  // TODO: remove TM host and path references, they reside in the TM obj
  /* ByMahee -- right now hitting only organization : web.archive.org , changing the following Host and Path to http://wayback.archive-it.org
*/

  // var timemapHost = 'web.archive.org'
  // var timemapPath = '/web/timemap/link/' + uri

  var timemapHost = 'wayback.archive-it.org'
  var timemapPath = '/'+collectionIdentifier+'/timemap/link/' + uri

  if(primeSrc == 2 ){
      timemapHost = 'web.archive.org'
      timemapPath = '/web/timemap/link/' + uri
  }else if(primeSrc == 3){ // must contain the Host and Path for Memento Aggregator
    ConsoleLogIfRequired("Haven't given the Memgators Host and Path yet")
    return
  }


  var options = {
    'host': timemapHost,
    'path': timemapPath,
    'port': 80,
    'method': 'GET'
  }

  ConsoleLogIfRequired('Path: ' + options.host + options.path)
  var buffer = '' // An out-of-scope string to save the Timemap string, TODO: better documentation
  var t
  var retStr = ''
  var metadata = ''
  ConsoleLogIfRequired('Starting many asynchronous operationsX...')
  async.series([
    // TODO: define how this is different from the getTimemap() parent function (i.e., some name clarification is needed)
    // TODO: abstract this method to its callback form. Currently, this is reaching and populating the timemap out of scope and can't be simply isolated (I tried)
    function fetchTimemap (callback) {
      var req = http.request(options, function (res) {
         ConsoleLogIfRequired("--ByMahee-- Inside the http request call back success, request is made on the following obect:")
        // ConsoleLogIfRequired(options);
        // ConsoleLogIfRequired("----------------");
        res.setEncoding('utf8')

        res.on('data', function (data) {
          buffer += data.toString()
        })

        res.on('end', function (d) {

        //  ConsoleLogIfRequired("Data Response from fetchTimeMap:" + buffer)

          if (buffer.length > 100) {  // Magic number = arbitrary, has be quantified for correctness
            //ConsoleLogIfRequired('Timemap acquired for ' + uri + ' from ' + timemapHost + timemapPath)
            // ConsoleLogIfRequired("-----------ByMahee--------")
            // ConsoleLogIfRequired(buffer)
            // ConsoleLogIfRequired("-----------ByMahee--------")

            t = new TimeMap(buffer)
            t.originalURI = uri // Need this for a filename for caching
            t.createMementos()
            ConsoleLogIfRequired("-- ByMahee -- Mementos are created by this point, following is the whole timeMap Object")
            ConsoleLogIfRequired(t);
            ConsoleLogIfRequired("---------------------------------------------------")

            if (t.mementos.length === 0) {
            ConsoleLogIfRequired('There were no mementos for ' + uri + ' :(')
              return
            }

            ConsoleLogIfRequired('Fetching HTML for ' + t.mementos.length + ' mementos.')

            callback('')
          }else{
            ConsoleLogIfRequired('The page you requested has not been archived in Archive-It.')
             process.exit(-1)
          }
        })
      })

      req.on('error', function (e) { // Houston...
        ConsoleLogIfRequired('problem with request: ' + e.message)
        ConsoleLogIfRequired(e)
        if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
          ConsoleLogIfRequired('Hmm, the connection timed out. Internet Archive might be down.')
        }
      })

      req.on('socket', function (socket) { // Slow connection is slow
        /*socket.setTimeout(3000)
        socket.on('timeout', function () {
          ConsoleLogIfRequired("The server took too long to respond and we're only getting older so we aborted.")
          req.abort()
        }) */
      })

      req.end()
    },


    //ByMahee -- commented out some of the methods called to build step by step
    /* **
    // TODO: remove this function from callback hell
    function (callback) {t.printMementoInformation(response, callback, false);}, // Return blank UI ASAP */

    // -- ByMahee -- Uncomment one by one for CLI_JSON
    function (callback) {t.calculateSimhashes(callback);},
    function (callback) {t.saveSimhashesToCache(callback);},

    function (callback) {
        if(isToComputeBoth){
          t.calculateHammingDistancesWithOnlineFiltering(callback);
        }
        else if (callback) {
          callback('')
        }
    },
    function (callback) {
        if(isToComputeBoth){
          t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);
        }
        else if (callback) {
          callback('')
        }
    },
    //function (callback) {t.writeJSONToCache(callback)},
    function (callback) {t.writeThumbSumJSONOPToCache(callback)},
    function (callback) {
        if(isToComputeBoth){
          t.createScreenshotsForMementos(callback);
        }
        else if (callback) {
          callback('')
        }
    }




    /*// function (callback) {calculateCaptureTimeDeltas(callback);},// CURRENTLY UNUSED, this can be combine with previous call to turn 2n-->1n
    // function (callback) {applyKMedoids(callback);}, // No functionality herein, no reason to call yet
    function (callback) {t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);}, */
    //function (callback) {t.writeJSONToCache(callback);},
  /*  function (callback) {t.printMementoInformation(response, callback);},
    function (callback) {t.createScreenshotsForMementos(callback)}
    */
  ],
  function (err, result) {
    if (err) {
      ConsoleLogIfRequired('ERROR!')
      ConsoleLogIfRequired(err)
    } else {
      ConsoleLogIfRequired('There were no errors executing the callback chain')
    }
  })


  // Fisher-Yates shuffle per http://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
  function getRandomSubsetOfMementosArray (arr,siz) {
    var shuffled = arr.slice(0)
    var i = arr.length
    var temp
    var index
    while (i--) {
      index = Math.floor((i + 1) * Math.random())
      temp = shuffled[index]
      shuffled[index] = shuffled[i]
      shuffled[i] = temp
    }

    return shuffled.slice(0, size)
  }

  function getTimeDiffBetweenTwoMementoURIs (newerMementoURI, olderMementoURI) {
    var newerDate = newerMementoURI.match(/[0-9]{14}/g)[0]  // Newer
    var olderDate = olderMementoURI.match(/[0-9]{14}/g)[0]  // Older

    if (newerDate && olderDate) {
      try {
        var diff = (parseInt(newerDate) - parseInt(olderDate))
        return diff
      }catch (e) {
        ConsoleLogIfRequired(e.message)
      }
    } else {
      throw new Exception('Both mementos in comparison do not have encoded datetimes in the URIs:\r\n\t' + newerMemento.uri + '\r\n\t' + olderMemento.uri)
    }
  }
} /* End God Function */

/*****************************************
   // SUPPLEMENTAL TIMEMAP FUNCTIONALITY
***************************************** */

/**
 * HTML to return back as user interface to client
 * @param callback The function to call once this function has completed executed, invoked by caller
 */
TimeMap.prototype.printMementoInformation = function (response, callback, dataReady) {
  ConsoleLogIfRequired('About to print memento information')
  var CRLF = '\r\n'
  var TAB = '\t'
  var stateInformationString = ''


  if (dataReady === false) { // Indicative of the data still loading. Yes, I know it's an abuse of CBs
    stateInformationString = 'Processing data. This could take a while.'
  }


  var cacheFilePathWithoutDotSlash = (new SimhashCacheFile(uriR,isDebugMode)).path.substr(2)

  var metadata = {
    'url': uriR,
    'simhashCacheURI': localAssetServer + cacheFilePathWithoutDotSlash
  }


  // Boo! Node doesn't support ES6 template strings. Have to build the old fashion way
  var respString =
`<!DOCTYPE html>
<html>
<head>
<base href="${localAssetServer}" />
<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
<script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
<script src="//code.jquery.com/ui/1.10.4/jquery-ui.min.js"></script>
<script src="md5.min.js"></script>
<!--<script src="gridder/js/jquery.gridder.min.js"></script>-->
<script src="_js/moment-with-langs.min.js"></script>
<link rel="stylesheet" type="text/css" href="_css/coverflow.css" />
<link rel="stylesheet" type="text/css" href="_css/alSummarization.css" />
<link rel="stylesheet" type="text/css" href="_css/reflection.css" />
<link rel="stylesheet" type="text/css" href="vis/vis.min.css" />
<link rel="stylesheet" type="text/css" href="_css/flip.css" />
<script src="_js/coverflow.min.js"></script>
<script src="vis/vis.min.js"></script>"
<script src="support/faye/faye-browser-min.js"></script>
<script>
//echo the ports and other endpoint facets for use in util.js
var thumbnailServicePort = ${thumbnailServicePort}
var thumbnailServer = '${thumbnailServer}'
var localAssetServerPort = '${localAssetServerPort}'
var localAssetServer = '${localAssetServer}'
var returnedJSON = ${JSON.stringify(this.mementos)}
var metadata = ${JSON.stringify(metadata)}
var client = new Faye.Client('${notificationServer}')
var strategy
$(document).ready(function () {
  strategy = $($('body')[0]).data('strategy')
  setStrategyAndAccessInUI()
  client.subscribe('/${md5(uriR)}', function (message) {
   $('#dataState').html(message.uriM)
   if (strategy == 'alSummarization' && message.uriM === 'done') {
       conditionallyLoadInterface()
   } else if (message.uriM === 'done') {
       displayVisualization()
       $('#dataState').html('')
   }
  })
})
</script>
<script src="${localAssetServer}util.js"></script>
</head>
<body data-access="${response.thumbnails.access}" data-strategy="${response.thumbnails.strategy}">
<h1 class="interface">${uriR}</h1>
<section id="subnav">
<form method="get" action="/">
 <span><label for="strategy">Strategy:</label><select id="form_strategy" name="strategy"><option value="alSummarization">AlSummarization</option><option value="random">Random</option><option value="interval">Interval</option><option value="temporalInterval">Temporal Interval</option></select></span>
 <input type="hidden" name="URI-R" id="form_urir" value="${decodeURIComponent(uriR)}" />
 <input type="button" value="Go" onclick="buildQuerystringAndGo()"  />
</form>
<p id="dataState">${stateInformationString}</p>
</body>
</html>`
  response.write(respString)
  response.end()

  if (callback) {
    callback('')
  }
}

TimeMap.prototype.calculateSimhashes = function (callback) {
  //ConsoleLogIfRequired("--- By Mahee - For my understanding")
  //ConsoleLogIfRequired("Inside CalculateSimhashes")
  var theTimeMap = this
  var arrayOfSetSimhashFunctions = []
  var bar = new ProgressBar('  Simhashing [:bar] :percent :etas', {
    'complete': '=',
    'incomplete': ' ',
    'width': 20,
    'total': this.mementos.length
  })

// -- ByMahee -- Ignoring for CLI_JSON
//  var client = new faye.Client(notificationServer)
//  ConsoleLogIfRequired("--- By Mahee for understanding -- ")
//  ConsoleLogIfRequired(client)
/* commented the below line purposefully to check whether memento fetching isn't working beacuse there are many request made parallely at a time. */
//  for (var m = 0; m < this.mementos.length; m++) {
// //  for (var m = 0; m < 5; m++) {
//     arrayOfSetSimhashFunctions.push(this.mementos[m].setSimhash())
//     bar.tick(1)
//   }

  // the way to get a damper, just 10 requests at a time.
  async.eachLimit(this.mementos,10, function(curMemento, callback){
    curMemento.setSimhash(callback)
  //  ConsoleLogIfRequired(curMemento)
  }, function(err) {
    //  ConsoleLogIfRequired("length of arrayOfSetSimhashFunctions: -> " + arrayOfSetSimhashFunctions.length);
      if(err){
        ConsoleLogIfRequired("Inside async Each Limit")
        ConsoleLogIfRequired(err)
        return
      }

    //  ConsoleLogIfRequired("After all the resquests are resolved, theTimemap -> "+  theTimeMap)

      ConsoleLogIfRequired('Checking if there are mementos to remove')
      var mementosRemoved = 0
      ConsoleLogIfRequired('About to go into loop of ## mementos: ' + (theTimeMap.mementos.length - 1))

      // Remove all mementos whose payload body was a Wayback soft 302
      for (var i = theTimeMap.mementos.length - 1; i >= 0; i--) {

        /* if (theTimemap.mementos[i].simhash === 'isA302DeleteMe') { //this was the original conetent of the code,
         * according to my understanding 'theTimemap.mementos[i].simhash' has to be checked with 'Memento.prototype.simhashIndicatorForHTTP302',
         * doing the same: just changed the above condition as to follow
        */

        if(theTimeMap.mementos[i].simhash === Memento.prototype.simhashIndicatorForHTTP302){
          theTimeMap.mementos.splice(i, 1)
          mementosRemoved++
        }
      }
      // console.timeEnd('simhashing')
      ConsoleLogIfRequired(mementosRemoved + ' mementos removed due to Wayback "soft 3xxs"')
      if (callback) {
        callback('')
      }
  })
}

TimeMap.prototype.saveSimhashesToCache = function (callback,format) {
  // TODO: remove dependency on global timemap t

  var strToWrite = ''
  for (var m = 0; m < this.mementos.length; m++) {
    if (this.mementos[m].simhash != Memento.prototype.simhashIndicatorForHTTP302) {
      strToWrite += this.mementos[m].simhash + ' ' + this.mementos[m].uri + ' ' + this.mementos[m].datetime + '\r\n'
    }
  }

  ConsoleLogIfRequired('Done getting simhashes from array')
  ConsoleLogIfRequired('-- ByMahee -- In function SaveSimhashesToCache -- Simhash for URI and DateTime is as follows:')
  ConsoleLogIfRequired(strToWrite)
  ConsoleLogIfRequired("-------------------------------------------------------------------------")

  var cacheFile = new SimhashCacheFile(this.originalURI,isDebugMode)
  cacheFile.replaceContentWith(strToWrite)


  if (callback) {
      callback('')
  }
}

TimeMap.prototype.writeJSONToCache = function (callback) {
  var cacheFile = new SimhashCacheFile(this.originalURI,isDebugMode)
  cacheFile.writeFileContentsAsJSON(JSON.stringify(this.mementos))
  console.log(JSON.stringify(this.mementos));
  if (callback) {
    callback('')
  }
}


/**
* Converts the JsonOutput from the current formate to the format required for timemap plugin
* and saves in a json file
*/
TimeMap.prototype.writeThumbSumJSONOPToCache = function (callback) {

  var month_names_short= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var mementoJObjArrForTimeline=[];
  var mementoJObjArrFor_Grid_Slider =[];
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  this.mementos.forEach(function (memento,m) {

    var uri = memento.uri
    // need to have the following line, id_ isnot needed for screen shot
    uri = uri.replace("id_/http:","/http:");

     var mementoJObj_ForTimeline ={}
     var mementoJObj_ForGrid_Slider={}
     var dt =  new Date(memento["datetime"].split(",")[1])
     var date = dt.getDate()
     var month = dt.getMonth() + 1
     if(date <10){
       date = "0"+date
     }

     if(month < 10){
       month = "0"+month
     }

    var eventDisplayDate = dt.getUTCFullYear()+"-"+ month+"-"+date+", "+ memento["datetime"].split(" ")[4]
    mementoJObj_ForTimeline["timestamp"] = Number(dt)/1000
    if(memento.screenshotURI == null || memento.screenshotURI==''){
      mementoJObj_ForTimeline["event_series"] = "Non-Thumbnail Mementos"
      mementoJObj_ForTimeline["event_html"] = "<img src='http://www.cs.odu.edu/~mgunnam/TimeMapSummarization/photos/notcaptured.png' width='300px' />"
    }else{
      var filename = 'timemapSum_' + uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      mementoJObj_ForTimeline["event_series"] = "Thumbnails"
      mementoJObj_ForTimeline["event_html"] = "<img src='http://www.cs.odu.edu/~mgunnam/TimeMapSummarization/photos/"+memento.screenshotURI +"' width='300px' />"
    }

    mementoJObj_ForTimeline["event_date"] =  month_names_short[ parseInt(month)]+". "+date +", "+ dt.getUTCFullYear()
    mementoJObj_ForTimeline["event_display_date"] = eventDisplayDate
    mementoJObj_ForTimeline["event_description"] = ""
    mementoJObj_ForTimeline["event_link"] = uri
    mementoJObjArrForTimeline.push(mementoJObj_ForTimeline)
  })

  var cacheFile = new SimhashCacheFile(this.originalURI,isDebugMode)
  cacheFile.writeThumbSumJSONOPContentToFile(JSON.stringify(mementoJObjArrForTimeline))
  ConsoleLogIfRequired("--------------------- Json Array for TimeLine from  writeThumbSumJSONOPToCache------------------------------")
  ConsoleLogIfRequired(JSON.stringify(mementoJObjArrForTimeline))
  ConsoleLogIfRequired("------------------------------------------------------------------------------------------------------------")
  if (callback) {
    callback('')
  }
}




/**
* Converts the target URI to a safe semantic filename and attaches to relevant memento.
* Selection based on passing a hamming distance threshold
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI = function (callback) {
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  this.mementos.forEach(function (memento,m) {
    var uri = memento.uri
      uri = uri.replace("id_/http:","/http:");
    // ConsoleLogIfRequired("Hamming distance = "+memento.hammingDistance)
    if (memento.hammingDistance < HAMMING_DISTANCE_THRESHOLD  && memento.hammingDistance >= 0) {
      // ConsoleLogIfRequired(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
      memento.screenshotURI = null
    } else {
      var filename = 'timemapSum_' + uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      memento.screenshotURI = filename
    }
  })

  ConsoleLogIfRequired('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back')
  if (callback) {
    callback('')
  }
}



/**
* Converts the filename of each previously selected memento a a valid image filename and associate
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplySelectedMementosAScreenshotURI = function (strategy,callback) {
  var ii = 0
  for (var m in this.mementos) {
    if (this.mementos[m].selected) {
      var filename = strategy + '_' + this.mementos[m].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'
      this.mementos[m].screenshotURI = filename
      ii++
    }
  }

  ConsoleLogIfRequired('Done creating filenames for ' + ii + ' mementos')

  if (callback) {
    callback('')
  }
}

/**
* Select random mementos from the TimeMap up to a specified quantity
* @param callback The next procedure to execution when this process concludes
* @param numberOfMementosToChoose The count threshold before the selection strategy has been satisfied
*/
TimeMap.prototype.supplyChosenMementosBasedOnUniformRandomness = function (callback, numberOfMementosToChoose) {
  var _this = this
  if (numberOfMementosToChoose > this.mementos.length) {
    ConsoleLogIfRequired('Number to choose is greater than number existing.')
    return
  }

  var numberOfMementosLeftToChoose = numberOfMementosToChoose
  while (numberOfMementosLeftToChoose > 0) {
    var randomI = Math.floor(Math.random() * this.mementos.length)
    if (!this.mementos[randomI].selected) {
      this.mementos[randomI].selected = true
      numberOfMementosLeftToChoose--
    } // Duplicately selected would take an else, so it's unnecessary

  }

  setTimeout(function () {
    var client = new faye.Client(notificationServer)
    client.publish('/' + md5(_this.originalURI), {
      'uriM': 'done'
    })
  }, 2000)

  callback()
}

/**
* TODO: document
* @param callback The next procedure to execution when this process concludes
* @param numberOfMementosToChoose The count threshold before the selection strategy has been satisfied
*/
TimeMap.prototype.supplyChosenMementosBasedOnTemporalInterval = function (callback, numberOfMementosToChoose) {
  var _this = this
  ConsoleLogIfRequired('OriginalURI is ' + _this.originalURI)
  if (numberOfMementosToChoose > this.mementos.length) {
    ConsoleLogIfRequired('Number to choose is greater than number existing.')
    return
  }

  var lastMonthRecorded = -1

  var selectedIndexes = [] // Maintaining memento indexes to prune
  for (var i = 0; i < this.mementos.length; i++) {
    var datetimeAsDate = new Date(this.mementos[i].datetime)
    var thisYYYYMM = datetimeAsDate.getFullYear() + '' + datetimeAsDate.getMonth()

    if (thisYYYYMM !== lastMonthRecorded) {
      this.mementos[i].selected = true
      lastMonthRecorded = thisYYYYMM
      ConsoleLogIfRequired(this.mementos[i].datetime + ' accepted')
      selectedIndexes.push(i)
    } else {
      ConsoleLogIfRequired(this.mementos[i].datetime + ' rejected (same month as previous selected)')
    }
  }

  var beforeOK = this.mementos.filter(function (el) {
    return el.selected !== null
  })

  ConsoleLogIfRequired('We are going to choose ' + numberOfMementosToChoose + ' --- ' + selectedIndexes)
  // Prune based on numberOfMementosToChoose
  while (selectedIndexes.length > numberOfMementosToChoose) {
    var mementoIToRemove = Math.floor(Math.random() * selectedIndexes.length)
    ConsoleLogIfRequired(selectedIndexes.length + ' is too many mementos, removing index ' + mementoIToRemove)
    ConsoleLogIfRequired(this.mementos[mementoIToRemove].datetime + ' was ' + this.mementos[mementoIToRemove].selected)
    delete this.mementos[selectedIndexes[mementoIToRemove]].selected
    ConsoleLogIfRequired('Now it is ' + this.mementos[mementoIToRemove].selected)
    selectedIndexes.splice(mementoIToRemove, 1)
  }

  var monthlyOK = this.mementos.filter(function (el) {
    return el.selected
  })

  ConsoleLogIfRequired(beforeOK.length + ' --> ' + monthlyOK.length + ' passed the monthly test')

  setTimeout(function () {
    var client = new faye.Client(notificationServer)
    client.publish('/' + md5(_this.originalURI), {
      'uriM': 'done'
    })
  }, 2000)

  callback()
}

/**
* // Select mementos based on interval
* @param callback The next procedure to execution when this process concludes
* @param skipFactor Number of Mementos to skip, n=1 ==> 1,3,5,7
* @param initialIndex The basis for the count. 0 if not supplied
* @param numberOfMementosToChoose Artificial restriction on the count
*/
TimeMap.prototype.supplyChosenMementosBasedOnInterval = function (callback, skipFactor, initialIndex, numberOfMementosToChoose) {
  var _this = this
  if (numberOfMementosToChoose > this.mementos.length) {
    ConsoleLogIfRequired('Number to choose is greater than number existing.')
    return
  }

  var numberOfMementosLeftToChoose = numberOfMementosToChoose

  // TODO: add further checks for parameter integrity (e.g. in case strings are passed)
  if (!initialIndex) {
    initialIndex = 0
  }

  if (skipFactor < 0) {
    skipFactor = 0
  }

  for (var i = initialIndex; i < this.mementos.length; i = i + skipFactor + 1) {
    this.mementos[i].selected = true
  }

  setTimeout(function () {
    var client = new faye.Client(notificationServer)
    client.publish('/' + md5(_this.originalURI), {
      'uriM': 'done'
    })
  }, 2000)

  callback('')
}


/**
* Generate a screenshot with all mementos that pass the passed-in criteria test
* @param callback The next procedure to execution when this process concludes
* @param withCriteria Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementos = function (callback, withCriteria) {
  ConsoleLogIfRequired('Creating screenshots...')

  function hasScreenshot (e) {
    return e.screenshotURI !== null
  }

  var self = this

  var criteria = hasScreenshot
  if (withCriteria) {
    criteria = withCriteria
  }

  async.eachLimit(
    shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
    10,
    self.createScreenshotForMemento,            // Create a screenshot
    function doneCreatingScreenshots (err) {      // When finished, check for errors
      if (err) {
        ConsoleLogIfRequired('Error creating screenshot')
        ConsoleLogIfRequired(err)
      }

      callback('')
    }
  )
}

TimeMap.prototype.createScreenshotForMemento = function (memento, callback) {
  var uri = memento.uri
  uri = uri.replace("id_/http:","/http:");
  var filename = memento.screenshotURI

  try {
    fs.openSync(
      path.join(__dirname + '/screenshots/' + memento.screenshotURI),
      'r', function (e, r) {
        ConsoleLogIfRequired(e)
        ConsoleLogIfRequired(r)
      })

    ConsoleLogIfRequired(memento.screenshotURI + ' already exists...continuing')
    callback()
    return
  }catch (e) {
    ConsoleLogIfRequired((new Date()).getTime() + ' ' + memento.screenshotURI + ' does not exist...generating')
  }

  var options = {
    'phantomConfig': {
      'ignore-ssl-errors': true,
      'local-to-remote-url-access': true // ,
      // 'default-white-background': true,
    },
    // Remove the Wayback UI
    'onLoadFinished': function () {
      document.getElementById('wm-ipp').style.display = 'none'
    }

  }

  ConsoleLogIfRequired('About to start screenshot generation process for ' + uri)
  webshot(uri, 'screenshots/' + filename, options, function (err) {
    if (err) {
      ConsoleLogIfRequired('Error creating a screenshot for ' + uri)
      ConsoleLogIfRequired(err)
      callback('Screenshot failed!')
    } else {
      fs.chmodSync('./screenshots/' + filename, '755')
      im.convert(['./screenshots/' + filename, '-thumbnail', '200',
            './screenshots/' + (filename.replace('.png', '_200.png'))],
        function (err, stdout) {
          if (err) {
            ConsoleLogIfRequired('We could not downscale ./screenshots/' + filename + ' :(')
          }

          ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout)
        })

      ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
      callback()
    }
  })

}

TimeMap.prototype.calculateHammingDistancesWithOnlineFiltering = function (callback) {
  console.time('Hamming And Filtering, a synchronous operation')

  var lastSignificantMementoIndexBasedOnHamming = 0
  var copyOfMementos = [this.mementos[0]]

  //ConsoleLogIfRequired('Calculate hamming distance of ' + this.mementos.length + ' mementos')
  for (var m = 0; m < this.mementos.length; m++) {
    // ConsoleLogIfRequired("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
    // ConsoleLogIfRequired("...with SimHash: "+this.mementos[m].simhash)
    if (m > 0) {
      if ((this.mementos[m].simhash.match(/0/g) || []).length === 32) {
        ConsoleLogIfRequired('0s, returning')
        continue
      }
      // ConsoleLogIfRequired("Calculating hamming distance")
      this.mementos[m].hammingDistance = getHamming(this.mementos[m].simhash, this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash)
      // ConsoleLogIfRequired("Getting hamming basis")
      this.mementos[m].hammingBasis = this.mementos[lastSignificantMementoIndexBasedOnHamming].datetime

      // ConsoleLogIfRequired('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
      //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
      //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

      if (this.mementos[m].hammingDistance >= HAMMING_DISTANCE_THRESHOLD) { // Filter the mementos if hamming distance is too small
        lastSignificantMementoIndexBasedOnHamming = m

         copyOfMementos.push(this.mementos[m]) // Only push mementos that pass threshold requirements
      }

      // ConsoleLogIfRequired(t.mementos[m].uri+" hammed!")
    } else if (m === 0) {
      ConsoleLogIfRequired('m==0, continuing')
    }
  }

  //ConsoleLogIfRequired((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
  copyOfMementos = null


  ConsoleLogIfRequired("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------")
  ConsoleLogIfRequired(JSON.stringify(this.mementos))
  //ConsoleLogIfRequired(this.mementos)
  ConsoleLogIfRequired("----------------------------------------------------------------------------------------------------------------------------------------------")


  if (callback) { callback('') }
}

/**
* Goes to URI-T(?), grabs contents, parses, and associates mementos
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.setupWithURIR = function (response, uriR, callback) {

  /* ByMahee -- right now hitting only organization : web.archive.org , changing the following Host and Path to http://wayback.archive-it.org. One of the following 2 statement sets to be used */


  var timemapHost = 'wayback.archive-it.org'
  var timemapPath = '/'+collectionIdentifier+'/timemap/link/' + uriR

  if(primeSrc == 2 ){
      timemapHost = 'web.archive.org'
      timemapPath = '/web/timemap/link/' + uriR
  }else if(primeSrc == 3){ // must contain the Host and Path for Memento Aggregator
    ConsoleLogIfRequired("Haven't given the Memgators Host and Path yet")
    return
  }
  // var timemapHost = 'web.archive.org'
  // var timemapPath = '/web/timemap/link/' + uriR

  var options = {
    'host': timemapHost,
    'path': timemapPath,
    'port': 80,
    'method': 'GET'
  }

  var buffer = ''
  var retStr = ''
  ConsoleLogIfRequired('Starting many asynchronous operations...')
  ConsoleLogIfRequired('Timemap output here')
  var tmInstance = this

  var req = http.request(options, function (res) {
    res.setEncoding('utf8')

    res.on('data', function (data) {
      buffer += data.toString()
    })

    res.on('end', function () {
      if (buffer.length > 100) {
        ConsoleLogIfRequired('X Timemap acquired for ' + uriR + ' from ' + timemapHost + timemapPath)
        tmInstance.str = buffer
        tmInstance.originalURI = uriR // Need this for a filename for caching
        tmInstance.createMementos()

        if (tmInstance.mementos.length === 0) {
          response.write('There were no mementos for ' + uriR)
          response.end()
          return
        }

        callback()
      }
    })
  })

  req.on('error', function (e) { // Houston...
    ConsoleLogIfRequired('problem with request: ' + e.message)
    ConsoleLogIfRequired(e)
    if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
      response.write('Hmm, the connection timed out. Internet Archive might be down.')
      response.end()
    }

  })

  req.end()
}


/**********************************
        RELEVANT yet ABSTRACTED generic functions
   ********************************* */

function getHamming (str1, str2) {
  if (str1.length !== str2.length) {
    ConsoleLogIfRequired('Oh noes! Hamming went awry! The lengths are not equal!')
    ConsoleLogIfRequired(str1 + ' ' + str2 + ' ' + str1.length + ' ' + str2.length)

    // ^Throw "Unequal lengths when both strings must be equal to calculate hamming distance."

    // Resilience instead of crashing
    ConsoleLogIfRequired('Unequal lengths when both strings must be equal to calculate hamming distance.')
    return 0
  } else if (str1 === str2) {
    return 0
  }

  var d = 0
  for (var ii = 0; ii < str1.length; ii++) {
    if (str1[ii] !== str2[ii]) { d++ }
  }

  return d
}

// Fischer-Yates shuffle so we don't fetch the memento in-order but preserve
// them as objects and associated attributes
function shuffleArray (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

/* *********************************
        UTILITY FUNCTIONS
   *********************************
TODO: break these out into a separate file
*/

// Graceful exit
process.on('SIGINT', function () {
  ConsoleLogIfRequired('\nGracefully shutting down from SIGINT (Ctrl-C)')
  process.exit()
})

// Useful Functions
function checkBin (n) {
//  return /^[01]{1, 64}$/.test(n)
// ByMahee -- the above statement is being changed to the following as we are checking 4 bits at a time
 //ConsoleLogIfRequired("Inside Check Binary")
 return /^[01]{1,4}$/.test(n)
}

function checkDec (n) {
  return /^[0-9]{1, 64}$/.test(n)
}

function checkHex (n) {
  return /^[0-9A-Fa-f]{1,64}$/.test(n)
}

function pad (s, z) {
  s = '' + s
  return s.length < z ? pad('0' + s, z):s
}

function unpad (s) {
  s = '' + s
  return s.replace(/^0+/, '')
}

// Decimal operations
function Dec2Bin (n) {
  if (!checkDec(n) || n < 0) {
    return 0
  }

  return n.toString(2)
}

function Dec2Hex (n) {
  if (!checkDec(n) || n < 0) {
    return 0
  }

  return n.toString(16)
}

// Binary Operations
function Bin2Dec (n) {
  if (!checkBin(n)) {
    return 0
  }

  return parseInt(n, 2).toString(10)
}

function Bin2Hex (n) {
  if (!checkBin(n)) {
    return 0
  }

  return parseInt(n, 2).toString(16)
}

// Hexadecimal Operations
function Hex2Bin (n) {
  if (!checkHex(n)) {
    return 0
  }

  return parseInt(n, 16).toString(2)
}

function Hex2Dec (n) {
  if (!checkHex(n)) {
    return 0
  }

  return parseInt(n, 16).toString(10)
}

function getHexString (onesAndZeros) {
  var str = ''
  for (var i = 0; i < onesAndZeros.length; i = i + 4) {
    str += Bin2Hex(onesAndZeros.substr(i, 4))
  }

  return str
}


function ConsoleLogIfRequired(msg){
  if(isDebugMode){
    console.log(msg);
  }
}

/* *********************************
    end UTILITY FUNCTIONS
********************************* */

exports.main = main
main()
// test commit into Branch CLI_JSON
