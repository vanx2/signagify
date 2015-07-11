#!/bin/env node

var Client         = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');
var detector = require('chromecast-detector');

detector.on('detect', function (cast){
  var client = new Client();
  client.connect( cast.ip, function() {
      client.getStatus(function(err, cstatus){
console.log(cstatus);
        var appId = cstatus.applications[0].appId;
        console.log('[appID]', appId);
            client.join(cstatus.applications[0], CustomReciever, function (err, player) {
                player.getStatus(function(err, pstatus){
console.log(err);
                  console.log(pstatus);
                });
            });
      });
  });
});
detector.listen('forever');

