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

var http = require('follow-redirects/http');
var express = require('express');
var url = require('url');
//var connect = require('connect');
//var serveStatic = require('serve-static');
// var Step = require('step');
var async = require('async');
// var Futures = require('futures');
var Promise = require('es6-promise').Promise;
var Async = require('async');
var simhash = require('simhash')('md5');
//var moment = require('moment');

//var ProgressBar = require('progress');
//var phantom = require('node-phantom');
var phantom = null;
var fs = require('fs');
var mdr = require('mkdir-recursive');
var path = require('path');
var validator = require('validator');
//var underscore = require('underscore');

//var webshot = require('webshot'); // PhantomJS wrapper
var webshot = null;
var argv = require('minimist')(process.argv.slice(2));

var mementoFramework = require('./lib/mementoFramework.js');
var Memento = mementoFramework.Memento;
var TimeMap = mementoFramework.TimeMap;
var SimhashCacheFile = require('./lib/simhashCache.js').SimhashCacheFile;

var colors = require('colors');
var im = require('imagemagick');
var rimraf = require('rimraf');
const puppeteer = require('puppeteer');
var HashMap = require('hashmap');
var cookieParser = require("cookie-parser");
var normalizeUrl = require("normalize-url");

var zlib = require('zlib');
var app = express();
var morgan  = require('morgan');
var host = argv.host ? argv.host : 'localhost'; // Format: scheme://hostname
var port = argv.port ? argv.port : '3000';
var proxy = argv.proxy ? argv.proxy.replace(/\/+$/, '') : ('http://' + host + (port == '80' ? '' : ':' + port));
var localAssetServer = proxy + '/static/';
var isResponseEnded = false;
var isDebugMode = argv.debug? argv.debug: false;
var SCREENSHOT_DELTA = argv.ssd? argv.ssd: 2;
var isToOverrideCachedSimHash = argv.oes? argv.oes: false;
var isToComputeBoth = argv.os? false: true; // By default computes both simhash and hamming distance
var screenshotsLocation = "assets/screenshots/";
var streamingRes = null;
var streamedHashMapObj = new HashMap();
var responseDup = null;
var Stack = require('stackjs');

