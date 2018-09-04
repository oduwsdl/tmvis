var simhash = require('simhash')('md5');
var str1 ='';
var str2 ='';
var fs = require('fs-extra');
const puppeteer = require('puppeteer');
const SCREENSHOT_DELTA = 2;
var async = require('async');
var urllib = require('url')
var http = require('http')
const args = process.argv;

function main () {
  //console.log(args[2]);
  str1 =  args[2];
  str2 =  args[3];
  hammingDistance(str1, str2);
}

function hammingDistance(str1, str2){
  var hd=0;
  for( var i=0;i< str1.length;i++){
    if(str1[i] != str2[i]){
      hd++;
    }
  }
  console.log("Hamming Distance: "+hd)
}

exports.main = main
main()



/*output:

Text under test:Hello, How are you ?
4-Gram converted Array:Hell,ello,llo,,lo, ,o, H,, Ho, How,How ,ow a,w ar, are,are ,re y,e yo, you,you ,ou ?
BinaryFormated 4-Gram Simhash:01011001111010001110010011001101110111010000100011001011010001001101010100011111111011110010110010000100010110010111000101001011
4-Gram Simhash Hex String:59e8e4cddd08cb44d51fef2c8459714b
Default word based simhash which is currently used in Archive Thumbnails:3a169817621900c7dd4029a379feaa82*/
