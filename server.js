#!/bin/env node
var detector = require('chromecast-detector');
var Client   = require('castv2-client').Client;
var CustomReciever = require('castv2-client').DefaultMediaReceiver;
CustomReciever.APP_ID = 'CA38BAF1'; // my custome receiver
CustomReciever.APP_ID = '5D393044'; // my custome receiver

detector.on('detect', function (cast){
  if ( cast.name.substr(0,4) != 'vnew' ){ return; }
console.log(cast.name);
  var client = new Client();
  client.on('error', function(err){console.log(err);});
  client.on('status', function (status){console.log(status);});
  client.connect(cast.ip, firstContact);
  function firstContact(){
    client.getStatus(function (err, status){
      if ( err ) {  remove(err); return; }
      if (status && status.hasOwnProperty('applications')){
        if (status.applications[0].appId === 'E8C28D3C'){
          client.launch(CustomReciever, function(err, player) {
            if(err){ remove(err); } else {
              true;
            }
          });
        } else if (status.applications[0].appId == CustomReciever.APP_ID ) {
console.log("already running");
            client.launch(CustomReciever, function(err, player) {
              if(err){ remove(err); } else {
                true;
              }
            });
          true;
        } else {
          if (status.applications[0].appId == '0F5096E8'){
            console.log('  [GUEST USE]', new Date().toLog(), cast.name, status);
          } else {
            client.launch(CustomReciever, function(err, player) {
              if(err){ remove(err); } else {
                true;
              }
            });
            console.log('  [IGNORE APP]', new Date().toLog(), cast.name, status);
          }
        }
      }
    });
  }

  function remove(err) {
    console.log('[ERROR]', new Date().toLog(), cast.name, err);
    if(client.timer){clearTimeout(client.timer);}
    if(client.receiver){ client.close();}
    delete client;
    delete detector.casts[cast.id];
    console.log(detector.casts);
    detector.sendQuery();
  }
});


Date.prototype.toLog = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};

detector.listen();