var mementosFromMultipleURIs = [];
var archivedMementos = [];
var maxMementos = argv.maxMementos? argv.maxMementos: 1000;
//var fullTimemap = new TimeMap(); 
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
                        '*******************************').blue);
    ConsoleLogIfRequired("--By Mahee - for understanding");
    // setting up the folder required
    if (!fs.existsSync(__dirname+"/assets/screenshots")) {
        //fs.mkdirSync(__dirname+"/assets/screenshots");
        mdr.mkdirSync(__dirname+"/assets/screenshots");
    }

    if (!fs.existsSync(__dirname+"/cache")) {
        fs.mkdirSync(__dirname+"/cache");
    }

    if (!fs.existsSync(__dirname+"/logs")) {
        fs.mkdirSync(__dirname+"/logs");
    }


    //startLocalAssetServer()  //- Now everything is made to be served from the same port.
    var endpoint = new PublicEndpoint();

    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs' ,'access.log'), {flags: 'a'});
    var exceptionLogStream = fs.createWriteStream(path.join(__dirname, 'logs' ,'exception.log'), {flags: 'a'});

    app.use(cookieParser());

    // set a cookie
    app.use(function (request, response, next) {
    if(request._parsedUrl.pathname.indexOf("alsummarizedview") > 0 ) {
        response.cookie('clientId',Date.now().toString());
    }
    next();
    });

    app.enable('trust proxy');
    
    // all the common  requests are logged via here
    app.use(morgan('common',{
        skip: function (req, res) {
            if(req._parsedUrl.pathname.indexOf("notifications") > 0) {
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



    app.use('/static', express.static(path.join(__dirname, 'assets/screenshots')));

    //app.get(['/','/index.html','/alsummarizedview/:primesource/:ci/:hdt/:role/*'], (request, response) => {
    app.get(['/','/index.html','/alsummarizedview/:primesource/:ci/:hdt/histogram/*','/index.html','/alsummarizedview/:primesource/:ci/:hdt/stats/*','/alsummarizedview/:primesource/:ci/:hdt/summary/*'  ], (request, response) => {
        response.sendFile(__dirname + '/public/index.html');
    });


    //This is just a hello test route
    app.get('/hello', (request, response) => {

        var headers = {}
        // IE8 does not allow domains to be specified, just the *
        // headers['Access-Control-Allow-Origin'] = req.headers.origin
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET';
        headers['Access-Control-Allow-Credentials'] = false;
        headers['Access-Control-Max-Age'] = '86400';  // 24 hours
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime';
        headers['Content-Type'] = 'text/html'; // text/html
        var query = url.parse(request.url, true).query;
        console.log(JSON.stringify(query));
        response.writeHead(200, headers);
        response.write('Hello from what ever!');
        response.end();
    });

    //For individual memento refresh
    app.get('/refreshscreenshot', (request, response) => {
        refreshMemento(request, response);
    });

    //that a work around to clear the streaming realted cache
    app.get('/clearstreamhash', (request, response) => {
        var headers = {}
        // IE8 does not allow domains to be specified, just the *
        // headers['Access-Control-Allow-Origin'] = req.headers.origin
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET';
        headers['Access-Control-Allow-Credentials'] = false;
        headers['Access-Control-Max-Age'] = '86400' ; // 24 hours
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime';
        headers['Content-Type'] = 'text/html' ;// text/html
        var query = url.parse(request.url, true).query;
        console.log(JSON.stringify(query));
        streamedHashMapObj.clear();
        response.writeHead(200, headers);
        response.write('cleared the streaming hash');
        response.end();
    });



    //This route is just for testing, testing the SSE
    app.get('/notifications/:curUniqueUserSessionID', (request, response) => {
        sendSSE(request, response);
    })



    // this is the actually place that hit the main server logic
    //app.get('/alsummarizedtimemap/:primesource/:ci/:urir', endpoint.respondToClient)

    app.get('/alsummarizedtimemap/:primesource/:ci/:hdt/:role/:from/:to/*', endpoint.respondToClient);


    app.listen(port, '0.0.0.0', (err) => {
        if (err) {
            return console.log('something bad happened', err);
        }
        console.log(`server is listening on ${port}`);
    });


}

/**
* Handles request to retake the given screenshot
*
* @param request - http request that consists of parameters, query string, http headers and so on
* @param response - http response sent after a request is acquired and evaluated
*/
function refreshMemento(request, response) {
    var headers = {}
    // IE8 does not allow domains to be specified, just the *
    // headers['Access-Control-Allow-Origin'] = req.headers.origin
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET';
    headers['Access-Control-Allow-Credentials'] = false;
    headers['Access-Control-Max-Age'] = '86400';  // 24 hours
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime';
    headers['Content-Type'] = 'text/html'; // text/html

    var curCookieClientId = request.headers["x-my-curuniqueusersessionid"];
    var mementoURI = request.query.link;
    var file = request.query.img;
    file = file.split("static/")[1];

    var memento = {screenshotURI: file, uri: mementoURI};

    console.log("File: "+file);
    console.log("URI: "+mementoURI);

    try{
        fs.unlink(screenshotsLocation+file,function() {}); //deleting old screenshot
        var tempTimemap = new TimeMap();

        async.series([
            function(callback) {
                tempTimemap.createScreenshotForMementoWithPuppeteer(curCookieClientId,memento,response,true,callback); // take new screenshot
            },
            function(callback) {
                response.writeHead(200, headers);
                response.end();
                callback();
            }], 
            function(err) {
                if(err) {
                    console.log("Error: "+err);
                    response.writeHead(405,headers);
                    response.end();
                }
            }
        );
    } catch(e) {
        response.writeHead(405,headers);
    }
}


// SSE Related.
function sendSSE(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });


    if( !streamedHashMapObj.has(req.params.curUniqueUserSessionID)) {
        streamedHashMapObj.set(req.params.curUniqueUserSessionID,res);
    }

}
/**
* Constructs a server-sent event
*
* @param request  The request object from the client representing query information
* @param response Currently active HTTP response to the client used to return information to the client based on the request
*/
function constructSSE(data,clientIdInCookie) {
    var id = Date.now();
    var streamObj = {};
    var curResponseObj= null;
    streamObj.data= data;
    if(clientIdInCookie != undefined && clientIdInCookie != null) {
        streamObj.usid = clientIdInCookie;
    } else {
        streamObj.usid = 100;
    }
    console.log("clientIdInCookie --->"+clientIdInCookie);
    console.log("streamedHashMapObj keys --->"+streamedHashMapObj.keys().toString());
    console.log("count --->"+ streamedHashMapObj.count());
    curResponseObj=streamedHashMapObj.get(clientIdInCookie);
    if(curResponseObj != null) {
        console.log("From retrieved Response Obj -->"+curResponseObj);
        curResponseObj.write('id: ' + id + '\n');
        curResponseObj.write("data: " + JSON.stringify(streamObj) + '\n\n');
        if(data === "readyToDisplay" || data === "statssent" ) {
            streamedHashMapObj.delete(clientIdInCookie);
        }
    }
}


function doesBelongInCollection(yearsArry,memento) {
    var dateTimeStr = memento["datetime"];
    var curMemYear = new Date(dateTimeStr).getFullYear();
    if(yearsArry.indexOf(curMemYear) != -1) {
        return true;
    }
    return false;
}


/**
* Setup the public-facing attributes of the service
*/
function PublicEndpoint() {
    var theEndPoint = this;
    // Parameters supplied for means of access:
    this.validSource = ['archiveit', 'internetarchive', 'arquivopt'];

    this.isAValidSourceParameter = function (accessParameter) {
        return theEndPoint.validSource.indexOf(accessParameter) > -1;
    }

    /**
    * Handle an HTTP request and respond appropriately
    * @param request  The request object from the client representing query information
    * @param response Currently active HTTP response to the client used to return information to the client based on the request
    */
    this.respondToClient = function (request, response) {
        ConsoleLogIfRequired("#################### Response header ##########");
        ConsoleLogIfRequired(request.headers["x-my-curuniqueusersessionid"]);
        ConsoleLogIfRequired("############################################");

        responseDup = response;
        ConsoleLogIfRequired("Cookies------------------>"+request.headers["x-my-curuniqueusersessionid"]);
        constructSSE("streamingStarted",request.headers["x-my-curuniqueusersessionid"]);
        constructSSE("percentagedone-3",request.headers["x-my-curuniqueusersessionid"]);

        isResponseEnded = false; //resetting the responseEnded indicator
        //response.clientId = Math.random() * 101 | 0  // Associate a simple random integer to the user for logging (this is not scalable with the implemented method)
        response.clientId = request.headers["x-my-curuniqueusersessionid"];
        var headers = {}

        // IE8 does not allow domains to be specified, just the *
        // headers['Access-Control-Allow-Origin'] = req.headers.origin
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET';
        headers['Access-Control-Allow-Credentials'] = false;
        headers['Access-Control-Max-Age'] = '86400';  // 24 hours
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Datetime';

        if (request.method !== 'GET') {
            console.log('Bad method ' + request.method + ' sent from client. Try HTTP GET');
            response.writeHead(405, headers);
            response.end();
            return;
        }

        //  var response ={}
        var URIRFromCLI = "";

        //var query = url.parse(request.url, true).query

        console.log(request.params);
        var query ={};
        query['urir'] = request.params["0"] + (request._parsedUrl.search != null ? request._parsedUrl.search : '');
        console.log(query['urir']);
        query['ci']= request.params.ci;
        query['primesource']= request.params.primesource;
        query['hdt']= request.params.hdt;
        // for the intermediate step of involving user to decide the value of k
        query['role']= request.params.role;
        console.log(query['role']);
        /*
        if(query['role'].length > 9) {// if date range was passed with role
            query['from'] = query['role'].substring(7,17); // extract from date
            query['to'] = query['role'].substring(17,27); // extract to date
            query['role'] = query['role'].substring(0,7); // set role back to summary
        } else {
            query['from'] = 0 // extract from date
            query['to'] = 0
        }*/
        if(request.params.from != '0') {
            query['from'] = request.params.from;
            query['to'] = request.params.to;
        } else {
            query['from'] = 0;
            query['to'] = 0;
        }

        query['ssd']=request.params.ssd;

        ConsoleLogIfRequired("--- ByMahee: Query URL from client = "+ JSON.stringify(query));

        /******************************
            IMAGE PARAMETER - allows binary image data to be returned from service
        **************************** */
        if (query.img) {
            // Return image data here
            var fileExtension = query.img.substr('-3'); // Is this correct to use a string and not an int!?
            ConsoleLogIfRequired('fetching ' + query.img + ' content');
            var img = fs.readFileSync(__dirname + '/' + query.img);
            ConsoleLogIfRequired("200, {'Content-Type': 'image/'" + fileExtension +'}');
            return;
        }

        /******************************
            URIR PARAMETER - required if not img, supplies basis for archive query
        **************************** */

        function isARESTStyleURI (uri) {
            return (uri.substr(0, 5) === '/http');
        }

        if (!query['urir'] && // a urir was not passed via the query string...
        request._parsedUrl && !isARESTStyleURI(request._parsedUrl.pathname.substr(0, 5))) { // ...or the REST-style specification
            response.writeHead(400, headers);
            response.write('No urir Sent with the request');
            response.end();
            return;
        } else if (request._parsedUrl && !query['urir']) {
            // Populate query['urir'] with REST-style URI and proceed like nothing happened
            query['urir'] = request._parsedUrl.pathname.substr(1);
        } else if (query['urir']) { // urir is specied as a query parameter
            console.log('urir valid, using query parameter.');
        }

        // Override the default access parameter if the user has supplied a value
        //  via query parameters
        if (query.primesource) {
            query.primesource = query.primesource.toLowerCase();
        }
        if (isNaN(query.hdt)) {
            query.hdt = 4 ;// setting to default hamming distance threshold
        } else {
            query.hdt = parseInt(query.hdt);
        }

        if(query.role === "stats") {
        } else if(query.role === "summary") {
        } else if(query.role === "histogram") {
        } else {
            query.role = "histogram";
        }

        if (isNaN(query.ssd)) {
            SCREENSHOT_DELTA = 2; // setting to default screenshot delay time
        } else {
            SCREENSHOT_DELTA = parseInt(query.ssd);
        }

        if (!theEndPoint.isAValidSourceParameter(query.primesource)) { // A bad access parameter was passed in
            console.log('Bad source query parameter: ' + query.primesource);
            response.writeHead(501, headers);
            response.write('The source parameter was incorrect. Try one of ' + theEndPoint.validSource.join(',') + ' or omit it entirely from the query string\r\n');
            response.end();
            return;
        }

        headers['X-Means-Of-Source'] = query.primesource;

        var strategy = "alSummarization";
        headers['X-Summarization-Strategy'] = strategy;

        var URIs = query['urir'].split(",");

        if(URIs.length == 0)
            URIs = [query.urir];

        for (var i = 0; i < URIs.length; i++) {
            if (!URIs[i].match(/^[a-zA-Z]+:\/\//)) {
                URIs[i] = 'http://' + URIs[i];
            }// Prepend scheme if missing
        }

        headers['Content-Type'] = 'application/json';//'text/html'
        response.writeHead(200, headers);

        ConsoleLogIfRequired('New client request urir: ' + query['urir'] + '\r\n> Primesource: ' + query.primesource + '\r\n> Strategy: ' + strategy);

        for (var i = 0; i < URIs.length; i++) {
            if (!validator.isURL(URIs[i])) { // Return "invalid URL"
                console.log(query['urir']);
                consoleLogJSONError('Invalid URI');
                //response.writeHead(200, headers);
                response.write('Invalid urir \r\n');
                response.end();
                return;
            }
        }

        function consoleLogJSONError (str) {
            ConsoleLogIfRequired('{"Error": "' + str + '"}');
        }


        if ( isNaN(query.ci)) {
            query.ci = 'all';
        } else {
            query.ci = parseInt(query.ci);
        }
        // ByMahee -- setting the  incoming data from request into response Object
        response.thumbnails = []; // Carry the original query parameters over to the eventual response
        response.thumbnails['primesource'] = query.primesource;
        response.thumbnails['strategy'] = strategy;
        response.thumbnails['collectionidentifier'] = query.ci;
        response.thumbnails['hammingdistancethreshold'] = query.hdt;
        response.thumbnails['role'] = query.role;
        response.thumbnails['urir'] = query.urir;
        if(query['from'] != 0) {// if a from date was given
            response.thumbnails['from'] = query['from'];
            response.thumbnails['to'] = query['to'];
        } else {
            response.thumbnails['from'] = 0;
            response.thumbnails['to'] = 0;
        }

        /*TODO: include consideration for strategy parameter supplied here
                If we consider the strategy, we can simply use the TimeMap instead of the cache file
                Either way, the 'response' should be passed to the function representing the chosen strategy
                so the function still can return HTML to the client
        */
        var t = new TimeMap();

        t.originalURI = query.urir;
        t.primesource = query.primesource;
        t.collectionidentifier = query.ci;
        t.hammingdistancethreshold = query.hdt;
        t.role = query.role;

        //for(var i in URIs)
            //URIs[i] = urlCanonicalize(URIs[i]);

        // If more than 1 URI was passed at once, check if each individual URI has been cached.
        // If not, cache it. Then merge the timemaps of each URI for the user.
        if(URIs.length > 1) {
            mementosFromMultipleURIs = [];
            processMultipleURIs(t, query, response, request.headers["x-my-curuniqueusersessionid"]);
        } else {
            // TODO: optimize this out of the conditional so the functions needed for each strategy are self-contained (and possibly OOP-ified)
            if (strategy === 'alSummarization') {
                var originalURI = urlCanonicalize(query['urir']);
                var histogramFile = new SimhashCacheFile(query.primesource+"_"+query.ci+"_"+originalURI,isDebugMode);
                histogramFile.path = histogramFile.path.replace("simhashes","histogram");
                histogramFile.path += ".json";
                archivedMementos = JSON.parse(histogramFile.readFileContentsSync());

                var cacheFile = new SimhashCacheFile( query.primesource+"_"+query.ci+"_"+originalURI,isDebugMode);
                cacheFile.path += '.json';
                ConsoleLogIfRequired('Checking if a cache file exists for ' + query['urir'] + '...');
                constructSSE('Checking if a cache file exists for ' + query['urir'] + '...',request.headers["x-my-curuniqueusersessionid"]);
                constructSSE("percentagedone-10",request.headers["x-my-curuniqueusersessionid"]);

                //  ConsoleLogIfRequired('cacheFile: '+JSON.stringify(cacheFile))
                cacheFile.readFileContents(
                    function success (data) {
                    // A cache file has been previously generated using the alSummarization strategy

                        // ByMahee -- ToDo: We can even add a prompt from user asking whether he would want to recompute hashes here
                        ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Success ReadFile Content, processWithFileContents is called next ");

                        if(isToOverrideCachedSimHash) {
                            ConsoleLogIfRequired("Responded to compute latest simhahes, Proceeding...");
                            getTimemapGodFunctionForAlSummarization(query['urir'], response,request.headers["x-my-curuniqueusersessionid"]);
                        } else if(t.role == "histogram") {
                            ConsoleLogIfRequired("Responded to grab latest set of mementos");
                            getTimemapGodFunctionForAlSummarization(query['urir'], response,request.headers["x-my-curuniqueusersessionid"]);
                        } else {
                            ConsoleLogIfRequired("Responded to continue with the exisitng cached simhashes file. Proceeding..");
                            constructSSE('cached simhashes exist, proceeding with cache...',request.headers["x-my-curuniqueusersessionid"]);
                            constructSSE("percentagedone-15",request.headers["x-my-curuniqueusersessionid"]);

                            processWithFileContents(query['urir'], data, response,request.headers["x-my-curuniqueusersessionid"]);
                        }
                    },
                    function failed () {
                        //ByMahee -- calling the core function responsible for AlSummarization, if the cached file doesn't exist
                        ConsoleLogIfRequired("**ByMahee** -- readFileContents : Inside Failed ReadFile Content (meaning file doesn't exist), getTimemapGodFunctionForAlSummarization is called next ");
                        constructSSE("cached simhashes doesn't exist, proceeding to compute the simhashes...",request.headers["x-my-curuniqueusersessionid"]);

                        getTimemapGodFunctionForAlSummarization(query['urir'], response,request.headers["x-my-curuniqueusersessionid"]);
                    }
                );
            }
        }
    }
}


/**
* Delete all derived data including caching and screenshot - namely for testing
* @param cb Callback to execute upon completion
*/
function cleanSystemData (cb) {
    // Delete all files in ./screenshots/ and ./cache/
    var dirs = ['assets/screenshots', 'assets/cache'];
    dirs.forEach(function (e, i) {
        rimraf(__dirname + '/' + e + '/*', function (err) {
            if (err) {
                throw err;
            }
            ConsoleLogIfRequired('Deleted contents of ./' + e + '/');
        });

        ConsoleLogIfRequired(e);
    });

    if (cb) {
        cb();
    }
}

/**
* When the user enters multiple URIs, each individual URI is checked to see if cached.
* After caching the appropriate URIs the timemaps are then combined and processed.
*
* @param t - The passed timemap object
*/
function processMultipleURIs(t, query, response, curCookieClientId) {
    var uriList =  query['urir'].split(',');

    async.series([
        function(callback) {
            checkIfCachedForMultipleURIs(uriList, query, response, curCookieClientId, callback);
        },
        function(callback) {
            t.mementos = t.mementos.concat(mementosFromMultipleURIs);
            if(response.thumbnails['from'] != 0) {
                t.filterMementosForDateRange(response, callback);
            } else
                callback('');
        },
        function(callback) {
            if(t.mementos.length > maxMementos && t.role != "histogram") {
                t.filterMementos(response, curCookieClientId, callback);
            } else
                callback('');
        },
        function (callback) {
            if(t.role == "stats") {
                t.calculateHammingDistancesWithOnlineFiltering(curCookieClientId,callback);
            } else if(t.role == "histogram") {
                callback('');
            } else {
                t.calculateHammingDistancesWithOnlineFilteringForSummary(curCookieClientId,callback);
            }
            constructSSE("percentagedone-5",curCookieClientId);
        },
        function (callback) {
            if(t.role == "stats") {
                t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);
            } else if(t.role == "histogram") {
                callback('');
            } else {
                t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary(callback);
            }
            constructSSE("percentagedone-15",curCookieClientId);
        },
        function (callback) {
            ConsoleLogIfRequired('****************curCookieClientId from processWithFileContents ->'+curCookieClientId +' *********');
            constructSSE("percentagedone-20",curCookieClientId);
            if (t.role == "histogram") {
                t.getDatesForHistogram(callback,response,curCookieClientId, null);
            } else {
                t.createScreenshotsForMementos(curCookieClientId,response,callback);
            }
        },
        function (callback) {
            constructSSE('Writing the data into cache file for future use...',curCookieClientId);
            constructSSE("percentagedone-95",curCookieClientId);
            if (t.role == "histogram") {
                callback('');
            } else {
                t.writeThumbSumJSONOPToCache(response);
            }
        }], 
        function(err) { 
            if(err) {
                console.log(err);
            }
        }
    );
}

/**
* Checks if each of the given URIs have been cached.
* If a URI has not been cached, the timemap is fetched and cached.
* Else, the cache file is read.
*
* @param uriList - The list of user input URIs
* @param response handler to client's browser interface
*/
function checkIfCachedForMultipleURIs(uriList, query, response, curCookieClientId, callback) {
    async.eachLimit(uriList, 1, function(uri, callback) {
        var originalURI = urlCanonicalize(uri);
        var cacheFile = new SimhashCacheFile(query.primesource+"_"+query.ci+"_"+originalURI,isDebugMode);
        cacheFile.path += ".json";
        if (!(fs.existsSync(cacheFile.path)) || query['role'] == "histogram") {
            getTimemapForMultipleURIs(uri, query, response, curCookieClientId, callback);
        } else {
            var histogramFile = new SimhashCacheFile(query.primesource+"_"+query.ci+"_"+originalURI,isDebugMode);
            histogramFile.path = histogramFile.path.replace("simhashes","histogram");
            histogramFile.path += ".json";
            archivedMementos = JSON.parse(histogramFile.readFileContentsSync());

            var data = fs.readFileSync(cacheFile.path, 'utf-8');
            var curTimeMap = createMementosFromJSONFile(data);
            curTimeMap.originalURI = originalURI;
            curTimeMap.primesource = query.primesource;
            curTimeMap.collectionidentifier = query.ci;
            curTimeMap.hammingdistancethreshold = query.hdt;
            curTimeMap.role = query.role;

            async.series([
                function(callback) {
                    if(response.thumbnails['from'] != 0) {
                        curTimeMap.filterMementosForDateRange(response, callback);
                    } else
                        callback('');
                },
                function (callback) {
                    var histogramFile = new SimhashCacheFile(response.thumbnails["primesource"]+"_"+response.thumbnails["collectionidentifier"]+"_"+urlCanonicalize(uri),isDebugMode);
                    histogramFile.path = histogramFile.path.replace("simhashes","histogram");
                    histogramFile.path += ".json";
                    archivedMementos = JSON.parse(histogramFile.readFileContentsSync());
                    curTimeMap.matchMementosToArchive(originalURI, response, curCookieClientId, data, callback);
                },
                function (callback) {
                    curTimeMap.getDatesForHistogram(callback,response,curCookieClientId, true);
                }
            ],
                function(err){
                    if(err) {
                        console.log(err);
                        return;
                    }
                    mementosFromMultipleURIs = mementosFromMultipleURIs.concat(curTimeMap.mementos);
                    callback();
                }
            );
        }},
        function(err) {
            if(err) {
                console.log(err);
                return;
            }
            if(callback) {
                callback();
            }
        }
    );
}

/**
* Caches the timemap for the provided URI and appends the mementos to mementosFromMultipleURIs.
* Else, the cache file is read.
*
* @param uri - The URI of the timemap to be cached
* @param response - Handler to client's browser interface
* @param update - If true, the cache file for the URI has less mementos than requested by the user
* and needs updated.
*/
function getTimemapForMultipleURIs (uri, query, response, curCookieClientId, callback) {

    var t = new TimeMap();
    var retStr = '';
    var metadata = '';

    ConsoleLogIfRequired('Starting many asynchronous operationsX...');

    async.series([
        function(callback) {
            t.fetchTimemap(uri, response, curCookieClientId, callback);
        },
        function(callback) {
            if(response.thumbnails['from'] != 0 && t.mementos.length != 0) {
                t.filterMementosForDateRange(response, callback);
            } else
                callback('');
        },
        function (callback) {
            if ((t.hammingdistancethreshold == '0' && t.role == "summary") || t.mementos.length == 0 || t.role == "histogram") {
                callback('');
            } else {
                t.calculateSimhashes(curCookieClientId,response,callback);
            }
        },
        function (callback) {
            constructSSE("percentagedone-30",curCookieClientId);
            if (t.role == "histogram" || (t.hammingdistancethreshold == '0' && t.role == "summary") || t.mementos.length == 0) {
                callback('');
            } else {
                t.saveSimhashesToCache(callback); 
            }
        },
        function (callback) {
            if(t.hammingdistancethreshold == '0' && t.role == "summary" && t.mementos.length != 0) {
                t.supplyAllMementosAScreenshotURI(callback);
            }else if(t.role == "histogram") {
                t.getDatesForHistogram(callback,response,curCookieClientId,true);
            } else if (t.mementos.length != 0) {
                t.writeJSONToCache(callback);
            } else {
                callback('');
            }
        }],
        function (err, result) {
            if (err) {
                ConsoleLogIfRequired('ERROR!');
                ConsoleLogIfRequired(err);
            } else {
                ConsoleLogIfRequired('There were no errors executing the callback chain');
                if(t.mementos.length != 0) {
                    mementosFromMultipleURIs = mementosFromMultipleURIs.concat(t.mementos);
                }
                callback();
            }
        }
    );
}

/**
* Display thumbnail interface based on passed in JSON
* @param fileContents JSON string consistenting of an array of mementos
* @param response handler to client's browser interface
*/
function processWithFileContents (uri, fileContents, response, curCookieClientId) {
    var histogramFile = new SimhashCacheFile(response.thumbnails["primesource"]+"_"+response.thumbnails["collectionidentifier"]+"_"+urlCanonicalize(uri),isDebugMode);
    histogramFile.path = histogramFile.path.replace("simhashes","histogram");
    histogramFile.path += ".json";
    archivedMementos = JSON.parse(histogramFile.readFileContentsSync());

    var t = createMementosFromJSONFile(fileContents);
    t.curClientId = curCookieClientId;
    t.originalURI = urlCanonicalize(response.thumbnails['urir']);
    t.primesource = response.thumbnails['primesource'];
    t.collectionidentifier = response.thumbnails['collectionidentifier'];
    t.hammingdistancethreshold = response.thumbnails['hammingdistancethreshold'];
    t.role = response.thumbnails['role'];
    /* ByMahee -- unnessessary for the current need
    t.printMementoInformation(response, null, false) */

    if(t.mementos.simhash === 'undefined') {
        getTimemapGodFunctionForAlSummarization(uri, response,curCookieClientId);
    } else {
        ConsoleLogIfRequired("Existing file contents are as follows:");
        ConsoleLogIfRequired("**************************************************************************************************");
        console.log(JSON.stringify(t));
        if(isToComputeBoth) {
            constructSSE('streamingStarted',curCookieClientId);
            async.series([
                function (callback) {
                    if(response.thumbnails['from'] != 0) {
                        t.filterMementosForDateRange(response, callback);
                    } else {
                        callback('');
                    }
                },
                function (callback) {
                    if(t.mementos.length > maxMementos && t.role != "histogram") {
                        t.filterMementos(response, curCookieClientId, callback)
                    } else
                        callback('');
                },
                function (callback) {
                    t.matchMementosToArchive(uri, response, curCookieClientId, fileContents, callback);
                },
                function (callback) {
                    if(t.role == "stats") {
                        t.calculateHammingDistancesWithOnlineFiltering(curCookieClientId,callback);
                    } else if(t.role == "histogram") {
                        callback('');
                    }else{
                        t.calculateHammingDistancesWithOnlineFilteringForSummary(curCookieClientId,callback);
                    }
                    constructSSE("percentagedone-5",curCookieClientId);
                },
                function (callback) {
                    if(t.role == "stats") {
                      t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);
                    } else if(t.role == "histogram") {
                      callback('');
                    } else {
                      t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary(callback);
                    }
                    constructSSE("percentagedone-15",curCookieClientId);
                },
                function (callback) {
                    ConsoleLogIfRequired('****************curCookieClientId from processWithFileContents ->'+curCookieClientId +' *********');
                    constructSSE("percentagedone-20",curCookieClientId);
                    if (t.role == "histogram") {
                        t.getDatesForHistogram(callback,response,curCookieClientId, false);
                    } else {
                        t.createScreenshotsForMementos(curCookieClientId,response,callback);
                    }
                },
                function (callback) {
                    constructSSE('Writing the data into cache file for future use...',curCookieClientId);
                    constructSSE("percentagedone-95",curCookieClientId);
                    if (t.role == "histogram") {
                        callback('');
                    } else {
                        t.writeThumbSumJSONOPToCache(response);
                    }
                }],
                function (err, result) {
                    if (err) {
                        console.log('ERROR!');
                        console.log(err);
                    } else {
                        constructSSE('Finshed writing into cache...',curCookieClientId);
                        constructSSE("percentagedone-100",curCookieClientId);
                        console.log('There were no errors executing the callback chain');
                    }
                }
            );
        }
    }
}

/**
* Convert a string from the JSON cache file to Memento objects
* @param fileContents JSON string consistenting of an array of mementos
*/
function createMementosFromJSONFile (fileContents) {
    var t = new TimeMap();
    t.mementos = JSON.parse(fileContents);
    return t;
}

/**
* String representation of a timemap object
*/
TimeMap.prototype.toString = function () {
    return '{' +
        '"timemaps":[' + this.timemaps.join(',') + '],' +
        '"timegates":[' + this.timegates.join(',') + '],' +
        '"mementos":[' + this.mementos.join(',') + ']' +
        '}';
}


/**
* Extend Memento object to be more command-line friendly without soiling core
*/
Memento.prototype.toString = function () {
    return JSON.stringify(this);
}

// Add Thumbnail Summarization attributes to Memento Class without soiling core
Memento.prototype.simhash = null;
Memento.prototype.captureTimeDelta = -1;
Memento.prototype.hammingDistance = -1;
Memento.prototype.simhashIndicatorForHTTP302 = '00000000';

/**
* Fetch URI-M HTML contents and generate a Simhash
* 
* @param theTimemap - the timemap object this memento belong to
*/
Memento.prototype.setSimhash = function (theTimeMap,curCookieClientId,response,callback) {
    // Retain the urir for reference in the promise (this context lost with async)
    var thaturi = this.uri;
    var thatmemento = this;
    var buffer2 = '';
    var memento = this ;// Potentially unused? The 'this' reference will be relative to the promise here
    var mOptions = url.parse(thaturi);
    constructSSE('Memento under processing -> '+thaturi, curCookieClientId);
    ConsoleLogIfRequired('Starting a simhash: ' + mOptions.host + mOptions.path);
    var req = http.request({
        'host': mOptions.host,
        'path': mOptions.path,
        'port':80,
        'headers': {'User-Agent': 'TimeMap Summarization instance - Contact (@WebSciDL)Twitter, (@maheedhargunnam)Twitter'}
    }, function (res) {
        // var hd = new memwatch.HeapDiff()

        if (res.statusCode !== 200) { // setting the simhash to be '0000000' for all the mementos which has a status of non 200
            thatmemento.simhash = Memento.prototype.simhashIndicatorForHTTP302;
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

        outputBuffer.setEncoding('utf8');
        //res.setEncoding('utf8')

        outputBuffer.on('data', function (data) {
            buffer2 += data.toString();
        });


        outputBuffer.on('end', function (d) {

            /*** ByMahee -- commented the following block as the client and server doesn't have to be in publish and subscribe mode
            //var md5hash = md5(thatmemento.originalURI) // urir cannot be passed in the raw
            ConsoleLogIfRequired("-- By Mahee -- Inside On response end of http request of setSimhash")
            ConsoleLogIfRequired("ByMahe -- here is the buffer content of " +mOptions.host+mOptions.path+":")  */
            //ConsoleLogIfRequired(buffer2)
            //ConsoleLogIfRequired("========================================================")
            //ConsoleLogIfRequired("Buffer Length ("+mOptions.host + mOptions.path +"):-> "+ buffer2.length)

            if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 && thatmemento.simhash != '00000000') {

                var sh = simhash((buffer2).split('')).join('');
                ConsoleLogIfRequired("ByMahee -- computed simhash for "+mOptions.host+mOptions.path+" -> "+ sh);
                //constructSSE('computed simhash for '+mOptions.host+mOptions.path +' -> '+ sh,curCookieClientId)
                var retStr = getHexString(sh)
                constructSSE('computed simhash for '+mOptions.host+mOptions.path +' -> '+ retStr,curCookieClientId);
                //|| (retStr == null)
                //if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302 || retStr == null || (retStr.match(/0/g) || []).length === 32) {

                if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302 || retStr == null) {
                    // Normalize so not undefined
                    retStr = Memento.prototype.simhashIndicatorForHTTP302;
                    // Gateway timeout from the archives, remove from consideration
                    // resolve('isA302DeleteMe')
                    callback();
                }

                buffer2 = '';
                buffer2 = null;

                //  ConsoleLogIfRequired("Hex Code for Simhash:"+retStr + ' & urir:' + mOptions.host + mOptions.path)
                thatmemento.simhash = retStr;
                // the following code to compute the percentages
                theTimeMap.completedSimhashedMementoCount = theTimeMap.completedSimhashedMementoCount+1;
                var value = (theTimeMap.completedSimhashedMementoCount/theTimeMap.mementos.length)*70+20;
                if(value > theTimeMap.prevCompletionVal) { // At times if there is an error while fetching the contents, retry happens and context jumps back there
                    theTimeMap.prevCompletionVal = value;
                }
                if(theTimeMap.prevCompletionVal > 100) {
                    theTimeMap.prevCompletionVal = 95;
                }

                response.write("")

                console.log("theTimeMap completedSimhashedMementoCount -> "+theTimeMap.completedSimhashedMementoCount);
                constructSSE("percentagedone-"+Math.ceil(theTimeMap.prevCompletionVal),curCookieClientId);

                callback();
                //resolve(retStr)
            } else {
                // We need to delete this memento, it's a duplicate and a "soft 302" from archive.org
                callback();
                //callback('isA302DeleteMe')
            }
        });

        outputBuffer.on('error', function (err) {
            constructSSE('Error generating the simhash',curCookieClientId);
            ConsoleLogIfRequired('Error generating Simhash in Response');
        });
    });

    req.on('error', function (err) {
        ConsoleLogIfRequired('Error generating Simhash in Request');
        ConsoleLogIfRequired(err);
        callback();
        //ConsoleLogIfRequired("-- By Mahee -- Inside On request error of http request of setSimhash")
    });

    req.end();
}


