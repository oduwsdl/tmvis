'use strict'
/* ********************************
*  AlSummarization
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

/**************************************
* AlSummarization_JSON
* using the existing code and tweeking it to the code that returns the JSON Alone

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

//var app = express()

var host = 'http://localhost' // Format: scheme://hostname

/* Custom ports if specified on command-line */
var thumbnailServicePort = argv.p ? argv.p : 15421
var localAssetServerPort = argv.ap ? argv.a : 1338
var notificationServerPort = argv.ap ? argv.n : 15422

/* Derived host access points */
var localAssetServer = host + ':' + localAssetServerPort + '/'
var thumbnailServer = host + ':' + thumbnailServicePort + '/'
var notificationServer = host + ':' + notificationServerPort + '/'

// Fresh system for testing (NOT IMPLEMENTED)
var nukeSystemData = argv.clean ? argv.clean : false
var uriR = ''

var HAMMING_DISTANCE_THRESHOLD = 4





/* *******************************
   TODO: reorder functions (main first) to be more maintainable 20141205
****************************** */

/**
* Start the application by initializing server instances
*/
function main () {
  console.log(('*******************************\r\n' +
               'THUMBNAIL SUMMARIZATION SERVICE\r\n' +
               '*******************************').blue)

  console.log("--By Mahee - for understanding")
  if (nukeSystemData) {
    var resp = prompt('Delete all derived data (y/N)? ')
    if (resp === 'y') {
      console.log('Deleting all dervived data.')
      nukeSystemData = false
      // TODO: figure out why the flow does not continue after the
      //       nukeSystemData conditional
      cleanSystemData(main)
      console.log('Derived data deleted.')
    } else {
      console.log('No derived data modified.')
    }
  }

  var endpoint = new CLIEndpoint()
  endpoint.headStart()

/** -- ByMahee -- the following code lines are commented to disable the client-server version and to rather have a CLI
// startLocalAssetServer()

//to-do : the place where the client server communication is getting set, got to change it to command promt one
  var endpoint = new PublicEndpoint()

  // Initialize the server based and perform the "respond" call back when a client attempts to interact with the script
  // http.createServer(respond).listen(thumbnailServicePort)
  app.get('/*', endpoint.respondToClient)
  app.listen(thumbnailServicePort)

  //Notification server for status updates of long-running processes
  var notificationServerInstance = http.createServer()

  var bayeux = new faye.NodeAdapter({'mount': '/', 'timeout': 45})

  // TODO: send an initial notification by the server to faye to state that
  //       processing has not started

  bayeux.on('handshake', function (clientId) {
    console.log('FAYE - handshake initiated ' + clientId)
  })

  bayeux.on('subscribe', function (clientId, channelId) {
    console.log('FAYE - client subscribed - ' + clientId + ' ' + channelId)
  })

  bayeux.on('publish', function (clientId, channelId, data) {
    console.log('FAYE - client published - ' + clientId + ' ' + channelId + ' ' + data)
  })

  bayeux.attach(notificationServerInstance)
  notificationServerInstance.listen(notificationServerPort)

  // console.log("FAYE - server started")

  // TODO: react accordingly if port listening failed, don't simply assume the service was started.
  console.log('* ' + ('Thumbnails service started on Port ' + thumbnailServicePort).red)
  console.log('* ' + ('Notification service started on Port ' + notificationServerPort).red)
  console.log('> Try ' + thumbnailServer + '?URI-R=http://matkelly.com in your web browser for sample execution.') */
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
    //     console.log("No Arguments given");
    //     process.exit(-1);
    // }else{
    //   var param = process.argv[2];
    //   console.log('Param: ' + param);
    //   process.exit(-1);
    // }

    if (process.argv.length <= 2) {
        console.log('No Argument was passed.. Trying with URI-R = http://www.cs.odu.edu/~mweigle/Research/')
        URIRFromCLI = '/?URI-R=http://www.cs.odu.edu/~mweigle/Research/'
    }else{
        URIRFromCLI = '/?URI-R='+process.argv[2]
    }

    console.log('URI-R From CLI: ' + URIRFromCLI)

    var query = url.parse(URIRFromCLI, true).query
    console.log("--- ByMahee: Query URL from client = "+ JSON.stringify(query))
    /******************************
       IMAGE PARAMETER - allows binary image data to be returned from service
    **************************** */
    if (query.img) {
      // Return image data here
      var fileExtension = query.img.substr('-3') // Is this correct to use a string and not an int!?
      console.log('fetching ' + query.img + ' content')
      var img = fs.readFileSync(__dirname + '/' + query.img)
      console.log("200, {'Content-Type': 'image/'" + fileExtension +'}')
      return
    }

    /******************************
       URI-R PARAMETER - required if not img, supplies basis for archive query
    **************************** */

    function isARESTStyleURI (uri) {
      return (uri.substr(0, 5) === '/http')
    }

    if (query['URI-R']) { // URI-R is specied as a query parameter
      console.log('URI-R valid, using query parameter.')
    }

    // ByMahee --- Actually URI is being set here
    uriR = query['URI-R']
    console.log("--ByMahee: uriR = "+uriR)

    var access = theEndPoint.validAccessParameters[0] // Not specified? access=interface
    // Override the default access parameter if the user has supplied a value
    //  via query parameters
    if (query.access) {
      access = query.access
    }

    if (!theEndPoint.isAValidAccessParameter(access)) { // A bad access parameter was passed in
      console.log('Bad access query parameter: ' + access)
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
      console.log('Bad strategy query parameter: ' + strategy)
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

    console.log('New client request URI-R: ' + query['URI-R'] + '\r\n> Access: ' + access + '\r\n> Strategy: ' + strategy)

    if (!validator.isURL(uriR)) { // Return "invalid URL"
      consoleLogJSONError('Invalid URI')
      return
    }

    function consoleLogJSONError (str) {
      console.log('{"Error": "' + str + '"}')
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
      var cacheFile = new SimhashCacheFile(uriR)
      cacheFile.path += '.json'
      console.log('Checking if a cache file exists for ' + query['URI-R'] + '...')
      cacheFile.readFileContents(
        function success (data) {
          // A cache file has been previously generated using the alSummarization strategy
          processWithFileContents(data, response)
        },
        function failed () {
          //ByMahee -- calling the core function responsible for AlSummarization, if the cached file doesn't exist
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
              console.log('Done creating screenshots')
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
      console.log('Deleted contents of ./' + e + '/')
    })

    console.log(e)
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
  t.printMementoInformation(response, null, false)
  console.log('There were ' + t.mementos.length + ' mementos')
  t.calculateHammingDistancesWithOnlineFiltering()
  t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI()
  t.createScreenshotsForMementos(function () {
    console.log('Done creating screenshots')
  })

  // Currently a race condition in that the below code will publish before the
  //  client side code in the above t.printMementoInformation subscribes.
  //  Fake latency fixes this but is suboptimal
  setTimeout(function () {
    var client = new faye.Client(notificationServer)
    client.publish('/' + md5(t.mementos[0].originalURI), {
      'uriM': 'done'
    })
  }, 2000)
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
Memento.prototype.setSimhash = function () {
  // Retain the URI-R for reference in the promise (this context lost with async)
  var thaturi = this.uri
  var thatmemento = this
  return (new Promise(function (resolve, reject) {
    var buffer2 = ''
    var memento = this // Potentially unused? The 'this' reference will be relative to the promise here
    var mOptions = url.parse(thaturi)
    console.log('Starting a simhash: ' + mOptions.host + mOptions.path)
    var req = http.request({
      'host': mOptions.host,
      'path': mOptions.path,
      'port':80,
      'headers': {'User-Agent': 'ArchiveThumbnails instance - Contact @machawk1'}
    }, function (res) {
      // var hd = new memwatch.HeapDiff()

      res.setEncoding('utf8')
      res.on('data', function (data) {
        buffer2 += data.toString()
      })

      if (res.statusCode !== 200) {
        thatmemento.simhash = Memento.prototype.simhashIndicatorForHTTP302
      }

      res.on('end', function (d) {

        /*** ByMahee -- commented the following block as the client and server doesn't have to be in publish and subscribe mode
        //var md5hash = md5(thatmemento.originalURI) // URI-R cannot be passed in the raw
        // console.log("-- By Mahee -- Inside On response end of http request of setSimhash")
        console.log(thatmemento)
        console.log(thatmemento.fayeClient)
        thatmemento.fayeClient.publish('/' + md5hash, {
          'uriM': thatmemento.uri
        })

        console.log("ByMahe -- here is the buffer content of " +mOptions.host+mOptions.path+":")
        console.log(buffer2)
        console.log("========================================================")
          */

        if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 && thatmemento.simhash != '00000000') {

          var sh = simhash((buffer2).split('')).join('')
        //  console.log("ByMahee -- computed simhash for "+mOptions.host+mOptions.path+" -> "+ sh)

          var retStr = getHexString(sh)

          if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302) {
            // Normalize so not undefined
            retStr = Memento.prototype.simhashIndicatorForHTTP302

            // Gateway timeout from the archives, remove from consideration
            resolve('isA302DeleteMe')
          }

          buffer2 = ''
          buffer2 = null

        //  console.log("Hex Code for Simhash:"+retStr + ' & URI-R:' + mOptions.host + mOptions.path)

          thatmemento.simhash = retStr

          resolve(retStr)
        } else {
          // We need to delete this memento, it's a duplicate and a "soft 302" from archive.org
          resolve('isA302DeleteMe')
        }
      })

      res.on('error', function (err) {
        console.log('Error generating Simhash in Response')
        reject(Error('Network Error'))
      })
    })

    req.on('error', function (err) {
      console.log('Error generating Simhash in Request')
      console.log(err)
    //  console.log("-- By Mahee -- Inside On request error of http request of setSimhash")
      reject(Error('Network Error'))
    })

    req.end()
  }))
}

/**
* Given a URI, return a TimeMap from the Memento Aggregator
* TODO: God function that does WAY more than simply getting a timemap
* @param uri The URI-R in-question
*/
function getTimemapGodFunctionForAlSummarization (uri, response) {
  console.log("--ByMahee -- Inside function : getTimemapGodFunctionForAlSummarization")
  console.log("--ByMahee -- Applying AlSummarization on given URI-R = "+ uri)

  // TODO: remove TM host and path references, they reside in the TM obj
  /* ByMahee -- right now hitting only organization : web.archive.org , changing the following Host and Path to http://wayback.archive-it.org
  var timemapHost = 'web.archive.org'
  var timemapPath = '/web/timemap/link/' + uri */
  var timemapHost = 'wayback.archive-it.org'
  var timemapPath = '/1068/timemap/link/' + uri


  var options = {
    'host': timemapHost,
    'path': timemapPath,
    'port': 80,
    'method': 'GET'
  }

  console.log('Path: ' + options.host + '/' + options.path)
  var buffer = '' // An out-of-scope string to save the Timemap string, TODO: better documentation
  var t
  var retStr = ''
  var metadata = ''
  console.log('Starting many asynchronous operationsX...')
  async.series([
    // TODO: define how this is different from the getTimemap() parent function (i.e., some name clarification is needed)
    // TODO: abstract this method to its callback form. Currently, this is reaching and populating the timemap out of scope and can't be simply isolated (I tried)
    function fetchTimemap (callback) {

      var req = http.request(options, function (res) {
         console.log("--ByMahee-- Inside the http request call back success, request is made on the following obect:")
        // console.log(options);
        // console.log("----------------");
        res.setEncoding('utf8')

        res.on('data', function (data) {
          buffer += data.toString()
        })

        res.on('end', function (d) {

          //console.log("Data Response from fetchTimeMap:" + buffer)

          if (buffer.length > 100) {  // Magic number = arbitrary, has be quantified for correctness
            //console.log('Timemap acquired for ' + uri + ' from ' + timemapHost + timemapPath)
            // console.log("-----------ByMahee--------")
            // console.log(buffer)
            // console.log("-----------ByMahee--------")

            t = new TimeMap(buffer)
            t.originalURI = uri // Need this for a filename for caching
            t.createMementos()
            console.log("-- ByMahee -- Mementos are created by this point, following is the whole timeMap Object")
            console.log(t);
            console.log("---------------------------------------------------")

            if (t.mementos.length === 0) {
              response.write('There were no mementos for ' + uri + ' :(')
              response.end()
              return
            }

            console.log('Fetching HTML for ' + t.mementos.length + ' mementos.')

            callback('')
          }else{
            console.log('The page you requested has not been archived in Archive-It.')
             process.exit(-1)
          }
        })
      })

      req.on('error', function (e) { // Houston...
        console.log('problem with request: ' + e.message)
        console.log(e)
        if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
          console.log('Hmm, the connection timed out. Internet Archive might be down.')
        }
      })

      req.on('socket', function (socket) { // Slow connection is slow
        /*
        socket.setTimeout(3000)
        socket.on('timeout', function () {
          console.log("The server took too long to respond and we're only getting older so we aborted.")
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
  function (callback) {t.calculateHammingDistancesWithOnlineFiltering(callback);},

    /*// function (callback) {calculateCaptureTimeDeltas(callback);},// CURRENTLY UNUSED, this can be combine with previous call to turn 2n-->1n
    // function (callback) {applyKMedoids(callback);}, // No functionality herein, no reason to call yet
    function (callback) {t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);},
    function (callback) {t.writeJSONToCache(callback);},
    function (callback) {t.printMementoInformation(response, callback);},
    function (callback) {t.createScreenshotsForMementos(callback)}
    */
  ],
  function (err, result) {
    if (err) {
      console.log('ERROR!')
      console.log(err)
    } else {
      console.log('There were no errors executing the callback chain')
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
        console.log(e.message)
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
  console.log('About to print memento information')
  var CRLF = '\r\n'
  var TAB = '\t'
  var stateInformationString = ''


  if (dataReady === false) { // Indicative of the data still loading. Yes, I know it's an abuse of CBs
    stateInformationString = 'Processing data. This could take a while.'
  }


  var cacheFilePathWithoutDotSlash = (new SimhashCacheFile(uriR)).path.substr(2)

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
  //console.log("--- By Mahee - For my understanding")
  //console.log("Inside CalculateSimhashes")
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
//  console.log("--- By Mahee for understanding -- ")
//  console.log(client)
/* commented the below line purposefully to check whether memento fetching isn't working beacuse there are many request made parallely at a time. */
 for (var m = 0; m < this.mementos.length; m++) {
//  for (var m = 0; m < 5; m++) {

    // Allow the Promise async access to browser-based client communication
    //this.mementos[m].fayeClient = client
    this.mementos[m].originalURI = this.originalURI  // The Promise needs the original URI for Faye publication. Scope creep!

    arrayOfSetSimhashFunctions.push(this.mementos[m].setSimhash())
    bar.tick(1)
  }
  var theTimemap = this

  return Promise.all(
    arrayOfSetSimhashFunctions
  ).catch(function (err) {
    console.log('An error occurred in generating the SimHash for a URI-M')
    console.log(err)
  }).then(function () {


    /** --ByMahee--  commented the following block to disable to publish to the client
    client.publish('/' + md5(theTimeMap.originalURI), {
      'uriM': 'done'
    })
    ***/

    // Remove fayeClients from all mementos so they can be converted to JSON
    for (var m = 0; m < theTimeMap.mementos.length; m++) {
      delete theTimeMap.mementos[m].fayeClient
      // Delete theTimeMap.mementos[m].originalURI
    }

    console.log('Checking if there are mementos to remove')
    var mementosRemoved = 0
    console.log('About to go into loop of ## mementos: ' + (theTimemap.mementos.length - 1))

    // Remove all mementos whose payload body was a Wayback soft 302
    for (var i = theTimemap.mementos.length - 1; i >= 0; i--) {
      if (theTimemap.mementos[i].simhash === 'isA302DeleteMe') {
        theTimemap.mementos.splice(i, 1)
        mementosRemoved++
      }
    }

    // console.timeEnd('simhashing')
    console.log(mementosRemoved + ' mementos removed due to Wayback "soft 3xxs"')

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

  console.log('Done getting simhashes from array')
  console.log('-- ByMahee -- In function SaveSimhashesToCache -- Simhash for URI and DateTime is as follows:')
  console.log(strToWrite)
  console.log("-------------------------------------------------------------------------")

  var cacheFile = new SimhashCacheFile(this.originalURI)
  cacheFile.replaceContentWith(strToWrite)


  if (callback) {
      callback('')
  }
}

TimeMap.prototype.writeJSONToCache = function (callback) {
  var cacheFile = new SimhashCacheFile(this.originalURI)
  cacheFile.writeFileContentsAsJSON(JSON.stringify(this.mementos))
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
    // console.log("Hamming distance = "+memento.hammingDistance)
    if (memento.hammingDistance < HAMMING_DISTANCE_THRESHOLD  && memento.hammingDistance >= 0) {
      // console.log(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
      memento.screenshotURI = null
    } else {
      var filename = 'alSum_' + uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      memento.screenshotURI = filename
    }
  })

  console.log('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back')
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

  console.log('Done creating filenames for ' + ii + ' mementos')

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
    console.log('Number to choose is greater than number existing.')
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
  console.log('OriginalURI is ' + _this.originalURI)
  if (numberOfMementosToChoose > this.mementos.length) {
    console.log('Number to choose is greater than number existing.')
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
      console.log(this.mementos[i].datetime + ' accepted')
      selectedIndexes.push(i)
    } else {
      console.log(this.mementos[i].datetime + ' rejected (same month as previous selected)')
    }
  }

  var beforeOK = this.mementos.filter(function (el) {
    return el.selected !== null
  })

  console.log('We are going to choose ' + numberOfMementosToChoose + ' --- ' + selectedIndexes)
  // Prune based on numberOfMementosToChoose
  while (selectedIndexes.length > numberOfMementosToChoose) {
    var mementoIToRemove = Math.floor(Math.random() * selectedIndexes.length)
    console.log(selectedIndexes.length + ' is too many mementos, removing index ' + mementoIToRemove)
    console.log(this.mementos[mementoIToRemove].datetime + ' was ' + this.mementos[mementoIToRemove].selected)
    delete this.mementos[selectedIndexes[mementoIToRemove]].selected
    console.log('Now it is ' + this.mementos[mementoIToRemove].selected)
    selectedIndexes.splice(mementoIToRemove, 1)
  }

  var monthlyOK = this.mementos.filter(function (el) {
    return el.selected
  })

  console.log(beforeOK.length + ' --> ' + monthlyOK.length + ' passed the monthly test')

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
    console.log('Number to choose is greater than number existing.')
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
  console.log('Creating screenshots...')

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
        console.log('Error creating screenshot')
        console.log(err)
      }

      callback('')
    }
  )
}

TimeMap.prototype.createScreenshotForMemento = function (memento, callback) {
  var uri = memento.uri

  var filename = memento.screenshotURI

  try {
    fs.openSync(
      path.join(__dirname + '/screenshots/' + memento.screenshotURI),
      'r', function (e, r) {
        console.log(e)
        console.log(r)
      })

    console.log(memento.screenshotURI + ' already exists...continuing')
    callback()
    return
  }catch (e) {
    console.log((new Date()).getTime() + ' ' + memento.screenshotURI + ' does not exist...generating')
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

  console.log('About to start screenshot generation process for ' + uri)
  webshot(uri, 'screenshots/' + filename, options, function (err) {
    if (err) {
      console.log('Error creating a screenshot for ' + uri)
      console.log(err)
      callback('Screenshot failed!')
    } else {
      fs.chmodSync('./screenshots/' + filename, '755')
      im.convert(['./screenshots/' + filename, '-thumbnail', '200',
            './screenshots/' + (filename.replace('.png', '_200.png'))],
        function (err, stdout) {
          if (err) {
            console.log('We could not downscale ./screenshots/' + filename + ' :(')
          }

          console.log('Successfully scaled ' + filename + ' to 200 pixels', stdout)
        })

      console.log('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
      callback()
    }
  })

}

TimeMap.prototype.calculateHammingDistancesWithOnlineFiltering = function (callback) {
  console.time('Hamming And Filtering, a synchronous operation')

  var lastSignificantMementoIndexBasedOnHamming = 0
  var copyOfMementos = [this.mementos[0]]

  //console.log('Calculate hamming distance of ' + this.mementos.length + ' mementos')
  for (var m = 0; m < this.mementos.length; m++) {
    // console.log("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
    // console.log("...with SimHash: "+this.mementos[m].simhash)
    if (m > 0) {
      if ((this.mementos[m].simhash.match(/0/g) || []).length === 32) {
        console.log('0s, returning')
        continue
      }
      // console.log("Calculating hamming distance")
      this.mementos[m].hammingDistance = getHamming(this.mementos[m].simhash, this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash)
      // console.log("Getting hamming basis")
      this.mementos[m].hammingBasis = this.mementos[lastSignificantMementoIndexBasedOnHamming].datetime

      // console.log('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
      //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
      //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

      if (this.mementos[m].hammingDistance >= HAMMING_DISTANCE_THRESHOLD) { // Filter the mementos if hamming distance is too small
        lastSignificantMementoIndexBasedOnHamming = m

         copyOfMementos.push(this.mementos[m]) // Only push mementos that pass threshold requirements
      }

      // console.log(t.mementos[m].uri+" hammed!")
    } else if (m === 0) {
      console.log('m==0, continuing')
    }
  }

  //console.log((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
  copyOfMementos = null


  console.log("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------")
  console.log(JSON.stringify(this.mementos))
  //console.log(this.mementos)
  console.log("----------------------------------------------------------------------------------------------------------------------------------------------")


  if (callback) { callback('') }
}

/**
* Goes to URI-T(?), grabs contents, parses, and associates mementos
* @param callback The next procedure to execution when this process concludes
*/
TimeMap.prototype.setupWithURIR = function (response, uriR, callback) {
  var timemapHost = 'web.archive.org'
  var timemapPath = '/web/timemap/link/' + uriR
  var options = {
    'host': timemapHost,
    'path': timemapPath,
    'port': 80,
    'method': 'GET'
  }

  var buffer = ''
  var retStr = ''
  console.log('Starting many asynchronous operations...')
  console.log('Timemap output here')
  var tmInstance = this

  var req = http.request(options, function (res) {
    res.setEncoding('utf8')

    res.on('data', function (data) {
      buffer += data.toString()
    })

    res.on('end', function () {
      if (buffer.length > 100) {
        console.log('X Timemap acquired for ' + uriR + ' from ' + timemapHost + timemapPath)
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
    console.log('problem with request: ' + e.message)
    console.log(e)
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
    console.log('Oh noes! Hamming went awry! The lengths are not equal!')
    console.log(str1 + ' ' + str2 + ' ' + str1.length + ' ' + str2.length)

    // ^Throw "Unequal lengths when both strings must be equal to calculate hamming distance."

    // Resilience instead of crashing
    console.log('Unequal lengths when both strings must be equal to calculate hamming distance.')
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
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)')
  process.exit()
})

// Useful Functions
function checkBin (n) {
//  return /^[01]{1, 64}$/.test(n)
// ByMahee -- the above statement is being changed to the following as we are checking 4 bits at a time
 //console.log("Inside Check Binary")
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

/* *********************************
    end UTILITY FUNCTIONS
********************************* */

exports.main = main
main()
// test commit into Branch CLI_JSON
