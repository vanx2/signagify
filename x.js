#!/bin/env node

var Client         = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

var cast = {name: "vanx", ip: '192.168.1.61'};

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
        client.join(status.applications[0], CustomReciever, function (err, player) {
          player.on('status', function(status) {
            console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
              (status.hasOwnProperty('playerState')) ? status.playerState : status) ;
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



/*
          client.clientTimer = setInterval(function() {
            client.getStatus(function(err, status){
              if (status.hasOwnProperty('applications') && status.applications[0].appId == 'E8C28D3C'){
                player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true },function (){}); // todo
              } else if (status.applications[0].appId == CustomReciever.APP_ID) {
                player.getStatus(function(err, status){
                  console.log(status);
                });
              } else { console.log( '[CLIENT_APP]', status.applications[0].appId);}
            });
          }, 3000);
*/
