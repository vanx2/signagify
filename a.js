#!/bin/env node

var detector = require('./lib/chromecastDetector.js');
var Client   = require('castv2-client').Client;
var CustomReciever = require('./lib/signageReciver.js');

detector.on('detect', function (cast){
  if ( cast.name.substr(0,8) != 'vanx' ){ return; }
  var client = new Client();
  client.on('error', function(err){console.log(err);});
  client.connect(cast.ip, watch);
  function watch() {
    client.getStatus(function (err, status){
console.log(status);
      if (status && status.hasOwnProperty('applications')){
        if (status.applications[0].appId != '0F5096E8' && 
            status.applications[0].appId != '5D393044' ){
          client.launch(CustomReciever, function(err, player) {
            player.on('status', function(status) {
              console.log('status broadcast playerState=%s', status.playerState);
              player.getStatus(function(err, status){
                console.log(status);
              });
            });
          });
        }
      }
    });
    client.timer = setTimeout(watch, 10*1000);
  }
});

detector.listen('daemon');

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