/**
* Grabs new mementos from appropriate archive,
*                           calculates a simhash on each,
*                           merges them with fullCachedTimemap and t objects,
*                           responds to the request appropriately,
*
*
* @param fullCachedTimemap - timemap object that holds all mementos from cache file
* @param t - timemap object that holds all cached mementos with a date range
*/
TimeMap.prototype.updateCache = function(fullCachedTimemap, uri, response, curCookieClientId, callback) {
    ConsoleLogIfRequired("Inside updateCache()");
    var t = this;
    var updatedTimemap = new TimeMap();
    async.series([
        function(callback) {
            updatedTimemap.fetchTimemap(uri, response, curCookieClientId, callback);
        },
        function(callback) {
            if(response.thumbnails["from"] != 0)
                updatedTimemap.filterMementosForDateRange(response, callback);
            else
                callback('');     
        },
        function(callback) {
            if(updatedTimemap.mementos.length > maxMementos && t.role != "histogram")
                updatedTimemap.filterMementos(response, curCookieClientId, callback);
            else
                callback('');
        },
        function(callback) {
            //remove cached mementos
            updatedTimemap.deleteCachedMementos(t.mementos,callback);
        },
        function(callback) {
            updatedTimemap.calculateSimhashes(curCookieClientId, response, callback);
        },
        function(callback) {
            //merge new mementos new and sort
            fullCachedTimemap.mementos = fullCachedTimemap.mementos.concat(updatedTimemap.mementos);
            fullCachedTimemap.mementos.sort(dateSort);
            fullCachedTimemap.mementos = getUnique(fullCachedTimemap.mementos,"uri");
            t.mementos = t.mementos.concat(updatedTimemap.mementos);
            t.mementos.sort(dateSort);
            t.mementos = getUnique(t.mementos,"uri");
            callback('');
        },
        function(callback) {
            if(t.mementos.length > maxMementos && t.role != "histogram")
                t.filterMementos(response, curCookieClientId, callback);
            else
                callback('');
        },
        function(callback) {
            fullCachedTimemap.saveSimhashesToCache(callback);
        },
        function(callback) {
            fullCachedTimemap.writeJSONToCache(callback);
        }],
        function (err, result) {
            if (err) {
                ConsoleLogIfRequired('ERROR!');
                ConsoleLogIfRequired(err);
            } else {
                ConsoleLogIfRequired('There were no errors executing the callback chain');
            }
            callback('');
    });
}

