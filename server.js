#!/bin/env node
var detector = require('chromecast-detector');
var Client   = require('castv2-client').Client;
var CustomReciever = require('castv2-client').DefaultMediaReceiver;
CustomReciever.APP_ID = 'A5ABC4FF'; // my custome receiver

detector.on('detect', function (cast){
console.log(cast);
  if ( cast.name.substr(0,4) != 'vdev' ){ return; }

  var client = new Client();
  client.on('error', function(err){console.log(err);});
  client.on('status', function (status){console.log(status);});
  client.connect(cast.ip, firstContact);
  function firstContact(){
    client.getStatus(function (err, status){
      if ( err ) {  remove(err); return; }
      if (status && status.hasOwnProperty('applications')){
        if (status.applications[0].appId === 'E8C28D3C'){
          launch();
        } else if (status.applications[0].appId == CustomReciever.APP_ID ) {
          true;
        } else {
          if (status.applications[0].appId == '0F5096E8'){
            console.log('  [GUEST USE]', new Date().toLog(), cast.name, status);
          } else {
            console.log('  [IGNORE APP]', new Date().toLog(), cast.name, status);
          }
        }
      }
    });
  }

  function launch() {
    client.launch(CustomReciever, function(err, player) {
      if(err){ remove(err); } else {
        client.player = player;
        client.player.on('status', function(status) {
          console.log('  [PLAYER STATUS]', new Date().toLog(), cast.name,
            (status.hasOwnProperty('playerState')) ? status.playerState : status) ;
        });
        client.player.load({contentId: 'http://192.168.1.171/x.mp4'}, { autoplay: true },
          function(err, status) {
            if(err){ remove(err); } else {
              client.timer = setTimeout(monitor,5*1000);
            }
          }
        );
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

