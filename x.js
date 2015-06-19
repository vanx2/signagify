#!/bin/env node

var Client                = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

var cast = {name: "vanx", ip: '192.168.1.66'};
  var client = new Client();
  client.on('error', function(err){console.log(err)});
  client.on('status', function(status){
    console.log('[CLIENT STATUS]', new Date().toLogFormat(), cast.name, 
      (status.hasOwnProperty('applications') && status.applications[0].hasOwnProperty('displayName') ) ? 
       status.applications[0].displayName : status);
  });
  client.connect(cast.ip, function() {
client.getStatus(function(err, status){
  if (status.hasOwnProperty('applications') && status.applications[0].appId == CustomReciever.APP_ID ) {
//    var player = new CustomReciever(client, status);
console.log(1);
    client.getSessions(function(){
console.log(2);
      client.join(status, CustomReciever, function (err, player) {
        player.getStatus(function(err, status){
          console.log(status);
        });
      });
    });
  }
});

  });

Date.prototype.toLogFormat = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};