/**
* Removes mementos from the implicit object if they appear in cachedMementos array
*
* @param cachedMementos - array holding the cached mementos
*/
TimeMap.prototype.deleteCachedMementos = function(cachedMementos, callback) {
    var allMementos = this.mementos;
    this.mementos = [];
    for(var i in allMementos) {
        for(var j in cachedMementos) {
            if(allMementos[i].uri == cachedMementos[j].uri) {
                delete allMementos[i];
                break;
            }
        }
    }

    for (var i in allMementos) {
        if(allMementos[i] != undefined) {
            this.mementos.push(allMementos[i]);
        }
    }
    if(callback) {callback('')}
}

/**
* Removes a mementos if its datetime does not appear in the histogram cache file
* This is done to match the number of mementos that are in the archive
* 
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.deleteExtraMementos = function(callback) {
    if(archivedMementos != null || archivedMementos.length > 0) {
        for(var i = 0; i < this.mementos.length; ++i) {
            var cachedDate = new Date(this.mementos[i].datetime);
            var archiveDate = new Date(archivedMementos[i]);
            if(cachedDate.getTime() != archiveDate.getTime() || isNaN(archiveDate.getTime())) {
                this.mementos.splice(i,1);
                --i;
            }
        }
    }

    if(callback) {callback('')}
}

/**
* remove duplicates from an array
*
* @param arr - array holding object elements
* @param comp - value used ti check if object is duplicated
*/
function getUnique(arr, comp) {
    const unique = arr
        .map(e => e[comp])

     // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

    return unique;
}

/**
* normalize url for cache naming
*
* @param url - URL to canonicalize
*/
function urlCanonicalize(url) {
    var options = {stripProtocol: true,
                stripWWW: true,
                sortQueryParameters: true,
                removeTrailingSlash: true,
                stripHash: true};

    return normalizeUrl(url,options);
}

/**
* Determines host and path based on selected archive
*
* @param uri - uri obtained from the request
*/
function determineHostPath (uri, response) {
    var returnValue = {};

    if(response.thumbnails['primesource']=="internetarchive") {
        returnValue.host = 'web.archive.org';
        returnValue.path = '/web/timemap/link/' + uri;
    } else if(response.thumbnails['primesource']=="archiveit") {
        returnValue.host = 'wayback.archive-it.org';
        returnValue.path = '/'+response.thumbnails['collectionidentifier']+'/timemap/link/' + uri;
    } else if(response.thumbnails['primesource']=="arquivopt") {
        returnValue.host = 'arquivo.pt';
        returnValue.path = '/wayback/timemap/link/' + uri;
    } else { // must contain the Host and Path for Memento Aggregator
        ConsoleLogIfRequired("Haven't given the Memgators Host and Path yet");
        returnValue.host = "";
        returnValue.path = "";
        return;
    }

    return returnValue;
}

/**
* Sort memento array in ascending order
*/
function dateSort(a,b) {
    var dateA = new Date(a["datetime"].split(",")[1]);
    var dateB = new Date(b["datetime"].split(",")[1]);
    return dateA - dateB;
}

/**
* Fetch mementos from appropriate archive
*/
// TODO: define how this is different from the getTimemap() parent function (i.e., some name clarification is needed)
// TODO: abstract this method to its callback form. Currently, this is reaching and populating the timemap out of scope and can't be simply isolated (I tried)
TimeMap.prototype.fetchTimemap = function(uri, response, curCookieClientId, callback) {
    ConsoleLogIfRequired("--ByMahee -- Applying AlSummarization on given urir = "+ uri);

    // TODO: remove TM host and path references, they reside in the TM obj
    /* ByMahee -- right now hitting only organization : web.archive.org , changing the following Host and Path to http://wayback.archive-it.org
    */

    // var timemapHost = 'web.archive.org';
    // var timemapPath = '/web/timemap/link/' + uri;
    var t = this;
    var timemapHost = 'wayback.archive-it.org';
    var timemapPath = '/'+response.thumbnails['collectionidentifier']+'/timemap/link/' + uri;
    var timeMapLoaded = 0;
    var URIs = [];
    URIs = uri.split(',');

    if(URIs.length == 0) {
        URIs = [uri];
    }

    var buffer = ''; // An out-of-scope string to save the Timemap string, TODO: better documentation

    for(var i in URIs) {
        var returnVal = determineHostPath(URIs[i], response);
        timemapHost = returnVal.host;
        timemapPath = returnVal.path;

        var options = {
          'host': timemapHost,
          'path': timemapPath,
          'port': 80,
          'method': 'GET'
        }
        constructSSE('Http Request made to fetch the timemap...',curCookieClientId);
    
        var req = http.request(options, function (res) {
            ConsoleLogIfRequired("--ByMahee-- Inside the http request call back success, request is made on the following obect:")
            constructSSE('streamingStarted',curCookieClientId)
      
            constructSSE('Fetching the Timemap and writing the data response into buffer..',curCookieClientId)
            // ConsoleLogIfRequired(options);
            // ConsoleLogIfRequired("----------------");
            res.setEncoding('utf8')

            res.on('data', function (data) {
                buffer += data.toString();
            });
      
            res.on('end', function (d) {
      
                //  ConsoleLogIfRequired("Data Response from fetchTimeMap:" + buffer)
                if(timeMapLoaded == URIs.length - 1) {
                    if (buffer.length > 100) {  // Magic number = arbitrary, has be quantified for correctness
                           
                        //ConsoleLogIfRequired('Timemap acquired for ' + uri + ' from ' + timemapHost + timemapPath);
                        // ConsoleLogIfRequired("-----------ByMahee--------");
                        // ConsoleLogIfRequired(buffer);
                        // ConsoleLogIfRequired("-----------ByMahee--------");
                                 
                        t.str = buffer;
                        t.originalURI = urlCanonicalize(uri);// Need this for a filename for caching
                        t.primesource = response.thumbnails['primesource'];
                        t.collectionidentifier = response.thumbnails['collectionidentifier'];
                        t.hammingdistancethreshold = response.thumbnails['hammingdistancethreshold'];
                        t.role = response.thumbnails['role'];
                             
                        t.createMementos(); // the place where all the mementos are generated
                        ConsoleLogIfRequired("-- ByMahee -- Mementos are created by this point, following is the whole timeMap Object");
                        //ConsoleLogIfRequired(t);
                        ConsoleLogIfRequired("---------------------------------------------------");

                        if (t.mementos.length === 0) {
                            ConsoleLogIfRequired('There were no mementos for ' + uri + ' :(');
                            response.write('There were no mementos for ' + uri + ' :(');
                            response.end();
                            return;
                        }
                               
                        if (t.mementos.length == 0) {
                            ConsoleLogIfRequired('There were no mementos in this date range:(');
                            response.write('There were no mementos in this date range');
                            response.end();
                            return;
                        }
                        ConsoleLogIfRequired('Fetching HTML for ' + t.mementos.length + ' mementos.');
                        constructSSE('Timemap fetched has a total of '+t.mementos.length + ' mementos.',curCookieClientId);
                        constructSSE("percentagedone-20",curCookieClientId);
                        if(callback) {callback('');}
                    } else {
                        ConsoleLogIfRequired('The page you requested has not been archived.');
                        constructSSE('The page requested has not been archived.',curCookieClientId);
                        constructSSE("percentagedone-100",curCookieClientId);
                        //process.exit(-1)
                        response.write('The page you requested has not been archived.',);
                        response.end();
                        return;
                    }
                } else {
                    timeMapLoaded++;
                }
            });
        });
      
        req.on('error', function (e) { // Houston...
            ConsoleLogIfRequired('problem with request: ' + e.message);
            ConsoleLogIfRequired(e);
            if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
                ConsoleLogIfRequired('Hmm, the connection timed out. Internet Archive might be down.');
                constructSSE('the connection timed out, prime source of archive might be down.',curCookieClientId);

                response.write('Hmm, the connection timed out. Internet Archive might be down.');
                response.end();
                return;
            }
        })
      
        req.on('socket', function (socket) { // Slow connection is slow
            /*socket.setTimeout(3000)
            socket.on('timeout', function () {
                ConsoleLogIfRequired("The server took too long to respond and we're only getting older so we aborted.")
                req.abort()
            }) */
        })
      
        req.end();
    }
}

/**
* Given a URI, return a TimeMap from the Memento Aggregator
* TODO: God function that does WAY more than simply getting a timemap
* @param uri The urir in-question
*/
function getTimemapGodFunctionForAlSummarization (uri, response,curCookieClientId) {
    ConsoleLogIfRequired("--ByMahee -- Inside function : getTimemapGodFunctionForAlSummarization");

    var t = new TimeMap();
    var retStr = '';
    var metadata = '';

    ConsoleLogIfRequired('Starting many asynchronous operationsX...');
    async.series([
        function(callback) {
            t.fetchTimemap(uri, response, curCookieClientId, callback)
        },

        //ByMahee -- commented out some of the methods called to build step by step
        /* **
        // TODO: remove this function from callback hell
        function (callback) {t.printMementoInformation(response, callback, false);}, // Return blank UI ASAP */

        // -- ByMahee -- Uncomment one by one for CLI_JSON
        function(callback){
        	if(t.role == "histogram") {
        		t.getDatesForHistogram(callback,response,curCookieClientId, false);
        	} else {
        		t.getDatesForHistogram(callback,response,curCookieClientId, true);
        	}
        },
        function(callback) {
            if(response.thumbnails['from'] != 0) {
                t.filterMementosForDateRange(response, callback);
            } else
                callback('');
        },
        function(callback) {
            if(t.mementos.length > maxMementos && t.role != "histogram") {
                t.filterMementos(response, curCookieClientId, callback);
            } else
                callback('');
        },
        function (callback) {
            if (t.role == "histogram" || (t.hammingdistancethreshold == '0' && t.role == "summary")) {
                callback('');
            } else {
                t.calculateSimhashes(curCookieClientId,response,callback);
            }
        },
        function (callback) {
            constructSSE("percentagedone-30",curCookieClientId);
            if (t.role == "histogram" || (t.hammingdistancethreshold == '0' && t.role == "summary")) {
                callback('');
            } else {
                t.saveSimhashesToCache(callback);  
            }
        },
        function (callback) {
            if(isToComputeBoth) {
                if(t.role == "stats") {
                    t.calculateHammingDistancesWithOnlineFiltering(curCookieClientId,callback);
                } else if(t.role == "histogram" || (t.hammingdistancethreshold == '0' && t.role == "summary")) {
                    callback('');
                } else {
                    t.calculateHammingDistancesWithOnlineFilteringForSummary(curCookieClientId,callback);
                }
            } else if (callback) {
                callback('');
            }
        },
        function (callback) {
            if(isToComputeBoth) {
                if(t.role == "stats") {
                    t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI(callback);
                } else if(t.role == "histogram" || (t.hammingdistancethreshold == '0' && t.role == "summary")) {
                    callback('');
                } else {
                    t.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary(callback);
                }
            } else if (callback) {
                callback('');
            }
        },
        function (callback) {
            if(t.role == "histogram") {
                callback('');
            } else if(t.hammingdistancethreshold == '0' && t.role == "summary") {
                t.supplyAllMementosAScreenshotURI(callback);
            } else {
                t.writeJSONToCache(callback);
            }
        },
        function (callback) {
            if(isToComputeBoth) {
                if ( t.role == "histogram") {
                    callback('');
                } else {
                    t.createScreenshotsForMementos(curCookieClientId,response,callback);
                }
            } else if (callback) {
                callback('');
            }
        },
        function (callback) {
            if(t.role == "histogram") {
                callback('');
            } else {
                t.SendThumbSumJSONCalledFromCache(response,callback);
            }
        }],
        function (err, result) {
            if (err) {
                ConsoleLogIfRequired('ERROR!');
                ConsoleLogIfRequired(err);
            } else {
                ConsoleLogIfRequired('There were no errors executing the callback chain');
            }
        }
    );


    // Fisher-Yates shuffle per http://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
    function getRandomSubsetOfMementosArray (arr,siz) {
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

    function getTimeDiffBetweenTwoMementoURIs (newerMementoURI, olderMementoURI) {
        var newerDate = newerMementoURI.match(/[0-9]{14}/g)[0] ; // Newer
        var olderDate = olderMementoURI.match(/[0-9]{14}/g)[0] ; // Older

        if (newerDate && olderDate) {
            try {
                var diff = (parseInt(newerDate) - parseInt(olderDate));
                return diff;
            } catch (e) {
                ConsoleLogIfRequired(e.message);
            }
        } else {
            throw new Exception('Both mementos in comparison do not have encoded datetimes in the URIs:\r\n\t' + newerMemento.uri + '\r\n\t' + olderMemento.uri);
        }
    }
} /* End God Function */

/*****************************************
   // SUPPLEMENTAL TIMEMAP FUNCTIONALITY
***************************************** */

/**
* Calculates a simhash on each memento from the implied timemap object
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.calculateSimhashes = function (curCookieClientId,response,callback) {
    //ConsoleLogIfRequired("--- By Mahee - For my understanding")
    //ConsoleLogIfRequired("Inside CalculateSimhashes")
    var theTimeMap = this;
    theTimeMap.completedSimhashedMementoCount =0;
    theTimeMap.prevCompletionVal = 0;
    var arrayOfSetSimhashFunctions = [];
    var totalMemetoCount = this.mementos.length;
    // the way to get a damper, just 7 requests at a time.
    async.eachLimit(this.mementos,5, function(curMemento, callback) {

        curMemento.setSimhash(theTimeMap,curCookieClientId,response,callback);
        //ConsoleLogIfRequired(curMemento)
    }, function(err) {
        //  ConsoleLogIfRequired("length of arr ayOfSetSimhashFunctions: -> " + arrayOfSetSimhashFunctions.length);
        if(err) {
            ConsoleLogIfRequired("Inside async Each Limit");
            ConsoleLogIfRequired(err);
            return;
        }

        //  ConsoleLogIfRequired("After all the resquests are resolved, theTimemap -> "+  theTimeMap)

        ConsoleLogIfRequired('Checking if there are mementos to remove');
        var mementosRemoved = 0;
        ConsoleLogIfRequired('About to go into loop of ## mementos: ' + (theTimeMap.mementos.length - 1));

        // Remove all mementos whose payload body was a Wayback soft 302
        for (var i = theTimeMap.mementos.length - 1; i >= 0; i--) {

            /* if (theTimemap.mementos[i].simhash === 'isA302DeleteMe') { //this was the original conetent of the code,
             * according to my understanding 'theTimemap.mementos[i].simhash' has to be checked with 'Memento.prototype.simhashIndicatorForHTTP302',
             * doing the same: just changed the above condition as to follow
            */

            if(theTimeMap.mementos[i].simhash === Memento.prototype.simhashIndicatorForHTTP302 || theTimeMap.mementos[i].simhash  == null|| (theTimeMap.mementos[i].simhash.match(/0/g) || []).length === 32) {
                theTimeMap.mementos.splice(i, 1);
                mementosRemoved++;
            }
        }
        // console.timeEnd('simhashing')
        ConsoleLogIfRequired(mementosRemoved + ' mementos removed due to Wayback "soft 3xxs"')

        constructSSE("percentagedone-"+Math.ceil(90),curCookieClientId);

        if (callback) {
            callback('');
        }
    });
}

