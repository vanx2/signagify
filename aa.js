#!/bin/env node

var Client         = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

var cast = {name: "vanx", ip: '192.168.1.71'};

  var client = new Client();
  client.connect(cast.ip, function() {
  client.getStatus(function(err, status){
      if (status.hasOwnProperty('applications') && status.applications[0].appId == CustomReciever.APP_ID ) {
        client.join(status.applications[0], CustomReciever, function (err, player) {
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

