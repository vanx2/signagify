#!/bin/env node

var Client         = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

var cast = {name: "vanx", ip: '192.168.0.11'};

  var client = new Client();
  client.on('error', function(err){console.log(err)});
  client.on('status', function(status){
    console.log('[CLIENT STATUS]', new Date().toLogFormat(), cast.name, 
      (status.hasOwnProperty('applications') && status.applications[0].hasOwnProperty('displayName') ) ? 
       status.applications[0].displayName : status);
  });
  client.connect(cast.ip, function() {
    client.getStatus(function(err, status){
console.log(status);
      if (status.hasOwnProperty('applications') && status.applications[0].appId == CustomReciever.APP_ID ) {
        client.join(status.applications[0], CustomReciever, function (err, player) {
          player.on('status', function(s) {
            console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
              (s.hasOwnProperty('playerState')) ? s.playerState : s) ;
          });
          player.getStatus(function(err, s){
            console.log(s);
          });
        });
      }
    });
  });
function check(){
}
function detach(){
}
Date.prototype.toLogFormat = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};

