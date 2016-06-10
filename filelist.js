#!/bin/env node
var config = require('config');
var https = require('https');
var fs = require('fs');
var path = require('path');
var URL  = require('url');
var finalhandler = require('finalhandler')
var serveStatic = require('serve-static')

var mediaPath = '/Library/WebServer/Documents/img';
//var mediaPath = 'Z:\\投稿受付';
var mediaPath = 'C:\\Users\\dig_signage\\Desktop\\Contents\\img';
var mediaPath = '/Users/van/Documents/work/signagify/pub';
var mediaPath = '/var/apps/signagify/pub';

var options = {
  key:    fs.readFileSync(config.ssl.key),
  cert:   fs.readFileSync(config.ssl.cert)
};

if(config.ssl.ca){options.ca = fs.readFileSync(config.ssl.ca);}
var serve = serveStatic(config.fileList.mediaPath);

https.createServer(options, function (req, res) {
  if ( URL.parse(req.url).pathname === "/" ) {
    var query = URL.parse(req.url, true).query;
  
    var cb = (query.hasOwnProperty('callback')) ? query.callback : null;
    var fileList = [];
    var textList = [];
    function getFiles( dir ) {
      fs.readdirSync( dir
/*
      ).sort(
      function(a, b){
        return fs.statSync( path.join(dir, a) ).mtime.getTime() -
               fs.statSync( path.join(dir, b) ).mtime.getTime();
      }
*/
      ).forEach(function (file) {
        var target = path.join(dir, file);
        if (fs.statSync(target).isDirectory()){
          getFiles(target);
        } else if (fs.statSync(target).isFile() &&
                   /^\.(txt|mp4|mpeg|png|gif|jpe?g)$/i.test(path.extname(target))) {
          var url = target.replace(config.fileList.mediaPath + path.sep, "").split(path.sep).join('/');
          if ( /^\.(txt)$/i.test(path.extname(file)) ) {
            textList.push( fs.readFileSync(target).toString() );
//              { "name": file.replace(/\.txt$/i, ""), 
//                "text": fs.readFileSync(target).toString() }
//            );
          } else if (/^\.(mp4|mpe?g)$/i.test(path.extname(file)) ){
            fileList.push(
              { "type": "VIDEO",
                "url": url}
            );
          } else if (/^\.(png|gif|jpe?g)$/i.test(path.extname(file))) {
            var sec = file.split(/\./)[file.split(/\./).length - 2];
            fileList.push(
              { "type": "IMAGE",
                "url": url,
                "sec": ( ( isFinite(sec) )  ? ( 0 + sec ) : 10 )
              }
            );
          }
        }
      });
    }
    getFiles( config.fileList.mediaPath.replace(RegExp(path.sep + '$'), '') );
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    var body = JSON.stringify(
      fileList ,  textList 
    );
    res.end( ( (cb) ? cb + "(" : "" ) + JSON.stringify(fileList) + "," + JSON.stringify(textList) +
             ( (cb) ? ")" : "" ) );
  } else {
    var done = finalhandler(req, res);
    serve(req, res, done);
  }
}).listen(config.fileList.port);

