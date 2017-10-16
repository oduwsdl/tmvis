'use strict'
/* ************************************
*  AlSummarization
*  An implementation for Ahmed AlSum's ECIR 2014 paper:
*   "Thumbnail Summarization Techniques for Web Archives"
*  Mat Kelly <mkelly@cs.odu.edu>
*
/**************************************
* Runs with node AlSummarization_CLI_ScreenShot.js URI-R
* using the existing code and tweeking it to the code that captures the screenshot of the URI-M passed as System Argument and saves it in screenshots folder.
*  Run this with:
*    > node AlSummarization_CLI_ScreenShot.js URI-M
*
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



var colors = require('colors')
var im = require('imagemagick')
var rimraf = require('rimraf')

//var faye = require('faye') // For status-based notifications to client

// Faye's will not allow a URI-* as the channel name, hash it for Faye
var md5 = require('md5')

/* *******************************
   TODO: reorder functions (main first) to be more maintainable 20141205
****************************** */

/**
* Start the application by initializing server instances
*/
function captureScreenShot (uriToCapture) {
  console.log(('*******************************\r\n' +
               'THUMBNAIL SUMMARIZATION MEMENTO SCREENSHOT SERVICE\r\n' +
               '*******************************').blue)
  var endpoint = new CLIEndpoint()
  endpoint.headStart(uriToCapture)
}


/**
* Setup the public-facing attributes of the service
*/
function CLIEndpoint () {


  // this is method this.respondToClient, modified for CLI
  this.headStart = function (uriToCapture) {

    var URIMFromCLI = uriToCapture;

    //
    // if (process.argv.length <= 2) {
    //     console.log('No Argument was passed.. please pass full URI-M')
    //     return
    // }else{
    //     URIMFromCLI = process.argv[2]
    // }



    console.log('URI-M From CLI: ' + URIMFromCLI)

    var query = url.parse(URIMFromCLI, true).query
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

  createScreenshotForPassesURIM(URIMFromCLI)

  function createScreenshotForPassesURIM(URIMFromCLI) {
      var urim = URIMFromCLI
      var filename = 'alSum_' + urim.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.png'  // Sanitize URI->filename

      try {
        fs.openSync(
          path.join(__dirname + '/screenshots/' + filename),
          'r', function (e, r) {
            console.log(e)
            console.log(r)
          })

        console.log(filename + ' already exists...continuing')
        return
      }catch (e) {
        console.log((new Date()).getTime() + ' ' + filename + ' does not exist...generating')
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

      console.log('About to start screenshot generation process for ' + urim)
      webshot(urim, 'screenshots/' + filename, options, function (err) {
        if (err) {
          console.log('Error creating a screenshot for ' + urim)
          console.log(err)
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

          console.log('t=' + (new Date()).getTime() + ' ' + 'Screenshot created for ' + urim)
        }
      })
    }
  }
}


module.exports.captureScreenShot = {
  CaptureScreenShot : captureScreenShot
}
