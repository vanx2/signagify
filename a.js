#!/bin/env node

var detector = require('./lib/chromecastDetector.js');
var Client   = require('castv2-client').Client;
var CustomReciever = require('./lib/dev.js');

detector.on('detect', function (cast){
  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
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
console.log(err);
            player.on('status', function(status) {
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

