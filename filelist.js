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
  if (req.url === "/") {
    var query = URL.parse(req.url, true).query;
  
    var cb = (query.hasOwnProperty('callback')) ? query.callback : null;
    var fileList = [];
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
                   /^\.(txt|mp4|png|gif|jpe?g)$/i.test(path.extname(target))) {
          fileList.push(
            target.replace(config.fileList.mediaPath + path.sep, "").split(path.sep).join('/') );
        }
      });
    }
    getFiles( config.fileList.mediaPath.replace(RegExp(path.sep + '$'), '') );
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(cb ? cb + "(" + JSON.stringify(fileList) + ")"
                     : JSON.stringify(fileList));
  } else {
    var done = finalhandler(req, res);
    serve(req, res, done);
  }
}).listen(config.fileList.port);

