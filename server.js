#!/bin/env node
var http = require('http');
var fs = require('fs');
var path = require('path');
var URL  = require('url');
var mediaPath = '/Library/WebServer/Documents/img';
var mediaPath = 'Z:\\投稿受付';
var mediaPath = 'C:\\Users\\dig_signage\\Desktop\\Contents\\img';

http.createServer(function (req, res) {
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
                 /^\.(txt|mp4|png|gif|jpe?g)$/.test(path.extname(target))) {
        fileList.push( target.replace(mediaPath + path.sep, "").split(path.sep).join('/') );
      }
    });
  }
  getFiles( mediaPath.replace(RegExp(path.sep + '$'), '') );
  res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
  res.end(cb ? cb + "(" + JSON.stringify(fileList) + ")"
                   : JSON.stringify(fileList));
}).listen(9000);

