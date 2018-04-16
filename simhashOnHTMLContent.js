var simhash = require('simhash')('md5');
var uri ='';
var fs = require('fs-extra');
const puppeteer = require('puppeteer');
const SCREENSHOT_DELTA = 2;
var async = require('async');
var urllib = require('url')
var http = require('http')
const args = process.argv;

function main () {
  //console.log(args[2]);
  uri =  args[2];
  console.log("Memento under test: "+ uri);
  getHTMLContent(uri,getHexString)
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
        //sh = simhash((buffer2).split('')).join('')
        console.log("<-----------------------------------------------------------> ")
        console.log(sh);
        console.log("<-----------------------------------------------------------> ")
        callback(sh);

      }
    })
    outputBuffer.on('error', function (err) {
      return "error";
      console.log('Error generating Simhash in Response')
    })
  })
}

function getHexString (onesAndZeros) {
  var str = ''
  for (var i = 0; i < onesAndZeros.length; i = i + 4) {
    str += Bin2Hex(onesAndZeros.substr(i, 4))
  }

  console.log("Hex Simhash: "+str);
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
 //ConsoleLogIfRequired("Inside Check Binary")
 return /^[01]{1,4}$/.test(n)
}


exports.main = main
main()



/*output:

Text under test:Hello, How are you ?
4-Gram converted Array:Hell,ello,llo,,lo, ,o, H,, Ho, How,How ,ow a,w ar, are,are ,re y,e yo, you,you ,ou ?
BinaryFormated 4-Gram Simhash:01011001111010001110010011001101110111010000100011001011010001001101010100011111111011110010110010000100010110010111000101001011
4-Gram Simhash Hex String:59e8e4cddd08cb44d51fef2c8459714b
Default word based simhash which is currently used in Archive Thumbnails:3a169817621900c7dd4029a379feaa82*/
