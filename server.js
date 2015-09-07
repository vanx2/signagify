#!/bin/env node
var http = require('http');
var fs = require('fs');
var path = require('path');
var URL  = require('url');
var mediaPath = '/Library/WebServer/Documents/img';
var pathStr = '/';

http.createServer(function (req, res) {
  var query = URL.parse(req.url, true).query;
  var cb = (query.hasOwnProperty('callback')) ? query.callback : null;
  var fileList = [];
  function getFiles( dir ) {
    fs.readdirSync(  mediaPath + dir
/*
    ).sort(
    function(a, b){
      return fs.statSync(mediaPath + dir + pathStr + a).mtime.getTime() -
             fs.statSync(mediaPath + dir + pathStr + b).mtime.getTime();
    }
*/
    ).forEach(function (file) {
      if (fs.statSync( mediaPath + dir + pathStr + file).isDirectory()){
        getFiles( dir + pathStr + file );
      } else if (fs.statSync( mediaPath + dir + pathStr + file).isFile() &&
                 /\.(txt|mp4|png|gif|jpe?g)$/.test(file)) {
        fileList.push( dir.replace(RegExp(pathStr, 'g'), '/') + '/' + file);
      }
    });
  }
  getFiles( '' );
  res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
  res.end(cb ? cb + "(" + JSON.stringify(fileList) + ")"
                   : JSON.stringify(fileList));
}).listen(9000);

