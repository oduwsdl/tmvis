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
*   > node AlSummarization_OPT_CLI_JSON.js urir
*
* Updated
*  > node AlSummarization_OPT_CLI_JSON.js urir [--debug] [--hdt 4] [--ssd 0] [--ia || --ait || -mg] [--oes] [--ci 1068] [--os || --s&h]
*  ex: node AlSummarization_OPT_CLI_JSON.js http://4genderjustice.org/ --oes --debug --ci 1068
* debug -> Run in debug mode
* hdt -> Hamming Distance Threshold
* ssd -> Screenshot delay
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
var express = require('express')
var url = require('url')
//var connect = require('connect')
//var serveStatic = require('serve-static')
// var Step = require('step')
var async = require('async')
// var Futures = require('futures')
var Promise = require('es6-promise').Promise
var Async = require('async')
var simhash = require('simhash')('md5')
//var moment = require('moment')

//var ProgressBar = require('progress')
//var phantom = require('node-phantom')
var phantom = null;
var fs = require('fs')
var mdr = require('mkdir-recursive')
var path = require('path')
var validator = require('validator')
//var underscore = require('underscore')

var webshot = require('webshot') // PhantomJS wrapper

var argv = require('minimist')(process.argv.slice(2))

var mementoFramework = require('./lib/mementoFramework.js')
var Memento = mementoFramework.Memento
var TimeMap = mementoFramework.TimeMap
var SimhashCacheFile = require('./lib/simhashCache.js').SimhashCacheFile

var colors = require('colors')
var im = require('imagemagick')
var rimraf = require('rimraf')
const puppeteer = require('puppeteer');
var HashMap = require('hashmap');
var cookieParser = require("cookie-parser");

//var faye = require('faye') // For status-based notifications to client

// Faye's will not allow a URI-* as the channel name, hash it for Faye
//var md5 = require('md5')

var zlib = require('zlib')
var app = express()
var morgan  = require('morgan')
var host = argv.host ? argv.host : 'localhost' // Format: scheme://hostname
var port = argv.port ? argv.port : '3000'
var proxy = argv.proxy ? argv.proxy.replace(/\/+$/, '') : ('http://' + host + (port == '80' ? '' : ':' + port))
var localAssetServer = proxy + '/static/'
var isResponseEnded = false
var uriR = ''
var isDebugMode = argv.debug? argv.debug: false
var SCREENSHOT_DELTA = argv.ssd? argv.ssd: 2
var isToOverrideCachedSimHash = argv.oes? argv.oes: false
// by default the prime src is gonna be Archive-It
var primeSrc = argv.ait? 1: (argv.ia ? 2:(argv.mg?3:1))
var primeSource = "archiveit"
var isToComputeBoth = argv.os? false: true // By default computes both simhash and hamming distance
var collectionIdentifier = argv.ci?  argv.ci: 'all'
var screenshotsLocation = "assets/screenshots/"
var role = "stats"
var noOfUniqueMementos = 0
var totalMementos = 0
var streamingRes = null
var curSerReq = null
var streamedHashMapObj = new HashMap()
var responseDup = null;

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
  // setting up the folder required
  if (!fs.existsSync(__dirname+"/assets/screenshots")){
    //fs.mkdirSync(__dirname+"/assets/screenshots");
    mdr.mkdirSync(__dirname+"/assets/screenshots");
  }

  if (!fs.existsSync(__dirname+"/cache")){
    fs.mkdirSync(__dirname+"/cache");
  }

  if (!fs.existsSync(__dirname+"/logs")){
    fs.mkdirSync(__dirname+"/logs");
  }


  //startLocalAssetServer()  //- Now everything is made to be served from the same port.
  var endpoint = new PublicEndpoint()

  // create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs' ,'access.log'), {flags: 'a'})
  var exceptionLogStream = fs.createWriteStream(path.join(__dirname, 'logs' ,'exception.log'), {flags: 'a'})

  app.use(cookieParser());

    // set a cookie
  app.use(function (request, response, next) {
    if(request._parsedUrl.pathname.indexOf("alsummarizedview") > 0 ){
      response.cookie('clientId',Date.now().toString())
    }
    next();
  });


// all the common  requests are logged via here
  app.use(morgan('common',{
    skip: function (req, res) {
      if(req._parsedUrl.pathname.indexOf("notifications") > 0){
        return true;
      }
      return false;
    },
    stream: accessLogStream
  }));

// to log all the exceptions in to exception log file
  app.use(morgan('common',{
    skip: function (req, res) { return res.statusCode < 400 },
    stream: exceptionLogStream
  }));

  app.use(express.static(__dirname + '/public'));  //This route is just for testing



  app.use('/static', express.static(path.join(__dirname, 'assets/screenshots')))

  //app.get(['/','/index.html','/alsummarizedview/:primesource/:ci/:hdt/:role/*'], (request, response) => {
  app.get(['/','/index.html','/alsummarizedview/:primesource/:ci/:hdt/stats/*','/alsummarizedview/:primesource/:ci/:hdt/summary/*'  ], (request, response) => {
    response.sendFile(__dirname + '/public/index.html')
  })



  //This is just a hello test route
   app.get('/hello', (request, response) => {

          var headers = {}
          // IE8 does not allow domains to be specified, just the *
          // headers['Access-Control-Allow-Origin'] = req.headers.origin
          headers['Access-Control-Allow-Origin'] = '*'
          headers['Access-Control-Allow-Methods'] = 'GET'
          headers['Access-Control-Allow-Credentials'] = false
          headers['Access-Control-Max-Age'] = '86400'  // 24 hours
          headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime'
          headers['Content-Type'] = 'text/html' // text/html
            var query = url.parse(request.url, true).query
            console.log(JSON.stringify(query))
          response.writeHead(200, headers)
          response.write('Hello from what ever!')
          response.end()
    })

    //that a work around to clear the streaming realted cache
     app.get('/clearstreamhash', (request, response) => {
            var headers = {}
            // IE8 does not allow domains to be specified, just the *
            // headers['Access-Control-Allow-Origin'] = req.headers.origin
            headers['Access-Control-Allow-Origin'] = '*'
            headers['Access-Control-Allow-Methods'] = 'GET'
            headers['Access-Control-Allow-Credentials'] = false
            headers['Access-Control-Max-Age'] = '86400'  // 24 hours
            headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime'
            headers['Content-Type'] = 'text/html' // text/html
              var query = url.parse(request.url, true).query
              console.log(JSON.stringify(query))
              streamedHashMapObj.clear();
            response.writeHead(200, headers)
            response.write('cleared the streaming hash')
            response.end()
      })



    //This route is just for testing, testing the SSE
   app.get('/notifications/:curUniqueUserSessionID', (request, response) => {

       sendSSE(request, response);
   })



  // this is the actually place that hit the main server logic
  //app.get('/alsummarizedtimemap/:primesource/:ci/:urir', endpoint.respondToClient)
  app.get('/alsummarizedtimemap/:primesource/:ci/:hdt/:role/*', endpoint.respondToClient)


  app.listen(port, '0.0.0.0', (err) => {
    if (err) {
      return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
  })


}


