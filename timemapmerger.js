var http = require('http')
var express = require('express')
var url = require('url')
var async = require('async')
var mementoFramework = require('./lib/mementoFramework.js')
var Memento = mementoFramework.Memento
var TimeMap = mementoFramework.TimeMap
var SimhashCacheFile = require('./lib/simhashCache.js').SimhashCacheFile
var uri1 ="http://epa.gov/smartway/smartway-carbon-accounting-and-reporting"
var uri2 ="https://www.epa.gov/smartway/smartway-sustainability-accounting-and-reporting"
var mergedMementoArry =[]
  async.series([
    function (callback) { fetchTimemap(uri1,callback)},
    function (callback) {fetchTimemap(uri2,callback)},
  ],
    function (err, result) {
        if (err) {
          console.log('ERROR!')
          console.log(err)
        } else {
          console.log('There were no errors executing the callback chain')
          mergedMementoArry.sort(function(m1, m2){ // sort object by datetime field
          	return ((new Date(m1["datetime"])).getTime()-(new Date(m2["datetime"])).getTime())
          })
        console.log(JSON.stringify(mergedMementoArry))
      }
    }
  )


  function fetchTimemap (uri,callback) {

    var timemapHost = 'web.archive.org'
    var timemapPath = '/web/timemap/link/' + uri
    var buffer ="";

    var options = {
      'host': timemapHost,
      'path': timemapPath,
      'port': 80,
      'method': 'GET'
    }

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
          ConsoleLogIfRequired(t.mementos);
          ConsoleLogIfRequired("---------------------------------------------------")
          mergedMementoArry = mergedMementoArry.concat(t.mementos);
          if (t.mementos.length === 0) {
            ConsoleLogIfRequired('There were no mementos for ' + uri + ' :(')
            response.write('There were no mementos for ' + uri + ' :(')
            response.end()
              return
          }


          //ConsoleLogIfRequired('Fetching HTML for ' + t.mementos.length + ' mementos.')
          callback('')

        }else{
          ConsoleLogIfRequired('The page you requested has not been archived.')
          //  response.write('The page you requested has not been archived.')
          //  response.end()
             return

        }
      })
    })

    req.on('error', function (e) { // Houston...
      ConsoleLogIfRequired('problem with request: ' + e.message)
      ConsoleLogIfRequired(e)
      if (e.message === 'connect ETIMEDOUT') { // Error experienced when IA went down on 20141211
        ConsoleLogIfRequired('Hmm, the connection timed out. Internet Archive might be down.')
        // response.write('Hmm, the connection timed out. Internet Archive might be down.')
        // response.end()
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
  }


  function ConsoleLogIfRequired(msg){
    if(true){
      console.log(msg);
    }
  }
