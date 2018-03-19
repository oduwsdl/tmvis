// this file to test few of the modules seperately

var fs = require('fs-extra');
const puppeteer = require('puppeteer');
const SCREENSHOT_DELTA =2;
var async = require('async');
var uri = 'http://wayback.archive-it.org/1068/20160104194954if_/http://4genderjustice.org/';
//var uri = 'http://wayback.archive-it.org/1068/20170114205127if_/http://4genderjustice.org/';

var phantom = require('node-phantom')
//var phantom = require('phantomjs')
var webshot = require('webshot') // PhantomJS wrapper

//usingPanthom(uri)
usingPupeteer(uri)

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

        page.on('error', error => {
            console.log("Error appeared");
            //throw error;
        });


        // timeout at 5 minutes (5 * 60 * 1000ms), wait until all dom content is loaded
        await page.goto(uri, {
            waitUntil: 'networkidle0',
            timeout: 0,
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