// SSE Related.

function sendSSE(req, res) {

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });


  if( !streamedHashMapObj.has(req.params.curUniqueUserSessionID)){
      streamedHashMapObj.set(req.params.curUniqueUserSessionID,res)
  }

}

function constructSSE(data,clientIdInCookie) {
  var id = Date.now();
  var streamObj = {};
  var curResponseObj= null;
  streamObj.data= data;
  if(clientIdInCookie != undefined && clientIdInCookie != null){
    streamObj.usid = clientIdInCookie;

  }else{
    streamObj.usid = 100;
  }
  console.log("clientIdInCookie --->"+clientIdInCookie);
  console.log("streamedHashMapObj keys --->"+streamedHashMapObj.keys().toString());
  console.log("count --->"+ streamedHashMapObj.count())
  curResponseObj=streamedHashMapObj.get(clientIdInCookie);
  if(curResponseObj != null){
    console.log("From retrieved Response Obj -->"+curResponseObj);
    curResponseObj.write('id: ' + id + '\n')
    curResponseObj.write("data: " + JSON.stringify(streamObj) + '\n\n')
    if(data === "readyToDisplay" || data === "statssent" ){
        streamedHashMapObj.delete(clientIdInCookie)
    }
  }


}



/**
* Setup the public-facing attributes of the service
*/
function PublicEndpoint () {
  var theEndPoint = this
  // Parameters supplied for means of access:
  this.validSource = ['archiveit', 'internetarchive'];

  this.isAValidSourceParameter = function (accessParameter) {
    return theEndPoint.validSource.indexOf(accessParameter) > -1
  }

  /**
  * Handle an HTTP request and respond appropriately
  * @param request  The request object from the client representing query information
  * @param response Currently active HTTP response to the client used to return information to the client based on the request
  */
  this.respondToClient = function (request, response) {
    ConsoleLogIfRequired("#################### Response header ##########")
    ConsoleLogIfRequired(request.headers["x-my-curuniqueusersessionid"])
    ConsoleLogIfRequired("############################################")


    responseDup = response;
    ConsoleLogIfRequired("Cookies------------------>"+request.headers["x-my-curuniqueusersessionid"])
    constructSSE("streamingStarted",request.headers["x-my-curuniqueusersessionid"]);
    constructSSE("percentagedone-3",request.headers["x-my-curuniqueusersessionid"]);

     isResponseEnded = false //resetting the responseEnded indicator
     //response.clientId = Math.random() * 101 | 0  // Associate a simple random integer to the user for logging (this is not scalable with the implemented method)
     response.clientId = request.headers["x-my-curuniqueusersessionid"]
    var headers = {}

    // IE8 does not allow domains to be specified, just the *
    // headers['Access-Control-Allow-Origin'] = req.headers.origin
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET'
    headers['Access-Control-Allow-Credentials'] = false
    headers['Access-Control-Max-Age'] = '86400'  // 24 hours
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime'

    if (request.method !== 'GET') {
      console.log('Bad method ' + request.method + ' sent from client. Try HTTP GET')
      response.writeHead(405, headers)
      response.end()
      return
    }


  //  var response ={}
    var URIRFromCLI = "";

    //var query = url.parse(request.url, true).query

      var query ={};
      query['urir'] = request.params["0"] + (request._parsedUrl.search != null ? request._parsedUrl.search : '');
      query['ci']= request.params.ci;
      query['primesource']= request.params.primesource;
      query['hdt']= request.params.hdt;
      // for the intermediate step of involving user to decide the value of k
      query['role']= request.params.role;
      query['ssd']=request.params.ssd;
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
       URIR PARAMETER - required if not img, supplies basis for archive query
    **************************** */

    function isARESTStyleURI (uri) {
      return (uri.substr(0, 5) === '/http')
    }

    if (!query['urir'] && // a urir was not passed via the query string...
      request._parsedUrl && !isARESTStyleURI(request._parsedUrl.pathname.substr(0, 5))) { // ...or the REST-style specification
      response.writeHead(400, headers)
      response.write('No urir Sent with the request')
      response.end()
      return
    } else if (request._parsedUrl && !query['urir']) {
      // Populate query['urir'] with REST-style URI and proceed like nothing happened
      query['urir'] = request._parsedUrl.pathname.substr(1)
    } else if (query['urir']) { // urir is specied as a query parameter
      console.log('urir valid, using query parameter.')
    }


    // ByMahee --- Actually URI is being set here
    uriR = query['urir']
    ConsoleLogIfRequired("--ByMahee: uriR = "+uriR)


    primeSource = theEndPoint.validSource[0] // Not specified? access=interface
    // Override the default access parameter if the user has supplied a value
    //  via query parameters
    if (query.primesource) {
      primeSource = query.primesource.toLowerCase()
    }

    if (isNaN(query.hdt)){
          query.hdt = 4 // setting to default hamming distance threshold
    }else{
          query.hdt = parseInt(query.hdt)
    }

    if(query.role === "stats"){
      role = "stats"
    }else if(query.role === "summary"){
      role = "summary"
    }else{
        role = "stats" // incase if a dirty value is sent
        query.role = "stats"
    }

    if (isNaN(query.ssd)){
          SCREENSHOT_DELTA = 2; // setting to default screenshot delay time
    }else{
          SCREENSHOT_DELTA = parseInt(query.ssd)
    }

    if (!theEndPoint.isAValidSourceParameter(primeSource)) { // A bad access parameter was passed in
      console.log('Bad source query parameter: ' + primeSource)
      response.writeHead(501, headers)
      response.write('The source parameter was incorrect. Try one of ' + theEndPoint.validSource.join(',') + ' or omit it entirely from the query string\r\n')
      response.end()
      return
    }

    headers['X-Means-Of-Source'] = primeSource

    var strategy = "alSummarization"
    headers['X-Summarization-Strategy'] = strategy

    if(primeSource == 'archiveit'){
      primeSrc = 1

    }else if(primeSource == 'internetarchive'){
      primeSrc = 2
    }else{
        primeSrc = 3
    }


    if (!uriR.match(/^[a-zA-Z]+:\/\//)) {
      uriR = 'http://' + uriR
    }// Prepend scheme if missing


    headers['Content-Type'] = 'application/json' //'text/html'
    response.writeHead(200, headers)

    ConsoleLogIfRequired('New client request urir: ' + query['urir'] + '\r\n> Primesource: ' + primeSource + '\r\n> Strategy: ' + strategy)

    if (!validator.isURL(uriR)) { // Return "invalid URL"

      consoleLogJSONError('Invalid URI')
      //response.writeHead(200, headers)
      response.write('Invalid urir \r\n')
      response.end()
      return
    }

    function consoleLogJSONError (str) {
      ConsoleLogIfRequired('{"Error": "' + str + '"}')
    }


    if ( isNaN(query.ci)){
      collectionIdentifier = 'all'
      query.ci = 'all';
    }else {
      collectionIdentifier = parseInt(query.ci)
      query.ci = parseInt(query.ci)
    }

    // ByMahee -- setting the  incoming data from request into response Object
    response.thumbnails = [] // Carry the original query parameters over to the eventual response
    response.thumbnails['primesource'] = primeSource
    response.thumbnails['strategy'] = strategy
    response.thumbnails['collectionidentifier'] = query.ci
    response.thumbnails['hammingdistancethreshold'] = query.hdt
    response.thumbnails['role'] = query.role

    /*TODO: include consideration for strategy parameter supplied here
            If we consider the strategy, we can simply use the TimeMap instead of the cache file
            Either way, the 'response' should be passed to the function representing the chosen strategy
            so the function still can return HTML to the client
    */
    var t = new TimeMap()

    t.originalURI = query['urir']
    t.primesource = primeSource
    t.collectionidentifier = query.ci
    t.hammingdistancethreshold = query.hdt
    t.role = query.role

    // TODO: optimize this out of the conditional so the functions needed for each strategy are self-contained (and possibly OOP-ified)
    if (strategy === 'alSummarization') {
      var cacheFile = new SimhashCacheFile( primeSource+"_"+collectionIdentifier+"_"+uriR,isDebugMode)
      cacheFile.path += '.json'
      ConsoleLogIfRequired('Checking if a cache file exists for ' + query['urir'] + '...')
      constructSSE('Checking if a cache file exists for ' + query['urir'] + '...',request.headers["x-my-curuniqueusersessionid"])
      constructSSE("percentagedone-10",request.headers["x-my-curuniqueusersessionid"]);


    //  ConsoleLogIfRequired('cacheFile: '+JSON.stringify(cacheFile))
      cacheFile.readFileContents(
        function success (data) {
          // A cache file has been previously generated using the alSummarization strategy

          // ByMahee -- ToDo: We can even add a prompt from user asking whether he would want to recompute hashes here
          ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Success ReadFile Content, processWithFileContents is called next ")

            if(isToOverrideCachedSimHash){
              ConsoleLogIfRequired("Responded to compute latest simhahes, Proceeding....");
              getTimemapGodFunctionForAlSummarization(query['urir'], response,request.headers["x-my-curuniqueusersessionid"])
            }else{
              ConsoleLogIfRequired("Responded to continue with the exisitng cached simhashes file. Proceeding..");
              constructSSE('cached simhashes exist, proceeding with cache...',request.headers["x-my-curuniqueusersessionid"])
              constructSSE("percentagedone-60",request.headers["x-my-curuniqueusersessionid"]);

              processWithFileContents(data, response,request.headers["x-my-curuniqueusersessionid"])
            }

        },
        function failed () {
          //ByMahee -- calling the core function responsible for AlSummarization, if the cached file doesn't exist
          ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Failed ReadFile Content (meaning file doesn't exist), getTimemapGodFunctionForAlSummarization is called next ")
          constructSSE("cached simhashes doesn't exist, proceeding to compute the simhashes...",request.headers["x-my-curuniqueusersessionid"])

          getTimemapGodFunctionForAlSummarization(query['urir'], response,request.headers["x-my-curuniqueusersessionid"])
        }

      )
    }
  }
}





/**
* Delete all derived data including caching and screenshot - namely for testing
* @param cb Callback to execute upon completion
*/
function cleanSystemData (cb) {
  // Delete all files in ./screenshots/ and ./cache/
  var dirs = ['assets/screenshots', 'assets/cache']
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
function processWithFileContents (fileContents, response,curCookieClientId) {

  var t = createMementosFromJSONFile(fileContents)
   t.curClientId = curCookieClientId
   t.originalURI = uriR
   t.primesource = response.thumbnails['primesource']
   t.collectionidentifier = response.thumbnails['collectionidentifier']
   t.hammingdistancethreshold = response.thumbnails['hammingdistancethreshold']
   t.role = response.thumbnails['role']
  /* ByMahee -- unnessessary for the current need
  t.printMementoInformation(response, null, false) */

  ConsoleLogIfRequired("Existing file contents are as follows:")
  ConsoleLogIfRequired("**************************************************************************************************");
  console.log(JSON.stringify(t));
    if(isToComputeBoth){
      constructSSE('streamingStarted',curCookieClientId)
        async.series([
          function (callback) {
            if(role == "stats"){
              t.calculateHammingDistancesWithOnlineFiltering(curCookieClientId,callback);
            }else{
              t.calculateHammingDistancesWithOnlineFilteringForSummary(curCookieClientId,callback);
            }
            constructSSE("percentagedone-5",curCookieClientId);
          },
          function (callback) {
            if(role == "stats"){
              t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback)
            }else{
              t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary(callback)

            }
            constructSSE("percentagedone-15",curCookieClientId);
          },
          function (callback) {
            ConsoleLogIfRequired('****************curCookieClientId from processWithFileContents ->'+curCookieClientId +' *********')
            constructSSE("percentagedone-20",curCookieClientId);
            t.createScreenshotsForMementos(curCookieClientId,response,callback)
          },
          function (callback) {
            constructSSE('Writing the data into cache file for future use...',curCookieClientId)
            constructSSE("percentagedone-95",curCookieClientId);
            t.writeThumbSumJSONOPToCache(response)
          }
        ],
        function (err, result) {

          if (err) {
            console.log('ERROR!')
            console.log(err)
          } else {
            constructSSE('Finshed writing into cache...',curCookieClientId)
            constructSSE("percentagedone-100",curCookieClientId);
            console.log('There were no errors executing the callback chain')


          }
        }
      )
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
Memento.prototype.setSimhash = function (curCookieClientId,callback) {
  // Retain the urir for reference in the promise (this context lost with async)
  var thaturi = this.uri
  var thatmemento = this
    var buffer2 = ''
    var memento = this // Potentially unused? The 'this' reference will be relative to the promise here
    var mOptions = url.parse(thaturi)
    constructSSE('Memento under processing -> '+thaturi, curCookieClientId)
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
        //var md5hash = md5(thatmemento.originalURI) // urir cannot be passed in the raw
        ConsoleLogIfRequired("-- By Mahee -- Inside On response end of http request of setSimhash")
        ConsoleLogIfRequired("ByMahe -- here is the buffer content of " +mOptions.host+mOptions.path+":")  */
      //  ConsoleLogIfRequired(buffer2)
      //  ConsoleLogIfRequired("========================================================")
        //ConsoleLogIfRequired("Buffer Length ("+mOptions.host + mOptions.path +"):-> "+ buffer2.length)

        if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 && thatmemento.simhash != '00000000') {

          var sh = simhash((buffer2).split('')).join('')
         ConsoleLogIfRequired("ByMahee -- computed simhash for "+mOptions.host+mOptions.path+" -> "+ sh)
         constructSSE('computed simhash for '+mOptions.host+mOptions.path +' -> '+ sh,curCookieClientId)
          var retStr = getHexString(sh)

          //|| (retStr == null)
          if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302 || retStr == null) {
            // Normalize so not undefined
            retStr = Memento.prototype.simhashIndicatorForHTTP302

            // Gateway timeout from the archives, remove from consideration
            // resolve('isA302DeleteMe')
            callback()
          }

          buffer2 = ''
          buffer2 = null

        //  ConsoleLogIfRequired("Hex Code for Simhash:"+retStr + ' & urir:' + mOptions.host + mOptions.path)

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
        constructSSE('Error generating the simhash',curCookieClientId);

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
* @param uri The urir in-question
*/
function getTimemapGodFunctionForAlSummarization (uri, response,curCookieClientId) {
  ConsoleLogIfRequired("--ByMahee -- Inside function : getTimemapGodFunctionForAlSummarization")
  ConsoleLogIfRequired("--ByMahee -- Applying AlSummarization on given urir = "+ uri)

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
      constructSSE('Http Request made to fetch the timemap...',curCookieClientId)

      var req = http.request(options, function (res) {
         ConsoleLogIfRequired("--ByMahee-- Inside the http request call back success, request is made on the following obect:")
        constructSSE('streamingStarted',curCookieClientId)

        constructSSE('Fetching the Timemap and writing the data response into buffer..',curCookieClientId)
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
            t.primesource = response.thumbnails['primesource']
            t.collectionidentifier = response.thumbnails['collectionidentifier']
            t.hammingdistancethreshold = response.thumbnails['hammingdistancethreshold']
            t.role = response.thumbnails['role']

            t.createMementos() // the place where all the mementos are generated
            ConsoleLogIfRequired("-- ByMahee -- Mementos are created by this point, following is the whole timeMap Object")
            ConsoleLogIfRequired(t);
            ConsoleLogIfRequired("---------------------------------------------------")

            if (t.mementos.length === 0) {
              ConsoleLogIfRequired('There were no mementos for ' + uri + ' :(')
              response.write('There were no mementos for ' + uri + ' :(')
              response.end()
                return
            }

            ConsoleLogIfRequired('Fetching HTML for ' + t.mementos.length + ' mementos.')
            constructSSE('Timemap fetched has a total of '+t.mementos.length + ' mementos.',curCookieClientId)

            // to respond to the client as the intermediate response, while the server processes huge loads
           if(t.mementos.length > 5000){
            ConsoleLogIfRequired('The page you requested has more than 5000 Mementos, Service cannot handle this request right now.')
            constructSSE('The page you requested has more than 5000 Mementos, Service cannot handle this request right now.',curCookieClientId)
            constructSSE("percentagedone-100",curCookieClientId);
             //process.exit(-1)
             response.write('The page you requested has more than 5000 Mementos, Service cannot handle this request right now..',)
             response.end()
             return
           }


            // to respond to the client as the intermediate response, while the server processes huge loads
           if(t.mementos.length > 250){

            constructSSE('Might aprroximately take  <h3>  ' + Math.ceil((t.mementos.length)/(60*4))  +' Minutes ...<h3> to compute simhashes',curCookieClientId)
            constructSSE("percentagedone-20",curCookieClientId);
            // now that streaming is in place, dont bother about sending an intermediate response
            //  response.write('Request being processed, Please retry approximately after ( ' + Math.ceil(((t.mementos.length/50)  * 10)/60)  +' Minutes ) and request again...')
            //  response.end()
            //  isResponseEnded = true
           }


            callback('')
          }else{
            ConsoleLogIfRequired('The page you requested has not been archived.')
            constructSSE('The page requested has not been archived.',curCookieClientId)
            constructSSE("percentagedone-100",curCookieClientId);
             //process.exit(-1)
             response.write('The page you requested has not been archived.',)
             response.end()
               return

          }
        })
      })

      req.on('error', function (e) { // Houston...
        ConsoleLogIfRequired('problem with request: ' + e.message)
        ConsoleLogIfRequired(e)
        if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
          ConsoleLogIfRequired('Hmm, the connection timed out. Internet Archive might be down.')
          constructSSE('the connection timed out, prime source of archive might be down.',curCookieClientId)

          response.write('Hmm, the connection timed out. Internet Archive might be down.')
          response.end()
            return
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
    function (callback) {
      t.calculateSimhashes(curCookieClientId,callback);
    },
    function (callback) {
      constructSSE("percentagedone-75",curCookieClientId);
      t.saveSimhashesToCache(callback);
    },

    function (callback) {
        if(isToComputeBoth){
          if(role == "stats"){
            t.calculateHammingDistancesWithOnlineFiltering(curCookieClientId,callback);
          }else{
            t.calculateHammingDistancesWithOnlineFilteringForSummary(curCookieClientId,callback);
          }
        }
        else if (callback) {
          callback('')
        }
    },
    function (callback) {
        if(isToComputeBoth){
          if(role == "stats"){
            t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback)
          }else{
            t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary(callback)
          }
        }
        else if (callback) {
          callback('')
        }
    },
    function (callback) {
      constructSSE("percentagedone-90",curCookieClientId);
      t.writeJSONToCache(callback)
    },
    function (callback) {

        if(isToComputeBoth){

          t.createScreenshotsForMementos(curCookieClientId,response,callback);
        }
        else if (callback) {
          callback('')
        }
    },
    function (callback) {t.writeThumbSumJSONOPToCache(response,callback)}

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

TimeMap.prototype.calculateSimhashes = function (curCookieClientId,callback) {
  //ConsoleLogIfRequired("--- By Mahee - For my understanding")
  //ConsoleLogIfRequired("Inside CalculateSimhashes")
  var theTimeMap = this
  var arrayOfSetSimhashFunctions = []
  var completedSimhashedMementoCount = 0;
  var totalMemetoCount = this.mementos.length;
  var preVal = 0;
  // the way to get a damper, just 7 requests at a time.
  async.eachLimit(this.mementos,5, function(curMemento, callback){
    curMemento.setSimhash(curCookieClientId,callback)
    completedSimhashedMementoCount++;

    var value = (completedSimhashedMementoCount/totalMemetoCount)*70+20;
    if(value > preVal){ // At times if there is an error while fetching the contents, retry happens and context jumps back there
      preVal = value;
    }
    if(preVal > 100){
      preVal = 95;
    }
    constructSSE("percentagedone-"+Math.ceil(preVal),curCookieClientId);

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

        if(theTimeMap.mementos[i].simhash === Memento.prototype.simhashIndicatorForHTTP302 || theTimeMap.mementos[i].simhash  == null){
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

  // modified ti accomodate the hdt aswell with in the cache - meaning different hdt will have different cached file from now on
  // Modified it back to original, cause now multiple Hamming distance stats are thrown at once.
  var cacheFile = new SimhashCacheFile(primeSource+"_"+collectionIdentifier+"_"+this.originalURI,isDebugMode)
  cacheFile.replaceContentWith(strToWrite)

  if (callback) {
      callback('')
  }
}

TimeMap.prototype.writeJSONToCache = function (callback) {
  var originalURI = this.originalURI;
  var cacheFile = new SimhashCacheFile(primeSource+"_"+collectionIdentifier+"_"+originalURI,isDebugMode)
  //cacheFile.writeFileContentsAsJSON(JSON.stringify(this.mementos))
  cacheFile.writeFileContentsAsJSON(this.mementos) // write the last HD based content into JSON

  // in case if the contents have to be written back to JSON
  // this.menentoDetForMultipleKValues.forEach(function(mementoArrObj, hammingDistance) {
  //   HAMMING_DISTANCE_THRESHOLD = hammingDistance;
  //   var cacheFile = new SimhashCacheFile(primeSource+"_"+"hdt_"+HAMMING_DISTANCE_THRESHOLD+"_"+collectionIdentifier+"_"+originalURI,isDebugMode)
  //   cacheFile.writeFileContentsAsJSON(mementoArrObj)
  // });

  if (callback) {
    callback('')
  }
}


/**
* Constructs the JSON in the needed format and sends it over to Client, this method is called only if the request comes from a Cached mode
*/
TimeMap.prototype.SendThumbSumJSONCalledFromCache= function (response,callback) {

  var month_names_short= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var mementoJObjArrForTimeline=[];
  var mementoJObjArrFor_Grid_Slider =[];
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  this.mementos.forEach(function (memento,m) {

    var uri = memento.uri
    // need to have the following line, id_ isnot needed for screen shot, to replace /12345678912345id_/ to /12345678912345/
    var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
    var matchedString = uri.match(regExpForDTStr)
    if(matchedString != null){
      uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
    }

    // this is been replaced by the above so as not to have any clashes
    //uri = uri.replace("id_/http","/http");

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

      // the two following lines are connented as the JSON object must not contain HTML Fragment
      // mementoJObj_ForTimeline["event_html"] = "<img src='"+localAssetServer+"notcaptured.png' width='300px' />"
      // mementoJObj_ForTimeline["event_html_similarto"] = "<img src='"+localAssetServer+memento.hammingBasisScreenshotURI +"' width='300px' />"

      mementoJObj_ForTimeline["event_html"] = 'notcaptured'
      mementoJObj_ForTimeline["event_html_similarto"] = localAssetServer+memento.hammingBasisScreenshotURI

    }else{
      var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      mementoJObj_ForTimeline["event_series"] = "Thumbnails"
      mementoJObj_ForTimeline["event_html"] = localAssetServer+memento.screenshotURI

    }

    mementoJObj_ForTimeline["event_date"] =  month_names_short[ parseInt(month)]+". "+date +", "+ dt.getUTCFullYear()
    mementoJObj_ForTimeline["event_display_date"] = eventDisplayDate
    mementoJObj_ForTimeline["event_description"] = ""
    mementoJObj_ForTimeline["event_link"] = uri
    mementoJObjArrForTimeline.push(mementoJObj_ForTimeline)
  })

  response.write(JSON.stringify(mementoJObjArrForTimeline))
  response.end()

  ConsoleLogIfRequired("--------------------- Json Array for TimeLine from  SendThumbSumJSONCalledFromCache ------------------------------")
  ConsoleLogIfRequired(JSON.stringify(mementoJObjArrForTimeline))
  ConsoleLogIfRequired("------------------------------------------------------------------------------------------------------------")
  if (callback) {
    callback('')
  }
}


/**
* Converts the JsonOutput from the current formate to the format required for timemap plugin
* and saves in a json file
*/
TimeMap.prototype.writeThumbSumJSONOPToCache = function (response,callback) {

  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& in ThumbSumJSON wiritng method &&&&&&&&&&&&&&&&&&&&&&&&&&&&")

  var month_names_short= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var mementoJObjArrForTimeline=[];
  var mementoJObjArrFor_Grid_Slider =[];
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  this.mementos.forEach(function (memento,m) {

    var uri = memento.uri

    // need to have the following line, id_ isnot needed for screen shot, to replace /12345678912345id_/ to /12345678912345/
    var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
    var matchedString = uri.match(regExpForDTStr)
    if(matchedString != null){
      uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
    }

    //  uri = uri.replace("id_/http","/http"); //replaced by the above segment

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
     mementoJObj_ForTimeline["event_html"] = "notcaptured"
     mementoJObj_ForTimeline["event_html_similarto"] = localAssetServer+memento.hammingBasisScreenshotURI

    }else{
      var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      mementoJObj_ForTimeline["event_series"] = "Thumbnails"

      // the two following lines are connented as the JSON object must not contain HTML Fragment
      mementoJObj_ForTimeline["event_html"] = localAssetServer+memento.screenshotURI
    }

    mementoJObj_ForTimeline["event_date"] =  month_names_short[ parseInt(month)]+". "+date +", "+ dt.getUTCFullYear()
    mementoJObj_ForTimeline["event_display_date"] = eventDisplayDate
    mementoJObj_ForTimeline["event_description"] = ""
    mementoJObj_ForTimeline["event_link"] = uri
    mementoJObjArrForTimeline.push(mementoJObj_ForTimeline)
  })

  var cacheFile = new SimhashCacheFile(primeSource+"_"+"hdt_"+response.thumbnails['hammingdistancethreshold']+"_"+collectionIdentifier+"_"+this.originalURI,isDebugMode)
  cacheFile.writeThumbSumJSONOPContentToFile(mementoJObjArrForTimeline)

    if(!isResponseEnded){
      response.write(JSON.stringify(mementoJObjArrForTimeline))
      response.end()
    }

  ConsoleLogIfRequired("--------------------- Json Array for TimeLine from  writeThumbSumJSONOPToCache------------------------------")
  ConsoleLogIfRequired(JSON.stringify(mementoJObjArrForTimeline))
  ConsoleLogIfRequired("------------------------------------------------------------------------------------------------------------")
  if (callback) {
    callback('')
  }
}



TimeMap.prototype.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary = function (callback) {
  // Assuming foreach is faster than for-i, this can be executed out-of-order
  var self = this;
  this.mementos.forEach(function (memento,m) {
    var uri = memento.uri

      //  to replace /12345678912345id_/ to /12345678912345/
      var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
      var matchedString = uri.match(regExpForDTStr)
      if(matchedString != null){
        uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
      }

      //uri = uri.replace("id_/http","/http"); //replaced by above code segment
    // ConsoleLogIfRequired("Hamming distance = "+memento.hammingDistance)
    if (memento.hammingDistance < self.hammingdistancethreshold  && memento.hammingDistance >= 0) {
      // ConsoleLogIfRequired(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
      memento.screenshotURI = null

      var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
      var matchedString = memento.hammingBasisURI.match(regExpForDTStr)
      if(matchedString != null){
        memento.hammingBasisURI = memento.hammingBasisURI.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
      }
      var filename = 'timemapSum_'+ memento.hammingBasisURI.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename

      //var filename = 'timemapSum_' + SCREENSHOT_DELTA + '_'+ memento.hammingBasisURI.replace("id_/http","/http").replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename // replaced by above segment
      memento.hammingBasisScreenshotURI = filename
    } else {
      var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
      memento.screenshotURI = filename
    }
  })

  ConsoleLogIfRequired('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back')
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
  var self = this;
  this.menentoDetForMultipleKValues.forEach(function(mementoArr, hammingDistanceThresh) {
    var currHDT = hammingDistanceThresh // for multiple threshold computation, setting the threshold against the corresponding MementodDetails object
    mementoArr.forEach(function (memento,m) {
      var uri = memento.uri
        //  to replace /12345678912345id_/ to /12345678912345/
        var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
        var matchedString = uri.match(regExpForDTStr)
        if(matchedString != null){
          uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
        }

        //uri = uri.replace("id_/http","/http"); //replaced by above code segment

      // ConsoleLogIfRequired("Hamming distance = "+memento.hammingDistance)
      if (memento.hammingDistance < currHDT  && memento.hammingDistance >= 0) {
        // ConsoleLogIfRequired(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
        memento.screenshotURI = null

        var regExpForDTStr = /\/\d{14}id_\// // to match something lile /12345678912345id_/
        var matchedString = memento.hammingBasisURI.match(regExpForDTStr)
        if(matchedString != null){
          memento.hammingBasisURI = memento.hammingBasisURI.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
        }
        var filename = 'timemapSum_'+ memento.hammingBasisURI.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename

        //var filename = 'timemapSum_' + SCREENSHOT_DELTA + '_'+ memento.hammingBasisURI.replace("id_/http","/http").replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename // replaced by above segment
        memento.hammingBasisScreenshotURI = filename
      } else {
        var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename
        memento.screenshotURI = filename
      }
    })

  });

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
      var filename = strategy + '_'+ this.mementos[m].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'
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
* Generate a screenshot with all mementos that pass the passed-in criteria test
* @param callback The next procedure to execution when this process concludes
* @param withCriteria Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementos = function (curCookieClientId,response,callback, withCriteria) {


  function hasScreenshot (e) {
    return e.screenshotURI !== null
  }

  var self = this

  var criteria = hasScreenshot
  if (withCriteria) {
    criteria = withCriteria
  }

  var noOfThumbnailsSelectedToBeCaptured = 0;

  // breaking the control and returning the stats if the the request is made for status
  if(role == "stats"){
    var statsArry =[];
    self.statsHashMapObj.forEach(function(statsObj, hammingDistance) {
      console.log("------------------ selected for screenshots------------")
      console.log(JSON.stringify(self.menentoDetForMultipleKValues.get(hammingDistance).filter(criteria)))
       noOfThumbnailsSelectedToBeCaptured = getNotExistingCapturesCount(self.menentoDetForMultipleKValues.get(hammingDistance).filter(criteria))
        statsObj["timetowait"] = Math.ceil((noOfThumbnailsSelectedToBeCaptured * 40)/60 + (noOfThumbnailsSelectedToBeCaptured*SCREENSHOT_DELTA))
        constructSSE('No of screenshots to be captured -> <h4>'+noOfThumbnailsSelectedToBeCaptured +'</h4>',curCookieClientId)
        statsArry.push(statsObj);
    });

    constructSSE('Stats built and ready to serve...',curCookieClientId)
    constructSSE("percentagedone-100",curCookieClientId);
    constructSSE('statssent',curCookieClientId);
    response.write(JSON.stringify(statsArry));
    response.end();
    return
  }else{
     noOfThumbnailsSelectedToBeCaptured = getNotExistingCapturesCount(self.mementos.filter(criteria))
  }

  ConsoleLogIfRequired('Creating screenshots...')
  ConsoleLogIfRequired('Started the process of capturing the screenshots...',curCookieClientId)

  constructSSE('Started the process of capturing the screenshots...',curCookieClientId)
  //constructSSE("streamingStarted",curCookieClientId);
  constructSSE("percentagedone-5",curCookieClientId);

  if (noOfThumbnailsSelectedToBeCaptured >= 2) {
    constructSSE('Might approximately take <h3>' + Math.ceil((noOfThumbnailsSelectedToBeCaptured * 40)/60 + (noOfThumbnailsSelectedToBeCaptured*SCREENSHOT_DELTA))  +' Minutes <h3> to capture screen shots. Please be patient....')

    // now that streaming is in place, dont bother about sending an intermediate response
    // response.write('Request being processed, Please retry approximately after ( ' + Math.ceil((noOfThumbnailsSelectedToBeCaptured * 40)/60)  +' Minutes ) and request again...')
    // response.end()
    // isResponseEnded = true
  }
  var completedScreenshotCaptures = 0;
  var preVal =0;
  async.eachLimit(
    shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
    1,function( memento,callback){
      ConsoleLogIfRequired('************curCookieClientId just before calling  createScreenshotForMementoWithPuppeteer -> '+curCookieClientId+'************')
      self.createScreenshotForMementoWithPuppeteer(curCookieClientId,memento,callback)
      completedScreenshotCaptures++;
      var value = ((completedScreenshotCaptures/noOfThumbnailsSelectedToBeCaptured)*80)+5;
      if(value > preVal){ // At times if there is an error while fetching the contents, retry happens and context jumps back there
        preVal = value;
      }
      if(preVal > 100){
        preVal = 95;
      }
      constructSSE("percentagedone-"+Math.ceil(preVal),curCookieClientId);

    } ,
    function doneCreatingScreenshots (err) {      // When finished, check for errors

      ConsoleLogIfRequired('Finished capturing all the required screenshots...'+curCookieClientId)

      constructSSE('Finished capturing all the required screenshots...',curCookieClientId)
      constructSSE("percentagedone-100",curCookieClientId);
        constructSSE('readyToDisplay',curCookieClientId)

      if (err) {
        ConsoleLogIfRequired('Error creating screenshot',curCookieClientId)

        ConsoleLogIfRequired(err)
      }
      callback('')
    }
  )
}


/**
* Generate a screenshot with all mementos that pass the passed-in criteria test
* @param callback The next procedure to execution when this process concludes
* @param withCriteria Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementosFromCached = function (curCookieClientId,callback, withCriteria) {
  ConsoleLogIfRequired('Creating screenshots...')

  function hasScreenshot (e) {
    return e.screenshotURI !== null
  }

  var self = this

  var criteria = hasScreenshot
  if (withCriteria) {
    criteria = withCriteria
  }
  console.log("------------------ selected for screenshots------------")
  console.log(JSON.stringify(self.mementos.filter(criteria)))

  async.eachLimit(
    shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
    1,
    function( memento,callback){
      self.createScreenshotForMementoWithPuppeteer(curCookieClientId,memento,callback)
    },

    function doneCreatingScreenshots (err) {      // When finished, check for errors
      constructSSE('Finished capturing all the required screenshots...',curCookieClientId)
        constructSSE('readyToDisplay',curCookieClientId)
      if (err) {
        ConsoleLogIfRequired('Error creating screenshot')
        ConsoleLogIfRequired(err)
      }

      callback('')
    }
  )
}


// createScreenshotForMemento through puppeteer
TimeMap.prototype.createScreenshotForMementoWithPuppeteer = function (curCookieClientId,memento,callback) {
  var uri = memento.uri
  ConsoleLogIfRequired('********** curCookieClientId in createScreenshotForMementoWithPuppeteer -> '+curCookieClientId+'***************')

  var regExpForDTStr = /\/\d{14}id_\/|\d{14}\// //to match something like /12345678912345id_/
  var matchedString = uri.match(regExpForDTStr)
  if(matchedString != null){
    uri = uri.replace(matchedString[0],(matchedString[0].toString().replace(/id_\/$|\/$/,"if_/"))) // by default only the first occurance is replaced
  }

  //uri = uri.replace("id_/http","/http");
  //uri = uri.replace("/http","if_/http");

  var filename = memento.screenshotURI

  try {
    fs.openSync(
      path.join(__dirname + '/'+screenshotsLocation + memento.screenshotURI),
      'r', function (e, r) {
        ConsoleLogIfRequired(e)
        ConsoleLogIfRequired(r)
      })

    constructSSE(memento.screenshotURI + ' already exists...',curCookieClientId)
    ConsoleLogIfRequired(memento.screenshotURI + ' already exists...continuing',curCookieClientId)
    callback()
    return
  }catch (e) {
    ConsoleLogIfRequired((new Date()).getTime() + ' ' + memento.screenshotURI + ' does not exist...generating')
    ConsoleLogIfRequired(memento.screenshotURI + 'does not exist, generating...')

  }

  ConsoleLogIfRequired('About to start screenshot generation process for ' + uri)
  constructSSE('Starting screenshot generation process for -> ' + uri,curCookieClientId)
  constructSSE('....................................',curCookieClientId)

  headless(uri, screenshotsLocation + filename).then(v => {
      // Once all the async parts finish this prints.
      console.log("Finished Headless");
      constructSSE('Done capturing the screenshot..',curCookieClientId)

      fs.chmodSync('./'+screenshotsLocation + filename, '755')
      im.convert(['./'+screenshotsLocation + filename, '-thumbnail', '200',
            './'+screenshotsLocation + (filename.replace('.png', '_200.png'))],
        function (err, stdout) {
          if (err) {
            ConsoleLogIfRequired('We could not downscale ./'+screenshotsLocation + filename + ' :(')
          }

          ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout)
        })

      ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
      callback()
  });


  // webshot(uri, screenshotsLocation + filename, options, function (err) {
  //   if (err) {
  //     ConsoleLogIfRequired('Error creating a screenshot for ' + uri)
  //     ConsoleLogIfRequired(err)
  //     callback('Screenshot failed!')
  //   } else {
  //
  //     fs.chmodSync('./'+screenshotsLocation + filename, '755')
  //     im.convert(['./'+screenshotsLocation + filename, '-thumbnail', '200',
  //           './'+screenshotsLocation + (filename.replace('.png', '_200.png'))],
  //       function (err, stdout) {
  //         if (err) {
  //           ConsoleLogIfRequired('We could not downscale ./'+screenshotsLocation + filename + ' :(')
  //         }
  //
  //         ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout)
  //       })
  //
  //     ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
  //     callback()
  //   }
  // })

}

async function headless(uri,filepath) {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
          args: ['--no-sandbox']
        // headless: false,
    });
    const page = await browser.newPage();
    page.emulate({
        viewport: {
            width: 1024,
            height: 768,
        },
        userAgent: "memento-damage research ODU <@WebSciDL>",
    });

    try {
        // track failed responses ~ Security blocks, etc.
        page.on('requestfailed', request => {
          if(request.response()){
              console.log(request.url, request.response().status);
          }else{
              console.log(request.url, request.response());
          }
        });

        page.on('response', response => {
          console.log(response.url, response.status, response.headers);
        });

        // timeout at 5 minutes (5 * 60 * 1000ms), wait until all dom content is loaded
        await page.goto(uri, {
            waitUntil: 'domcontentloaded',
            timeout: 5000000,
        });

      	//Set wait time before screenshotURI
      	await page.waitFor(SCREENSHOT_DELTA * 1000); //convert to seconds

        // Take screenshots
        await page.screenshot({
            path: filepath,
            //fullPage: true
        });

    } catch (e) {
        console.log(uri,"Failed with error:", e);
        //process.exit(1);
    }
    browser.close();
}






TimeMap.prototype.createScreenshotForMemento = function (memento, callback) {
  var uri = memento.uri

  var regExpForDTStr = /\/\d{14}id_\/|\d{14}\// //to match something lile /12345678912345id_/
  var matchedString = uri.match(regExpForDTStr)
  if(matchedString != null){
    uri = uri.replace(matchedString[0],(matchedString[0].toString().replace(/id_\/$|\/$/,"if_/"))) // by default only the first occurance is replaced
  }

  //uri = uri.replace("id_/http","/http");
  //uri = uri.replace("/http","if_/http");

  var filename = memento.screenshotURI

  try {
    fs.openSync(
      path.join(__dirname + '/'+screenshotsLocation + memento.screenshotURI),
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
  webshot(uri, screenshotsLocation + filename, options, function (err) {
    if (err) {
      ConsoleLogIfRequired('Error creating a screenshot for ' + uri)
      ConsoleLogIfRequired(err)
      callback('Screenshot failed!')
    } else {

      fs.chmodSync('./'+screenshotsLocation + filename, '755')
      im.convert(['./'+screenshotsLocation + filename, '-thumbnail', '200',
            './'+screenshotsLocation + (filename.replace('.png', '_200.png'))],
        function (err, stdout) {
          if (err) {
            ConsoleLogIfRequired('We could not downscale ./'+screenshotsLocation + filename + ' :(')
          }

          ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout)
        })

      ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
      callback()
    }
  })

}




TimeMap.prototype.calculateHammingDistancesWithOnlineFilteringForSummary = function (curCookieClientId,callback) {
  console.time('Hamming And Filtering, a synchronous operation')
  constructSSE('computing the Hamming Distance and Filtering synchronously...',curCookieClientId)

  var lastSignificantMementoIndexBasedOnHamming = 0
  var copyOfMementos = [this.mementos[0]]

  //ConsoleLogIfRequired('Calculate hamming distance of ' + this.mementos.length + ' mementos')
  for (var m = 0; m < this.mementos.length; m++) {
    // ConsoleLogIfRequired("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
    // ConsoleLogIfRequired("...with SimHash: "+this.mementos[m].simhash)
    if (m > 0) {
      if ( this.mementos[m].simhash == null || (this.mementos[m].simhash.match(/0/g) || []).length === 32) { // added the null condition if the simhash is set to null because of error in connection
        ConsoleLogIfRequired('0s, returning')
        continue
      }
      // ConsoleLogIfRequired("Calculating hamming distance")
      this.mementos[m].hammingDistance = getHamming(this.mementos[m].simhash, this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash)
      // ConsoleLogIfRequired("Getting hamming basis")
      this.mementos[m].hammingBasis = this.mementos[lastSignificantMementoIndexBasedOnHamming].datetime
      this.mementos[m].hammingBasisURI= this.mementos[lastSignificantMementoIndexBasedOnHamming].uri

      // ConsoleLogIfRequired('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
      //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
      //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

      if (this.mementos[m].hammingDistance >=  this.hammingdistancethreshold) { // Filter the mementos if hamming distance is too small
        lastSignificantMementoIndexBasedOnHamming = m

         copyOfMementos.push(this.mementos[m]) // Only push mementos that pass threshold requirements
      }

      // ConsoleLogIfRequired(t.mementos[m].uri+" hammed!")
    } else if (m === 0) {
      ConsoleLogIfRequired('m==0, continuing')
    }
  }
  noOfUniqueMementos = copyOfMementos.length
  totalMementos = this.mementos.length;
  constructSSE('Completed filtering...',curCookieClientId)
  constructSSE('Out of the total <h3>'+totalMementos+'</h3> eixisting mementos, <h3>'+noOfUniqueMementos +'</h3> mementos are considered to be unique...',curCookieClientId)
  //ConsoleLogIfRequired((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
  copyOfMementos = null

  ConsoleLogIfRequired("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------")
  ConsoleLogIfRequired(JSON.stringify(this.mementos))
  //ConsoleLogIfRequired(this.mementos)
  ConsoleLogIfRequired("----------------------------------------------------------------------------------------------------------------------------------------------")
  if (callback) { callback('') }
}




TimeMap.prototype.calculateHammingDistancesWithOnlineFiltering = function (curCookieClientId,callback) {
  console.time('Hamming And Filtering, a synchronous operation')
  constructSSE('computing the Hamming Distance and Filtering synchronously...',curCookieClientId)
  var curMementoDetArray = [];
  var hdtRangeVar = 0;
  for(var i=2; i<= 12; i++ ){ // do the computation fot the threshold from k =3 to k=12
      hdtRangeVar = i;
      curMementoDetArray = [];
      curMementoDetArray =  JSON.parse(JSON.stringify(this.mementos))
      var lastSignificantMementoIndexBasedOnHamming = 0
      var copyOfMementos = [this.mementos[0]]

      //ConsoleLogIfRequired('Calculate hamming distance of ' + this.mementos.length + ' mementos')
      for (var m = 0; m < curMementoDetArray.length; m++) {
          // ConsoleLogIfRequired("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
          // ConsoleLogIfRequired("...with SimHash: "+this.mementos[m].simhash)
          if (m > 0) {
            if ( curMementoDetArray[m].simhash == null || (curMementoDetArray[m].simhash.match(/0/g) || []).length === 32) { // added the null condition if the simhash is set to null because of error in connection
              ConsoleLogIfRequired('0s, returning')
              continue
            }
            // ConsoleLogIfRequired("Calculating hamming distance")
            curMementoDetArray[m].hammingDistance = getHamming(curMementoDetArray[m].simhash, curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].simhash)
            // ConsoleLogIfRequired("Getting hamming basis")
            curMementoDetArray[m].hammingBasis = curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].datetime
            curMementoDetArray[m].hammingBasisURI= curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].uri

            // ConsoleLogIfRequired('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
            //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
            //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

            if (curMementoDetArray[m].hammingDistance >= hdtRangeVar) { // Filter the mementos if hamming distance is too small
              lastSignificantMementoIndexBasedOnHamming = m

               copyOfMementos.push(curMementoDetArray[m]) // Only push mementos that pass threshold requirements
            }

            // ConsoleLogIfRequired(t.mementos[m].uri+" hammed!")
          } else if (m === 0) {
            ConsoleLogIfRequired('m==0, continuing')
          }
      }
      noOfUniqueMementos = copyOfMementos.length
      totalMementos = curMementoDetArray.length;
      constructSSE('Completed filtering...',curCookieClientId)
      constructSSE('Out of the total <h3>'+totalMementos+'</h3> eixisting mementos, <h3>'+noOfUniqueMementos +'</h3> mementos are considered to be unique for hamming distance:'+ this.hammingdistancethreshold +' ...',curCookieClientId)
      //ConsoleLogIfRequired((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
      copyOfMementos = null

      if(noOfUniqueMementos >= 1){ // have to change it to minimum threshold based on the feedback from meeting
        if( !this.menentoDetForMultipleKValues.has(hdtRangeVar)){
            this.menentoDetForMultipleKValues.set(hdtRangeVar,curMementoDetArray)
        }
        if( !this.statsHashMapObj.has(hdtRangeVar)){

            var curStatObj = {};
            curStatObj["threshold"] = hdtRangeVar;
            curStatObj["totalmementos"] = totalMementos;
            curStatObj["unique"] = noOfUniqueMementos;
            this.statsHashMapObj.set(hdtRangeVar,curStatObj)

        }
      }
      if(noOfUniqueMementos <= 1){
        break;
      }

  }


  this.mementos =  JSON.parse(JSON.stringify(this.menentoDetForMultipleKValues.get(this.hammingdistancethreshold))) // to get the Memento object corresponsing to actual hdt sent

  ConsoleLogIfRequired("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------")
  ConsoleLogIfRequired("--------------------------------------For threshold value 2------------------------------------------------")
  ConsoleLogIfRequired(JSON.stringify(this.menentoDetForMultipleKValues.get(2)))
  ConsoleLogIfRequired("=================================================")
  ConsoleLogIfRequired(JSON.stringify(this.statsHashMapObj.get(2)))
  ConsoleLogIfRequired("=================================================")


  ConsoleLogIfRequired("--------------------------------------For threshold value 5------------------------------------------------")

  ConsoleLogIfRequired(JSON.stringify(this.menentoDetForMultipleKValues.get(5)))
  ConsoleLogIfRequired("=================================================")
  ConsoleLogIfRequired(JSON.stringify(this.statsHashMapObj.get(5)))
  ConsoleLogIfRequired("=================================================")

  //ConsoleLogIfRequired(this.mementos)
  ConsoleLogIfRequired("--------------------------------------End of calculateHammingDistancesWithOnlineFiltering ------------------------------------------------")
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
      response.writeHead(500, headers)
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

function getNotExistingCapturesCount(selectedMementosList){
   //console.log("------------------------inside getExistingCapturesCount ---------------")
    // console.log(selectedMementosList)
  var count = 0 ;
  selectedMementosList.forEach(function (memento,m) {
  //  console.log(__dirname + '/'+screenshotsLocation + memento.screenshotURI);
    if (!fs.existsSync(__dirname + '/'+screenshotsLocation + memento.screenshotURI)){
        count ++;
    }
  })
//  console.log("------------------------inside getExistingCapturesCount ---------------")

  return count;
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


process.on('unhandledRejection', (reason, p) => {
  ConsoleLogIfRequired('Unhandled Rejection at: Promise');
  responseDup.end();
});

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

function prependWithIDHelper(regExpForDTStr, uri){
  var matchedString = uri.match(regExpForDTStr)
  if(matchedString != null){
    uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))) // by default only the first occurance is replaced
  }
  return uri;
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
