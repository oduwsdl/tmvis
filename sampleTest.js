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

/* *******************************
   TODO: reorder functions (main first) to be more maintainable 20141205
****************************** */

/**
* Start the application by initializing server instances
*/
function main () {

   setSimhash();

}



 function setSimhash() {
  // Retain the URI-R for reference in the promise (this context lost with async)

    //var thaturi = "http://wayback.archive-it.org/1068/20160404195045id_/http://4genderjustice.org/"
    var thaturi = "http://wayback.archive-it.org/1068/20160404201837id_/http://4genderjustice.org/"
    //var thaturi = "http://wayback.archive-it.org/1068/20160704195513id_/http://4genderjustice.org/"


    var mOptions = url.parse(thaturi)
    var buffer2 ="";
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

      if (res.statusCode !== 200) { // setting the simhash to be '0000000' for all the mementos which has a status of non 200
        thatmemento.simhash = Memento.prototype.simhashIndicatorForHTTP302
      }

      res.on('end', function (d) {

        /*** ByMahee -- commented the following block as the client and server doesn't have to be in publish and subscribe mode
        //var md5hash = md5(thatmemento.originalURI) // URI-R cannot be passed in the raw*/
        console.log("========================================================")
        console.log("-- By Mahee -- Inside On response end of http request of setSimhash")
        console.log("ByMahe -- here is the buffer content of " +mOptions.host+mOptions.path+":")
        console.log(buffer2)
        console.log("************************************************************")
        console.log("Buffer Length ("+mOptions.host + mOptions.path +"):-> "+ buffer2.length)
        if (buffer2.indexOf('Got an HTTP 302 response at crawl time') === -1) {

          var sh = simhash((buffer2).split('')).join('')
         console.log("ByMahee -- computed simhash for "+mOptions.host+mOptions.path+" -> "+ sh)

          var retStr = getHexString(sh)
          if (!retStr || retStr === Memento.prototype.simhashIndicatorForHTTP302) {
            // Normalize so not undefined
            retStr = Memento.prototype.simhashIndicatorForHTTP30
          }

          buffer2 = ''
          buffer2 = null

        //  console.log("Hex Code for Simhash:"+retStr + ' & URI-R:' + mOptions.host + mOptions.path)

        console.log("Simhash Hex Converted ->:"+  retStr);
        console.log("========================================================")

        } else {
          // We need to delete this memento, it's a duplicate and a "soft 302" from archive.org
         //callback('isA302DeleteMe')
        }
      })

      res.on('error', function (err) {
        console.log('Error generating Simhash in Response')
      })
    })

    req.on('error', function (err) {
      console.log('Error generating Simhash in Request')
      console.log(err)
    //  console.log("-- By Mahee -- Inside On request error of http request of setSimhash")
    })

    req.end()
}

function getHexString (onesAndZeros) {
  var str = ''
  for (var i = 0; i < onesAndZeros.length; i = i + 4) {
    str += Bin2Hex(onesAndZeros.substr(i, 4))
  }

  return str
}

function Bin2Hex (n) {
  if (!checkBin(n)) {
    return 0
  }

  return parseInt(n, 2).toString(16)
}

// Useful Functions
function checkBin (n) {
//  return /^[01]{1, 64}$/.test(n)
// ByMahee -- the above statement is being changed to the following as we are checking 4 bits at a time
 //console.log("Inside Check Binary")
 return /^[01]{1,4}$/.test(n)
}


exports.main = main
main()
// test commit into Branch CLI_JSON
