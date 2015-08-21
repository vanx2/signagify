#!/bin/env node
var http = require('http');
var fs = require('fs');
var URL  = require('url');
var mediaPath = '/Library/WebServer/Documents/img/';

http.createServer(function (req, res) {
  var query = URL.parse(req.url, true).query;
  var cb = (query.hasOwnProperty('callback')) ? query.callback : null;
  fs.readdir(mediaPath, function(err, files){
    if (err) throw err;
    var fileList = [];
    files.filter(function(file){
      return fs.statSync(mediaPath + file).isFile() &&
             /\.(txt|mp4|png|gif|jpe?g)$/.test(file);
    }).sort(function(a, b) {
      return fs.statSync(mediaPath + a).mtime.getTime() - 
             fs.statSync(mediaPath + b).mtime.getTime();
    }).forEach(function (file) {
      fileList.push(file);
    });
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(cb ? cb + "(" + JSON.stringify(fileList) + ")"
                     : JSON.stringify(fileList));
  });
}).listen(9000);