/**
* Saves memento array to a cache file after simhash has been calculated
* Cache file naming format: [primesource]_[colectionidentifier]_[canonicalizedURI]
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.saveSimhashesToCache = function (callback,format) {
    // TODO: remove dependency on global timemap t

    var strToWrite = '';
    for (var m = 0; m < this.mementos.length; m++) {
        if (this.mementos[m].simhash != Memento.prototype.simhashIndicatorForHTTP302) {
            strToWrite += this.mementos[m].simhash + ' ' + this.mementos[m].uri + ' ' + this.mementos[m].datetime + '\r\n';
        }
    }

    ConsoleLogIfRequired('Done getting simhashes from array');
    ConsoleLogIfRequired('-- ByMahee -- In function SaveSimhashesToCache -- Simhash for URI and DateTime is as follows:');
    ConsoleLogIfRequired(strToWrite);
    ConsoleLogIfRequired("-------------------------------------------------------------------------");

    // modified ti accomodate the hdt aswell with in the cache - meaning different hdt will have different cached file from now on
    // Modified it back to original, cause now multiple Hamming distance stats are thrown at once.
    var cacheFile = new SimhashCacheFile(this.primesource+"_"+this.collectionidentifier+"_"+this.originalURI,isDebugMode);
    cacheFile.replaceContentWith(strToWrite);

    if (callback) {
        callback('');
    }
}

/**
* Saves memento array to a cache file after simhash has been calculated in JSON format
* Cache file naming format: [primesource]_[colectionidentifier]_[canonicalizedURI].json
*
* @param callback - The next procedure to execution when this process concludes
*/

TimeMap.prototype.writeJSONToCache = function (callback) {
    var cacheFile = new SimhashCacheFile(this.primesource+"_"+this.collectionidentifier+"_"+this.originalURI,isDebugMode);
    //cacheFile.writeFileContentsAsJSON(JSON.stringify(this.mementos))
    cacheFile.writeFileContentsAsJSON(this.mementos) ;// write the last HD based content into JSON

    // in case if the contents have to be written back to JSON
    // this.menentoDetForMultipleKValues.forEach(function(mementoArrObj, hammingDistance) {
    //   HAMMING_DISTANCE_THRESHOLD = hammingDistance;
    //   var cacheFile = new SimhashCacheFile(primeSource+"_"+"hdt_"+HAMMING_DISTANCE_THRESHOLD+"_"+collectionIdentifier+"_"+originalURI,isDebugMode)
    //   cacheFile.writeFileContentsAsJSON(mementoArrObj)
    // });

    if (callback) {
        callback('');
    }
}

/**
* Extracts and assigns datetime to each memento appropriately
* Responds to request with a JSON formatted object array consisting of memento datetime and uri
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.getDatesForHistogram = function (callback,response,curCookieClientId, isMultipleURIs) {
    var mementoDates=[];
    var length = this.mementos.length -1;
    this.mementos.forEach(function(memento, m) {
        var date = JSON.stringify(memento["datetime"]);
        var newDateString = date.substring(9,13) + date.substring(6,8) + ", " + date.substring(13,26);
        mementoDates.push(newDateString);
    });
    ConsoleLogIfRequired(mementoDates);
    ConsoleLogIfRequired("-------------------------------------------------------------------------");

    if(isMultipleURIs) {
        var cacheFile = new SimhashCacheFile(this.primesource+"_"+this.collectionidentifier+"_"+this.originalURI,isDebugMode);
        cacheFile.path = cacheFile.path.replace("simhashes", "histogram");
        cacheFile.writeFileContentsAsJSON(mementoDates);
    } else if(isMultipleURIs == null) {
        constructSSE("histoDataSent",curCookieClientId);
        response.write(JSON.stringify(mementoDates));
        response.end();
    } else {
        var cacheFile = new SimhashCacheFile(this.primesource+"_"+this.collectionidentifier+"_"+this.originalURI,isDebugMode);
        cacheFile.path = cacheFile.path.replace("simhashes", "histogram");
        cacheFile.writeFileContentsAsJSON(mementoDates);
        constructSSE("histoDataSent",curCookieClientId);
        response.write(JSON.stringify(mementoDates));
        response.end();
    }

    if(callback)
        callback('');
}

/**
* Filters memento array to contain just the requested date interval
*/
TimeMap.prototype.filterMementosForDateRange = function(response, callback) {
    ConsoleLogIfRequired("Inside filterMementosForDateRange()");
    var theFromDate = new Date(response.thumbnails['from']);
    var theToDate = new Date(response.thumbnails['to']);

    this.mementos = this.mementos.filter(function (curMemento) {
        var tryDate = new Date(curMemento.datetime);
        return tryDate >= theFromDate && tryDate <= theToDate;
    });

    if(archivedMementos != null) {
        archivedMementos = archivedMementos.filter(function (curDate) {
        	var tryDate = new Date(curDate);
            return tryDate >= theFromDate && tryDate <= theToDate;
        });   
    }

    if(callback)
        callback('');
}

TimeMap.prototype.filterMementos = function(response, curCookieClientId, callback) {
    var t = this;
    var originalMemetosLengthFromTM = t.mementos.length;
    var tempMementoArr = [];
    var tempArchivedArr=[];
    var sections = 250, count = 0, left = 4;
    var lastTime = 0, currentTime = 0, daysBetween = 0;

    var interval = Math.floor(originalMemetosLengthFromTM / sections);
    var nextSection = interval;

    for(var i = 0; i < originalMemetosLengthFromTM; i++) {
        if(i == 0) { // Always take first memento
            tempMementoArr.push(t.mementos[i]);
            tempMementoArr[0]["rel"] = "first memento";
            if(archivedMementos != null)
                tempArchivedArr.push(archivedMementos[i]);
            lastTime = new Date(t.mementos[i]["datetime"].split(",")[1]).getTime();
            left--;
        } else if (left == 0 || i == nextSection) {
            left += 4;
            i = nextSection;
            nextSection += interval;
        }
        else {
            currentTime = new Date(t.mementos[i]["datetime"].split(",")[1]).getTime();
            daysBetween = (currentTime - lastTime) / (1000*60*60*24);
            if(daysBetween >= 3) { //If mementos are at least 3 days apart
                console.log("Found one --------------------------------------------------- ");
                console.log(i);
                tempMementoArr.push(t.mementos[i]);
                if(archivedMementos != null)
                    tempArchivedArr.push(archivedMementos[i])
                lastTime = currentTime;
                left--;
            }
        }
    }

    constructSSE('The page you requested original has '+originalMemetosLengthFromTM +' Mementos, processing to consider a sample of up to 1000',curCookieClientId)
    ConsoleLogIfRequired('The page you requested original has '+originalMemetosLengthFromTM +' Mementos, processing to consider a sample of up to 1000')
    tempMementoArr[0]["rel"] = "first memento";
    t.mementos = tempMementoArr;
    archivedMementos = tempArchivedArr;
    ConsoleLogIfRequired("-----------Mementos under consideration, Length -> "+t.mementos.length +"  -------")
    ConsoleLogIfRequired(JSON.stringify(t.mementos))
    ConsoleLogIfRequired("---------------------------------------------------")

    if(callback)
        callback('');
}

TimeMap.prototype.matchMementosToArchive = function(uri, response, curCookieClientId, fileContents, callback) {
    if(this.mementos.length < archivedMementos.length) {
        var fullCachedTimemap = createMementosFromJSONFile(fileContents);
        fullCachedTimemap.curClientId = curCookieClientId;
        fullCachedTimemap.originalURI = urlCanonicalize(uri);
        fullCachedTimemap.primesource = response.thumbnails['primesource'];
        fullCachedTimemap.collectionidentifier = response.thumbnails['collectionidentifier'];
        fullCachedTimemap.hammingdistancethreshold = response.thumbnails['hammingdistancethreshold'];
        fullCachedTimemap.role = response.thumbnails['role'];
        this.updateCache(fullCachedTimemap, uri, response, curCookieClientId, callback);
    }
    else if (this.mementos.length > archivedMementos.length)
        this.deleteExtraMementos(callback);
    else
        callback('');
}

