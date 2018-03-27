// this file to test few of the modules seperately

var fs = require('fs-extra');
const puppeteer = require('puppeteer');
const SCREENSHOT_DELTA =30;
var async = require('async');
var urllib = require('url')
var http = require('http')
var simhash = require('simhash')('md5')

//var uri = 'http://wayback.archive-it.org/1068/20160104194954if_/http://4genderjustice.org/'; // the URI that crashes the page
var uri = 'http://wayback.archive-it.org/1068/20170114205127if_/http://4genderjustice.org/';

var phantom = require('node-phantom')
//var phantom = require('phantomjs')
var webshot = require('webshot') //phantomJS wrapper
var sh ="";


getHTMLContent(uri,usingPupeteer)
//readFileContents(__dirname+"/dummy.html",uri,usingPupeteer);
//usingPanthom(uri)
//usingPupeteer(uri)

function usingPanthom(uri){
  try{
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

    console.log('Panthom : About to start screenshot generation process for ' + uri)
    webshot(uri,__dirname+'/assets/screenshots/dummy.png', options, function (err) {
      if (err) {
        console.log('Error creating a screenshot for ' + uri)
        console.log(err)
        throw err;
      } else {

        fs.chmodSync('./assets/screenshots/dummy.png', '755')
        console.log('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
      }
    })
  }catch(err){
      console.log(uri," Failed with error:", err);
  }

}

function usingPupeteer(uri){
  console.log('Puppeteer : About to start screenshot generation process for ' + uri)
  headless(uri, __dirname+'/assets/screenshots/dummy.png').then(v => {
      // Once all the async parts finish this prints.
      console.log("Finished Headless");

      fs.chmodSync(__dirname+'/assets/screenshots/dummy.png', '755')

      console.log('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + uri)
  }).catch(function (error) {
    console.log("Inside catch block ");
    console.error(error)
  });
}

function getHTMLContent(uri,callback){
  var mOptions = urllib.parse(uri)
  var buffer2 = ''
  console.log("making http call for "+mOptions.host+mOptions.path+"...")

  var req = http.request({
    'host': mOptions.host,
    'path': mOptions.path,
    'port':80,
    'headers': {'User-Agent': 'TimeMap Summarization instance - Contact (@WebSciDL)Twitter, (@maheedhargunnam)Twitter'}
  }, function (res) {

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
    outputBuffer.on('data', function (data) {
      buffer2 += data.toString()
    })
    outputBuffer.on('end', function (d) {
      if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1 ) {
      //  sh = simhash((buffer2).split('')).join('')
        sh = buffer2;
        console.log("<-----------------------------------------------------------> ")
        console.log(sh);
        console.log("<-----------------------------------------------------------> ")
        callback(uri);

      }
    })
    outputBuffer.on('error', function (err) {
      return "error";
      console.log('Error generating Simhash in Response')
    })
  })
}


function readFileContents(path,uri, callback) {
  console.log("Inside readFileContents");
  fs.readFile(path, 'utf-8', function(err,data){
    if(err) {
        console.log("Error reading contents on the file path ->"+ path);
    }
    sh = data;
    console.log("<-----------------------------------------------------------> ")
    console.log(sh);
    console.log("<-----------------------------------------------------------> ")
    callback(uri);
  });
};



async function headless(uri,filepath) {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
          args: ['--no-sandbox']
        // headless: false,
    });

    // var sh = await getHTMLContent(uri);
    // console.log("simhash string = "+ sh);

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

        page.on('error', error => {
            console.log("Error appeared");
            console.log(error);
            //throw error;
        });


        // timeout at 5 minutes (5 * 60 * 1000ms), wait until all dom content is loaded
        // await page.goto(uri, {
        //     waitUntil: 'networkidle0',
        //     timeout: 0,
        // });
      //  var html="<html><body><h3>Hello there :) <br/>"+ sh +"</h3></body></html>";
        var html= sh;
        await page.setContent(html);

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