/**
* Constructs the JSON in the needed format and sends it over to Client, this method is called only if the request comes from a Cached mode
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.SendThumbSumJSONCalledFromCache= function (response,callback) {

    var month_names_short= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mementoJObjArrForTimeline=[];
    var mementoJObjArrFor_Grid_Slider =[];
    // Assuming foreach is faster than for-i, this can be executed out-of-order
    this.mementos.forEach(function (memento,m) {

        var uri = memento.uri;
        // need to have the following line, id_ isnot needed for screen shot, to replace /12345678912345id_/ to /12345678912345/
        var regExpForDTStr = /\/\d{14}id_\//; // to match something lile /12345678912345id_/
        var matchedString = uri.match(regExpForDTStr);
        if(matchedString != null) {
            uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
        }

        // this is been replaced by the above so as not to have any clashes
        //uri = uri.replace("id_/http","/http");

        var mementoJObj_ForTimeline ={};
        var mementoJObj_ForGrid_Slider={};
        var dt =  new Date(memento["datetime"].split(",")[1]);
        var date = dt.getDate();
        var month = dt.getMonth() + 1;
        if(date <10) {
            date = "0"+date;
        }

        if(month < 10) {
            month = "0"+month;
        }

        var eventDisplayDate = dt.getUTCFullYear()+"-"+ month+"-"+date+", "+ memento["datetime"].split(" ")[4];
        mementoJObj_ForTimeline["timestamp"] = Number(dt)/1000;
        if(memento.screenshotURI == null || memento.screenshotURI=='') {
            mementoJObj_ForTimeline["event_series"] = "Non-Thumbnail Mementos";

            // the two following lines are connented as the JSON object must not contain HTML Fragment
            // mementoJObj_ForTimeline["event_html"] = "<img src='"+localAssetServer+"notcaptured.png' width='300px' />"
            // mementoJObj_ForTimeline["event_html_similarto"] = "<img src='"+localAssetServer+memento.hammingBasisScreenshotURI +"' width='300px' />"

            mementoJObj_ForTimeline["event_html"] = 'notcaptured';
            mementoJObj_ForTimeline["event_html_similarto"] = localAssetServer+memento.hammingBasisScreenshotURI;
        } else {
            var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png' ; // Sanitize URI->filename
            mementoJObj_ForTimeline["event_series"] = "Thumbnails";
            mementoJObj_ForTimeline["event_html"] = localAssetServer+memento.screenshotURI;
        }

        mementoJObj_ForTimeline["event_date"] =  month_names_short[ parseInt(month)-1]+". "+date +", "+ dt.getUTCFullYear();
        mementoJObj_ForTimeline["event_display_date"] = eventDisplayDate;
        mementoJObj_ForTimeline["event_description"] = "";
        mementoJObj_ForTimeline["event_link"] = uri;
        mementoJObjArrForTimeline.push(mementoJObj_ForTimeline);
    });

    response.write(JSON.stringify(mementoJObjArrForTimeline));
    response.end();

    ConsoleLogIfRequired("--------------------- Json Array for TimeLine from  SendThumbSumJSONCalledFromCache ------------------------------");
    ConsoleLogIfRequired(JSON.stringify(mementoJObjArrForTimeline));
    ConsoleLogIfRequired("------------------------------------------------------------------------------------------------------------");
    if (callback) {
        callback('');
    }
}


/**
* Converts the JsonOutput from the current formate to the format required for timemap plugin
* and saves in a json file
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.writeThumbSumJSONOPToCache = function (response,callback) {

    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& in ThumbSumJSON wiritng method &&&&&&&&&&&&&&&&&&&&&&&&&&&&");

    var month_names_short= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mementoJObjArrForTimeline=[];
    var mementoJObjArrFor_Grid_Slider =[];
    // Assuming foreach is faster than for-i, this can be executed out-of-order
    this.mementos.forEach(function (memento,m) {

        var uri = memento.uri;

        // need to have the following line, id_ isnot needed for screen shot, to replace /12345678912345id_/ to /12345678912345/
        var regExpForDTStr = /\/\d{14}id_\//; // to match something lile /12345678912345id_/
        var matchedString = uri.match(regExpForDTStr);
        if(matchedString != null) {
            uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
        }

        //  uri = uri.replace("id_/http","/http"); //replaced by the above segment

        var mementoJObj_ForTimeline ={};
        var mementoJObj_ForGrid_Slider={};
        var dt =  new Date(memento["datetime"].split(",")[1]);
        var date = dt.getDate();
        var month = dt.getMonth() + 1;
        if(date <10) {
            date = "0"+date;
        }

        if(month < 10) {
            month = "0"+month;
        }

        var eventDisplayDate = dt.getUTCFullYear()+"-"+ month+"-"+date+", "+ memento["datetime"].split(" ")[4];
        mementoJObj_ForTimeline["timestamp"] = Number(dt)/1000;
        if(memento.screenshotURI == null || memento.screenshotURI=='') {
            mementoJObj_ForTimeline["event_series"] = "Non-Thumbnail Mementos";
            mementoJObj_ForTimeline["event_html"] = "notcaptured";
            mementoJObj_ForTimeline["event_html_similarto"] = localAssetServer+memento.hammingBasisScreenshotURI;
        } else {
            var filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';  // Sanitize URI->filename
            mementoJObj_ForTimeline["event_series"] = "Thumbnails";

            // the two following lines are connented as the JSON object must not contain HTML Fragment
            mementoJObj_ForTimeline["event_html"] = localAssetServer+memento.screenshotURI;
        }

        mementoJObj_ForTimeline["event_date"] =  month_names_short[ parseInt(month)-1]+". "+date +", "+ dt.getUTCFullYear();
        mementoJObj_ForTimeline["event_display_date"] = eventDisplayDate;
        mementoJObj_ForTimeline["event_description"] = "";
        mementoJObj_ForTimeline["event_link"] = uri;
        mementoJObjArrForTimeline.push(mementoJObj_ForTimeline);
    });

    //var cacheFile = new SimhashCacheFile(this.primesource+"_"+"hdt_"+this.hammingdistancethreshold+"_"+this.collectionidentifier+"_"+this.originalURI,isDebugMode);
    //cacheFile.writeThumbSumJSONOPContentToFile(mementoJObjArrForTimeline);

    if(!isResponseEnded) {
        response.write(JSON.stringify(mementoJObjArrForTimeline));
        response.end();
    }

    ConsoleLogIfRequired("--------------------- Json Array for TimeLine from  writeThumbSumJSONOPToCache------------------------------");
    ConsoleLogIfRequired(JSON.stringify(mementoJObjArrForTimeline));
    ConsoleLogIfRequired("------------------------------------------------------------------------------------------------------------");
    if (callback) {
        callback('');
    }
}


/**
* Converts the target URI to a safe semantic filename and attaches to relevant memento.
* Selection based on passing a hamming distance threshold provided in request parameters 
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplyChosenMementosBasedOnHammingDistanceAScreenshotURIForSummary = function (callback) {
    // Assuming foreach is faster than for-i, this can be executed out-of-order
    var self = this;
    var uniqueIndexList = [];
    var hammingDistanceThreshold = self.hammingdistancethreshold;

    // if negative hamming distance was passed, first, center, and last mementos from the unique list will be used
    if(hammingDistanceThreshold < 0) {
        // set hamming distance back to positive to use
        hammingDistanceThreshold = hammingDistanceThreshold * -1;
    }

    this.mementos.forEach(function (memento,m) {
        var uri = memento.uri;

        //  to replace /12345678912345id_/ to /12345678912345/
        var regExpForDTStr = /\/\d{14}id_\// ;// to match something lile /12345678912345id_/
        var matchedString = uri.match(regExpForDTStr);
        if(matchedString != null) {
            uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
        }

        //uri = uri.replace("id_/http","/http"); //replaced by above code segment
        // ConsoleLogIfRequired("Hamming distance = "+memento.hammingDistance)
        if (memento.hammingDistance < hammingDistanceThreshold  && memento.hammingDistance >= 0) {
            // ConsoleLogIfRequired(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
            memento.screenshotURI = null;

            var regExpForDTStr = /\/\d{14}id_\// ;// to match something lile /12345678912345id_/
            var matchedString = memento.hammingBasisURI.match(regExpForDTStr);
            if(matchedString != null) {
                memento.hammingBasisURI = memento.hammingBasisURI.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
            }
            var filename = 'timemapSum_'+ memento.hammingBasisURI.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';  // Sanitize URI->filename

            //var filename = 'timemapSum_' + SCREENSHOT_DELTA + '_'+ memento.hammingBasisURI.replace("id_/http","/http").replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename // replaced by above segment
            memento.hammingBasisScreenshotURI = filename;
        } else {
            // if hamming distance is negative, store index of unique memento
            if(self.hammingdistancethreshold < 0) {
              uniqueIndexList.push(m);
            } else {
                var filename = null;
                filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png' ; // Sanitize URI->filename
                memento.screenshotURI = filename;
            }
        }
    });

    // if hamming distance is negative, grab first, center, and last mementos from the list of unique
    if(self.hammingdistancethreshold < 0) {

        // get the center of the list
        var center = Math.floor(uniqueIndexList.length/2);
        var i = 0, odd = false;

        if(uniqueIndexList.length % 2 != 0) { odd = true; } // check if list length is odd or even

        while(i < uniqueIndexList.length) {
            var filename = null;
            filename = 'timemapSum_'+ this.mementos[uniqueIndexList[i]].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png' ; // Sanitize URI->filename
            this.mementos[uniqueIndexList[i]].screenshotURI = filename;

            i += (odd && i > 0) ? center : center-1; // increment depending on list length being odd or even
        }
    }

    ConsoleLogIfRequired('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back');
    if (callback) {
        callback('');
    }
}




/**
* Converts the target URI to a safe semantic filename and attaches to relevant memento.
* Selection based on passing a hamming distance threshold
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplyChosenMementosBasedOnHammingDistanceAScreenshotURI = function (callback) {

    // Assuming foreach is faster than for-i, this can be executed out-of-order
    var self = this;
    this.menentoDetForMultipleKValues.forEach(function(mementoArr, hammingDistanceThresh) {
        var currHDT = hammingDistanceThresh; // for multiple threshold computation, setting the threshold against the corresponding MementodDetails object
        mementoArr.forEach(function (memento,m) {
            var uri = memento.uri;
            //  to replace /12345678912345id_/ to /12345678912345/
            var regExpForDTStr = /\/\d{14}id_\//; // to match something lile /12345678912345id_/
            var matchedString = uri.match(regExpForDTStr);
            if(matchedString != null) {
                uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
            }

            //uri = uri.replace("id_/http","/http"); //replaced by above code segment

            // ConsoleLogIfRequired("Hamming distance = "+memento.hammingDistance)
            if (memento.hammingDistance < currHDT  && memento.hammingDistance >= 0) {
                // ConsoleLogIfRequired(memento.uri+" is below the hamming distance threshold of "+HAMMING_DISTANCE_THRESHOLD)
                memento.screenshotURI = null;

                var regExpForDTStr = /\/\d{14}id_\//; // to match something lile /12345678912345id_/
                var matchedString = memento.hammingBasisURI.match(regExpForDTStr);
                if(matchedString != null) {
                    memento.hammingBasisURI = memento.hammingBasisURI.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
                }
                var filename = 'timemapSum_'+ memento.hammingBasisURI.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png' ; // Sanitize URI->filename

                //var filename = 'timemapSum_' + SCREENSHOT_DELTA + '_'+ memento.hammingBasisURI.replace("id_/http","/http").replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename // replaced by above segment
                memento.hammingBasisScreenshotURI = filename;
            } else {
                var filename = null;
                //if(memento.hammingDistance != undefined) {
                filename = 'timemapSum_'+ uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  ;// Sanitize URI->filename
                //}
                memento.screenshotURI = filename;
            }
        });
    });

    ConsoleLogIfRequired('done with supplyChosenMementosBasedOnHammingDistanceAScreenshotURI, calling back');
    if (callback) {
        callback('');
    }
}

/**
* Converts the filename of all mementos a valid image filename and associate
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplyAllMementosAScreenshotURI = function(callback) {
    for(var m in this.mementos) {
        var filename = 'timemapSum_' + this.mementos[m].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';
        this.mementos[m].screenshotURI = filename;
    }

    callback('');
}

/**
* Converts the filename of each previously selected memento a valid image filename and associate
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.supplySelectedMementosAScreenshotURI = function (strategy,callback) {
    var ii = 0
    for (var m in this.mementos) {
        if (this.mementos[m].selected) {
            var filename = strategy + '_'+ this.mementos[m].uri.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png';
            this.mementos[m].screenshotURI = filename;
            ii++;
        }
    }

    ConsoleLogIfRequired('Done creating filenames for ' + ii + ' mementos');

    if (callback) {
        callback('');
    }
}

/**
* Generate a screenshot with all mementos that pass the passed-in criteria test
*
* @param callback - The next procedure to execution when this process concludes
* @param withCriteria - Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementos = function (curCookieClientId,response,callback, withCriteria) {


    function hasScreenshot (e) {
        return e.screenshotURI != null;
    }

    var self = this;

    var criteria = hasScreenshot;
    if (withCriteria) {
        criteria = withCriteria;
    }

    var noOfThumbnailsSelectedToBeCaptured = 0;

    // breaking the control and returning the stats if the the request is made for status
    if(self.role == "stats") {
        var statsArry =[];
        self.statsHashMapObj.forEach(function(statsObj, hammingDistance) {
            console.log("------------------ selected for screenshots------------");
            console.log(JSON.stringify(self.menentoDetForMultipleKValues.get(hammingDistance).filter(criteria)));
            // if negative hamming distance was passed, get first, center, and last mementos from the list
            if(hammingDistance < 0) {

                // make hamming distance positive to use
                hammingDistance = hammingDistance * -1;

                // get original list of mementos
                var toBeCaptured = self.menentoDetForMultipleKValues.get(hammingDistance).filter(criteria);
                var center = Math.floor(toBeCaptured.length/2); // find center
                var capturedThree = [];

                // push first, center, and last mementos
                capturedThree.push(toBeCaptured[0]);
                capturedThree.push(toBeCaptured[center]);
                capturedThree.push(toBeCaptured[(toBeCaptured.length) - 1]);

                noOfThumbnailsSelectedToBeCaptured = getNotExistingCapturesCount(capturedThree);
            } else {
                noOfThumbnailsSelectedToBeCaptured = getNotExistingCapturesCount(self.menentoDetForMultipleKValues.get(hammingDistance).filter(criteria));
            }
            statsObj["timetowait"] = Math.ceil((noOfThumbnailsSelectedToBeCaptured * 30)/60 + (noOfThumbnailsSelectedToBeCaptured*SCREENSHOT_DELTA)/60);
            constructSSE('No of screenshots to be captured -> <h4>'+noOfThumbnailsSelectedToBeCaptured +'</h4>',curCookieClientId);
            statsObj["fromdate"] = self.mementos[0]["datetime"];
            statsObj["todate"] = self.mementos[self.mementos.length-1]["datetime"];
            statsArry.push(statsObj);
        });

        constructSSE('Stats built and ready to serve...',curCookieClientId);
        constructSSE("percentagedone-100",curCookieClientId);
        constructSSE('statssent',curCookieClientId);
        response.write(JSON.stringify(statsArry));
        response.end();
        return
    } else {
        noOfThumbnailsSelectedToBeCaptured = getNotExistingCapturesCount(self.mementos.filter(criteria));
    }

    ConsoleLogIfRequired('Creating screenshots...')
    ConsoleLogIfRequired('Started the process of capturing the screenshots...',curCookieClientId);

    constructSSE('Started the process of capturing the screenshots...',curCookieClientId);
    //constructSSE("streamingStarted",curCookieClientId);
    constructSSE("percentagedone-5",curCookieClientId);

    if (noOfThumbnailsSelectedToBeCaptured >= 2) {
        constructSSE('Might approximately take <h3>' + Math.ceil((noOfThumbnailsSelectedToBeCaptured * 30)/60 + (noOfThumbnailsSelectedToBeCaptured*SCREENSHOT_DELTA))  +' Minutes <h3> to capture screen shots. Please be patient...');

        // now that streaming is in place, dont bother about sending an intermediate response
        // response.write('Request being processed, Please retry approximately after ( ' + Math.ceil((noOfThumbnailsSelectedToBeCaptured * 40)/60)  +' Minutes ) and request again...')
        // response.end()
        // isResponseEnded = true
    }
    var completedScreenshotCaptures = 0;
    var preVal =0;
    async.eachLimit(
        shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
        1,function( memento,callback) {
            ConsoleLogIfRequired('************curCookieClientId just before calling  createScreenshotForMementoWithPuppeteer -> '+curCookieClientId+'************');
            self.createScreenshotForMementoWithPuppeteer(curCookieClientId,memento,response,false,callback);
            //self.createScreenshotForMementoWithPhantom(curCookieClientId,memento,callback)
            completedScreenshotCaptures++;
            var value = ((completedScreenshotCaptures/noOfThumbnailsSelectedToBeCaptured)*80)+5;

            if(value > preVal) { // At times if there is an error while fetching the contents, retry happens and context jumps back there
                preVal = value;
            }
            if(preVal > 100) {
                preVal = 95;
            }
            constructSSE("percentagedone-"+Math.ceil(preVal),curCookieClientId);
        } ,
        function doneCreatingScreenshots (err) {      // When finished, check for errors

            ConsoleLogIfRequired('Finished capturing all the required screenshots...'+curCookieClientId);

            constructSSE('Finished capturing all the required screenshots...',curCookieClientId);
            constructSSE("percentagedone-100",curCookieClientId);
            constructSSE('readyToDisplay',curCookieClientId);

            if (err) {
                ConsoleLogIfRequired('Error creating screenshot',curCookieClientId);

                ConsoleLogIfRequired(err);
            }
            callback('');
        }
    );
}


/**
* Generate a screenshot with all mementos that pass the passed-in criteria test
*
* @param callback - The next procedure to execution when this process concludes
* @param withCriteria - Function to inclusively filter mementos, i.e. returned from criteria
*                     function means a screenshot should be generated for it.
*/
TimeMap.prototype.createScreenshotsForMementosFromCached = function (curCookieClientId,response,callback, withCriteria) {
    ConsoleLogIfRequired('Creating screenshots...');

    function hasScreenshot (e) {
        return e.screenshotURI !== null;
    }

    var self = this;

    var criteria = hasScreenshot;
    if (withCriteria) {
        criteria = withCriteria;
    }
    console.log("------------------ selected for screenshots------------");
    console.log(JSON.stringify(self.mementos.filter(criteria)));
    async.eachLimit(
        shuffleArray(self.mementos.filter(criteria)), // Array of mementos to randomly // shuffleArray(self.mementos.filter(hasScreenshot))
        1,
        function( memento,callback) {
            self.createScreenshotForMementoWithPuppeteer(curCookieClientId,memento,response,false,callback);
            //self.createScreenshotForMementoWithPhantom(curCookieClientId,memento,callback)
    },
        function doneCreatingScreenshots (err) {      // When finished, check for errors
            constructSSE('Finished capturing all the required screenshots...',curCookieClientId);
            constructSSE('readyToDisplay',curCookieClientId);
            if (err) {
                ConsoleLogIfRequired('Error creating screenshot');
                ConsoleLogIfRequired(err);
            }

            callback('');
        }
    );
}


/**
* CreateScreenshotForMemento through puppeteer
*
* @param memento - memento to load in puppeter
* @param refreshMemento - boolean that handles screenshot wait time (waits longer if screenshot retake issued)
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.createScreenshotForMementoWithPuppeteer = function (curCookieClientId,memento,response,refreshMemento,callback) {
    var uri = memento.uri
    ConsoleLogIfRequired('********** curCookieClientId in createScreenshotForMementoWithPuppeteer -> '+curCookieClientId+'***************');

    var regExpForDTStr = /\/\d{14}id_\/|\d{14}\//; //to match something like /12345678912345id_/
    var matchedString = uri.match(regExpForDTStr);
    if(matchedString != null) {
        uri = uri.replace(matchedString[0],(matchedString[0].toString().replace(/id_\/$|\/$/,"if_/"))); // by default only the first occurance is replaced
    }

    //uri = uri.replace("id_/http","/http");
    //uri = uri.replace("/http","if_/http");

    var filename = memento.screenshotURI;

    try {
        fs.openSync(
        path.join(__dirname + '/'+screenshotsLocation + memento.screenshotURI),
        'r');

        constructSSE(memento.screenshotURI + ' already exists...',curCookieClientId);
        ConsoleLogIfRequired(memento.screenshotURI + ' already exists...continuing',curCookieClientId);
        callback();
        return
    } catch (e) {
        ConsoleLogIfRequired((new Date()).getTime() + ' ' + memento.screenshotURI + ' does not exist...generating');
        ConsoleLogIfRequired(memento.screenshotURI + 'does not exist, generating...');
    }

    ConsoleLogIfRequired('About to start screenshot generation process for ' + uri);
    constructSSE('Starting screenshot generation process for -> ' + uri,curCookieClientId);
    constructSSE('...',curCookieClientId);

    headless(uri, screenshotsLocation + filename, refreshMemento).then(v => {
        //Once all the async parts finish this prints.
        console.log("Finished Headless");
        constructSSE('Done capturing the screenshot.',curCookieClientId)

        fs.chmodSync('./'+screenshotsLocation + filename, '755')
        im.convert(['./'+screenshotsLocation + filename, '-thumbnail', '200',
            './'+screenshotsLocation + (filename.replace('.png', '_200.png'))],
        function (err, stdout) {
            if (err) {
                ConsoleLogIfRequired('We could not downscale ./'+screenshotsLocation + filename + ' :(');
            }

            ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout);
        });

        ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri);
        response.write("");
        if(callback) {callback();}
    });
}

/**
* Loads given uri in a virtual google chrome browser using Puppeteer
* 
* @param uri - uri to load
* @param filepath - path to store screenshot
* @param refreshMemento - boolean variable that controls screenshot wait time (wait longer if called from refresh memento)
*/
async function headless(uri,filepath,refreshMemento) {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        executablePath: 'google-chrome',
        args: ['--no-sandbox']
        //headless: false,
    });
    const page = await browser.newPage();
    page.emulate({
        viewport: {
            width: 1024,
            height: 768,
        },
        userAgent: "memento-damage research ODU <@WebSciDL>",
    });

    var wait;
    if(refreshMemento) {
        wait = 'networkidle0'
    } else {
        wait = 'domcontentloaded'
    }

    try {
        // track failed responses ~ Security blocks, etc.
        page.on('requestfailed', request => {
            if(request.response()) {
                console.log(request.url, request.response().status);
            } else {
                console.log(request.url, request.response());
            }
        });

        page.on('response', response => {
            console.log(response.url, response.status, response.headers);
        });

        // timeout at 5 minutes (5 * 60 * 1000ms), wait until all dom content is loaded
        await page.goto(uri, {
            waitUntil: wait,
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





/**
* Take screenshot of given memento using Phantom
* 
* @param memento - memento to take screenshot of
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.createScreenshotForMementoWithPhantom = function (curCookieClientId,memento, callback) {
    var uri = memento.uri;
    ConsoleLogIfRequired('********** curCookieClientId in createScreenshotForMementoWithPhantom -> '+curCookieClientId+'***************');

    var regExpForDTStr = /\/\d{14}id_\/|\d{14}\// ;//to match something lile /12345678912345id_/
    var matchedString = uri.match(regExpForDTStr);
    if(matchedString != null) {
        uri = uri.replace(matchedString[0],(matchedString[0].toString().replace(/id_\/$|\/$/,"if_/"))); // by default only the first occurance is replaced
    }

    //uri = uri.replace("id_/http","/http");
    //uri = uri.replace("/http","if_/http");

    var filename = memento.screenshotURI;

    try {
        fs.openSync(
        path.join(__dirname + '/'+screenshotsLocation + memento.screenshotURI),
        'r', function (e, r) {
            ConsoleLogIfRequired(e);
            ConsoleLogIfRequired(r);
        });
        constructSSE(memento.screenshotURI + ' already exists...',curCookieClientId);
        ConsoleLogIfRequired(memento.screenshotURI + ' already exists...continuing');
        callback();
        return
    }catch (e) {
        ConsoleLogIfRequired((new Date()).getTime() + ' ' + memento.screenshotURI + ' does not exist...generating');
        ConsoleLogIfRequired(memento.screenshotURI + 'does not exist, generating...');
    }

    var options = {
            'phantomConfig': {
            'ignore-ssl-errors': true,
            'local-to-remote-url-access': true // ,
            // 'default-white-background': true,
        },
        // Remove the Wayback UI
        'onLoadFinished': function () {
            document.getElementById('wm-ipp').style.display = 'none';
        }
    }

    ConsoleLogIfRequired('About to start screenshot generation process for ' + uri);
    constructSSE('Starting screenshot generation process for -> ' + uri,curCookieClientId);
    constructSSE('...',curCookieClientId);

    webshot(uri, screenshotsLocation + filename, options, function (err) {
        if (err) {
            ConsoleLogIfRequired('Error creating a screenshot for ' + uri);
            ConsoleLogIfRequired(err);
            callback('Screenshot failed!');
        } else {
            constructSSE('Done capturing the screenshot.',curCookieClientId)
            fs.chmodSync('./'+screenshotsLocation + filename, '755')
            im.convert(['./'+screenshotsLocation + filename, '-thumbnail', '200',
                './'+screenshotsLocation + (filename.replace('.png', '_200.png'))],
                function (err, stdout) {
                    if (err) {
                    ConsoleLogIfRequired('We could not downscale ./'+screenshotsLocation + filename + ' :(');
                    }

                    ConsoleLogIfRequired('Successfully scaled ' + filename + ' to 200 pixels', stdout);
                }
            );
            ConsoleLogIfRequired('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri);
            callback();
        }
    });
}



/**
* Calculates hamming distances between mementos and evaluates if unique or not based off of the hdt request parameter provided
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.calculateHammingDistancesWithOnlineFilteringForSummary = function (curCookieClientId,callback) {
    console.time('Hamming And Filtering, a synchronous operation');
    constructSSE('computing the Hamming Distance and Filtering synchronously...',curCookieClientId);

    var lastSignificantMementoIndexBasedOnHamming = 0;
    var copyOfMementos = [this.mementos[0]];
    var dummySimhash = "00000000000000000000000000000000";
    //ConsoleLogIfRequired('Calculate hamming distance of ' + this.mementos.length + ' mementos')
    var thisHammingDistanceThreshold = this.hammingdistancethreshold;

    // if hamming distance was negative, take only the first, center, and last unnique
    if(thisHammingDistanceThreshold < 0) {
        // set hamming distance back to positive to be used
        thisHammingDistanceThreshold = thisHammingDistanceThreshold * -1;
    }

    for (var m = 0; m < this.mementos.length; m++) {
        // ConsoleLogIfRequired("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
        // ConsoleLogIfRequired("...with SimHash: "+this.mementos[m].simhash)
        if (m > 0) {
            if ( this.mementos[m].simhash == null || this.mementos[m].simhash == dummySimhash  ||(this.mementos[m].simhash.match(/0/g) || []).length === 32) { // added the null condition if the simhash is set to null because of error in connection
                ConsoleLogIfRequired('0s, returning');
                continue;
            }
            // ConsoleLogIfRequired("Calculating hamming distance")
            this.mementos[m].hammingDistance = getHamming(this.mementos[m].simhash, this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash);
            // ConsoleLogIfRequired("Getting hamming basis")
            this.mementos[m].hammingBasis = this.mementos[lastSignificantMementoIndexBasedOnHamming].datetime;
            this.mementos[m].hammingBasisURI= this.mementos[lastSignificantMementoIndexBasedOnHamming].uri;

            // ConsoleLogIfRequired('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
            //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
            //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

            if (this.mementos[m].hammingDistance >=  thisHammingDistanceThreshold) { // Filter the mementos if hamming distance is too small
                lastSignificantMementoIndexBasedOnHamming = m;

                 copyOfMementos.push(this.mementos[m]); // Only push mementos that pass threshold requirements
            }
            // ConsoleLogIfRequired(t.mementos[m].uri+" hammed!")
        } else if (m === 0) {
            ConsoleLogIfRequired('m==0, continuing');
        }
    }

    // if hamming distance was negative, only 3 unique mementos
    if(this.hammingdistancethreshold < 0) {
        var noOfUniqueMementos = 3;
    } else {
        var noOfUniqueMementos = copyOfMementos.length;
    }

    var totalMementos = this.mementos.length;
    constructSSE('Completed filtering...',curCookieClientId);
    //constructSSE('Out of the total <h3>'+totalMementos+'</h3> existing mementos, <h3>'+noOfUniqueMementos +'</h3> mementos are considered to be unique...',curCookieClientId);
    constructSSE('mementos are considered to be unique...<h3>'+noOfUniqueMementos +'</h3> existing mementos,<h3>'+totalMementos+'</h3> Out of the total' ,curCookieClientId);
    //ConsoleLogIfRequired((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
    //this.mementos = copyOfMementos; // currentchange 04 june 18
    copyOfMementos = null;

    ConsoleLogIfRequired("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------");
    ConsoleLogIfRequired(JSON.stringify(this.mementos));
    //ConsoleLogIfRequired(this.mementos)
    ConsoleLogIfRequired("----------------------------------------------------------------------------------------------------------------------------------------------");
    if (callback) { callback(''); }
}



/**
* Calculates list of hamming distances to provide to the front-end
* With each hamming distance calculated, number of mementos considered to be unique for that threshold are stored in a hashmap appropriately
* Higher hamming distances mean less mementos but more unique and vice versa
*
* @param callback - The next procedure to execution when this process concludes
*/
TimeMap.prototype.calculateHammingDistancesWithOnlineFiltering = function (curCookieClientId,callback) {
    console.time('Hamming And Filtering, a synchronous operation')
    constructSSE('computing the Hamming Distance and Filtering synchronously...',curCookieClientId);
    var lastNoOfUniqueMementos = 0;
    var lastHdtRangeVar = 0;
    var curMementoDetArray = [];
    var hdtRangeVar = 0,totalMementos=0,noOfUniqueMementos=0;
    var dummySimhash = "00000000000000000000000000000000";
    for(var i=2; i<= 12; i++ ) { // do the computation fot the threshold from k =3 to k=12
        hdtRangeVar = i;
        curMementoDetArray = [];
        curMementoDetArray =  JSON.parse(JSON.stringify(this.mementos));

        var lastSignificantMementoIndexBasedOnHamming = 0;
        var copyOfMementos = [this.mementos[0]];

        //ConsoleLogIfRequired('Calculate hamming distance of ' + this.mementos.length + ' mementos')
        for (var m = 0; m < curMementoDetArray.length; m++) {
            // ConsoleLogIfRequired("Analyzing memento "+m+"/"+this.mementos.length+": "+this.mementos[m].uri)
            // ConsoleLogIfRequired("...with SimHash: "+this.mementos[m].simhash)
            if (m > 0) {
                if ( curMementoDetArray[m].simhash == null || curMementoDetArray[m].simhash == dummySimhash || (curMementoDetArray[m].simhash.match(/0/g) || []).length == 32) { // added the null condition if the simhash is set to null because of error in connection
                    ConsoleLogIfRequired('0s, returning');
                    continue;
                }
                // ConsoleLogIfRequired("Calculating hamming distance")
                curMementoDetArray[m].hammingDistance = getHamming(curMementoDetArray[m].simhash, curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].simhash);
                // ConsoleLogIfRequired("Getting hamming basis")
                curMementoDetArray[m].hammingBasis = curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].datetime;
                curMementoDetArray[m].hammingBasisURI= curMementoDetArray[lastSignificantMementoIndexBasedOnHamming].uri;

                // ConsoleLogIfRequired('Comparing hamming distances (simhash,uri) = ' + this.mementos[m].hammingDistance + '\n' +
                //   ' > testing: ' + this.mementos[m].simhash + ' ' + this.mementos[m].uri + '\n' +
                //   ' > pivot:   ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].simhash + ' ' + this.mementos[lastSignificantMementoIndexBasedOnHamming].uri)

                if (curMementoDetArray[m].hammingDistance >= hdtRangeVar) { // Filter the mementos if hamming distance is too small
                    lastSignificantMementoIndexBasedOnHamming = m;

                    copyOfMementos.push(curMementoDetArray[m]); // Only push mementos that pass threshold requirements
                }

                // ConsoleLogIfRequired(t.mementos[m].uri+" hammed!")
            } else if (m === 0) {
                ConsoleLogIfRequired('m==0, continuing');
            }
        }
        noOfUniqueMementos = copyOfMementos.length;
        totalMementos = curMementoDetArray.length;
        constructSSE('Completed filtering...',curCookieClientId);
        constructSSE('Out of the total <h3>'+totalMementos+'</h3> existing mementos, <h3>'+noOfUniqueMementos +'</h3> mementos are considered to be unique for hamming distance:'+ hdtRangeVar +' ...',curCookieClientId);
        //ConsoleLogIfRequired((this.mementos.length - copyOfMementos.length) + ' mementos trimmed due to insufficient hamming, ' + this.mementos.length + ' remain.')
        copyOfMementos = null;

        if(noOfUniqueMementos >= 1) { // have to change it to minimum threshold based on the feedback from meeting
            if( !this.menentoDetForMultipleKValues.has(hdtRangeVar)) {
                this.menentoDetForMultipleKValues.set(hdtRangeVar,curMementoDetArray);
            }
            if( !this.statsHashMapObj.has(hdtRangeVar)) {

                var curStatObj = {};
                curStatObj["threshold"] = hdtRangeVar;
                curStatObj["totalmementos"] = totalMementos;
                curStatObj["unique"] = noOfUniqueMementos;
                this.statsHashMapObj.set(hdtRangeVar,curStatObj);
            }
        }
        if(noOfUniqueMementos <= 1 ) {
            break;
        }
        if(lastNoOfUniqueMementos != noOfUniqueMementos) {
            lastHdtRangeVar = hdtRangeVar;
        }
        lastNoOfUniqueMementos = noOfUniqueMementos;
    }

    // if last set of unique mementos is too large
    if(lastNoOfUniqueMementos > 9) {

        noOfUniqueMementos = 3; // give the user an option of only 3 unique

        // take last calculated hamming distance and multiply by -1
        // negative hamming distance means take first, center, and last unique mementos
        // this gives the user the option of only laoding 3 unique mementos
        hdtRangeVar = lastHdtRangeVar * -1;

        if( !this.menentoDetForMultipleKValues.has(hdtRangeVar)) {
            this.menentoDetForMultipleKValues.set(hdtRangeVar,curMementoDetArray);
        }
        if( !this.statsHashMapObj.has(hdtRangeVar)) {

            var curStatObj = {};
            curStatObj["threshold"] = hdtRangeVar;
            curStatObj["totalmementos"] = totalMementos;
            curStatObj["unique"] = noOfUniqueMementos;
            this.statsHashMapObj.set(hdtRangeVar,curStatObj);
        }
    }

    if(this.menentoDetForMultipleKValues.has(this.hammingdistancethreshold)) {
        this.mementos =  JSON.parse(JSON.stringify(this.menentoDetForMultipleKValues.get(this.hammingdistancethreshold))); // to get the Memento object corresponsing to actual hdt sent
    } else {
        this.mementos =  JSON.parse(JSON.stringify(this.menentoDetForMultipleKValues.get(2))); // to get the Memento object corresponsing to actual hdt sent
    }

    ConsoleLogIfRequired("------------ByMahee-- After the hamming distance is calculated, here is how the mementos with additional details look like ------------------");
    ConsoleLogIfRequired("--------------------------------------For threshold value 2------------------------------------------------");
    ConsoleLogIfRequired(JSON.stringify(this.menentoDetForMultipleKValues.get(2)));
    ConsoleLogIfRequired("=================================================");
    ConsoleLogIfRequired(JSON.stringify(this.statsHashMapObj.get(2)))
    ConsoleLogIfRequired("=================================================");


    ConsoleLogIfRequired("--------------------------------------For threshold value 5------------------------------------------------");

    ConsoleLogIfRequired(JSON.stringify(this.menentoDetForMultipleKValues.get(5)));
    ConsoleLogIfRequired("=================================================");
    ConsoleLogIfRequired(JSON.stringify(this.statsHashMapObj.get(5)));
    ConsoleLogIfRequired("=================================================");

    //ConsoleLogIfRequired(this.mementos)
    ConsoleLogIfRequired("--------------------------------------End of calculateHammingDistancesWithOnlineFiltering ------------------------------------------------");
    if (callback) { callback(''); }
}


/**********************************
    RELEVANT yet ABSTRACTED generic functions
********************************* */

/**
* Calculates number of characters different in each string
* Both str1 and str2 MUST be of equal lengths
*/
function getHamming (str1, str2) {
    if (str1.length !== str2.length) {
        ConsoleLogIfRequired('Oh noes! Hamming went awry! The lengths are not equal!');
        ConsoleLogIfRequired(str1 + ' ' + str2 + ' ' + str1.length + ' ' + str2.length);

        // ^Throw "Unequal lengths when both strings must be equal to calculate hamming distance."

        // Resilience instead of crashing
        ConsoleLogIfRequired('Unequal lengths when both strings must be equal to calculate hamming distance.');
        return 0;
    } else if (str1 === str2) {
        return 0;
    }

    var d = 0
    for (var ii = 0; ii < str1.length; ii++) {
        if (str1[ii] !== str2[ii]) { d++; }
    }

    return d;
}

/**
* Checks how many screenshots exist in the screenshot directory
*
* @param selectedMementosList - array holding mementos to check
*/
function getNotExistingCapturesCount(selectedMementosList) {
    //console.log("------------------------inside getExistingCapturesCount ---------------")
    // console.log(selectedMementosList)
    var count = 0 ;
    selectedMementosList.forEach(function (memento,m) {
        //  console.log(__dirname + '/'+screenshotsLocation + memento.screenshotURI);
        if (!fs.existsSync(__dirname + '/'+screenshotsLocation + memento.screenshotURI)) {
            count ++;
        }
    });
    //console.log("------------------------inside getExistingCapturesCount ---------------")

    return count;
}




/**
* Fischer-Yates shuffle so we don't fetch the memento in-order but preserve them as objects and associated attributes
*/
function shuffleArray (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

/* 
*********************************
    UTILITY FUNCTIONS
*********************************
TODO: break these out into a separate file
*/

/**
* Graceful exit
*/
process.on('SIGINT', function () {
    ConsoleLogIfRequired('\nGracefully shutting down from SIGINT (Ctrl-C)');
    process.exit();
})

/**
* Prevents program from crashing in event of an unhandledRejection from a promise
* It handles such events by ending the response
*/
process.on('unhandledRejection', (reason, p) => {
    ConsoleLogIfRequired('Unhandled Rejection at: Promise');
    responseDup.end();
});

// Useful Functions

/**
* Checks if given number is binary
*
* @param n - given number
*/
function checkBin (n) {
    //  return /^[01]{1, 64}$/.test(n)
    // ByMahee -- the above statement is being changed to the following as we are checking 4 bits at a time
    //ConsoleLogIfRequired("Inside Check Binary")
    return /^[01]{1,4}$/.test(n);
}

/**
* Checks if given number is decimal
*
* @param n - given number
*/
function checkDec (n) {
    return /^[0-9]{1, 64}$/.test(n);
}

/**
* Checks if given number is hex
*
* @param n - given number
*/
function checkHex (n) {
    return /^[0-9A-Fa-f]{1,64}$/.test(n);
}

/**
* Pad binary string during conversion
*
* @param s - string to pad
* @param z - padding size
*/
function pad (s, z) {
    s = '' + s;
    return s.length < z ? pad('0' + s, z):s;
}

/**
* Unpad binary string during conversion by getting rid of all '0' occurances
*
* @param s - string to unpad
*/
function unpad (s) {
    s = '' + s;
    return s.replace(/^0+/, '');
}

// Decimal operations

/**
* Converts given number from decimal to binary
*
* @param n - given number
*/
function Dec2Bin (n) {
    if (!checkDec(n) || n < 0) {
        return 0;
    }

    return n.toString(2);
}

/**
* Converts given number from decimal to hex
*
* @param n - given number
*/
function Dec2Hex (n) {
    if (!checkDec(n) || n < 0) {
        return 0;
    }

    return n.toString(16);
}

// Binary Operations

/**
* Converts given number from binary to decimal
*
* @param n - given number
*/
function Bin2Dec (n) {
    if (!checkBin(n)) {
        return 0;
    }

    return parseInt(n, 2).toString(10);
}

/**
* Converts given number from binary to hex
*
* @param n - given number
*/
function Bin2Hex (n) {
    if (!checkBin(n)) {
        return 0;
    }

    return parseInt(n, 2).toString(16);
}

// Hexadecimal Operations

/**
* Converts given number from hex to binary
*
* @param n - given number
*/
function Hex2Bin (n) {
    if (!checkHex(n)) {
        return 0;
    }

    return parseInt(n, 16).toString(2);
}

/**
* Converts given number from hex to decimal
*
* @param n - given number
*/
function Hex2Dec (n) {
    if (!checkHex(n)) {
        return 0;
    }

    return parseInt(n, 16).toString(10);
}

/**
* Retrieves hex value for given binary string
*
* @param onesAndZeros - binary string
*/
function getHexString (onesAndZeros) {
    var str = '';
    for (var i = 0; i < onesAndZeros.length; i = i + 4) {
        str += Bin2Hex(onesAndZeros.substr(i, 4));
    }

    return str;
}

/**
* Removes "id_" string from given uri using the given regular expression
*
* @param regExpForDTStr - givven regular expression
* @param uri - uri to modify
*/
function prependWithIDHelper(regExpForDTStr, uri) {
    var matchedString = uri.match(regExpForDTStr);
    if(matchedString != null) {
        uri = uri.replace(matchedString[0],(matchedString[0].toString().replace("id_",""))); // by default only the first occurance is replaced
    }
    return uri;
}

/**
* Logs messages to console if isDebugMode is set to true
*
* @param msg - message to log
*/
function ConsoleLogIfRequired(msg) {
    if(isDebugMode) {
        console.log(msg);
    }
}

/* *********************************
    end UTILITY FUNCTIONS
********************************* */

exports.main = main
main()
// test commit into Branch CLI_JSON
