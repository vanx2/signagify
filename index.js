#!/bin/env node

var detector = require('./lib/chromecastDetector.js');
var Client   = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

// detect chromecast address in my network via multicast DNS
detector.on('detect', function (cast){
//  if ( cast.name.substr(0,8) != 'signage@' ){ return; }
  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
  var client = new Client();
  client.on('error', remove);
  client.on('status', function (status){
    console.log('[CLIENT STATUS]', new Date().toLog(), cast.name,
      (status.hasOwnProperty('applications') && 
       status.applications[0].hasOwnProperty('displayName') ) ?
       status.applications[0].displayName : status);
  });
  client.connect(cast.ip, monitor);

  function monitor(){
console.log('watch', new Date().toLog(), cast.name);
    client.getStatus(function (err, status){
      if (err) {remove(err);} else 
      if (status && status.hasOwnProperty('applications')){
        if (status.applications[0].appId === 'E8C28D3C'){
          console.log('backdrop!');
          launch();
        } else if (status.applications[0].appId == CustomReciever.APP_ID ) {
          if (! client.player){
console.log('join', new Date().toLog(), cast.name);
            client.join(status.applications[0], CustomReciever, function (err, player) {
              if (err){ remove(err);} else {
                client.player = player;
                playerMonitor();
              }
            });
          } else {
            playerMonitor();
          }
        } else if (status.applications[0].appId == '0F5096E8'){
          console.log('  [GUEST USE]', new Date().toLog(), cast.name, status); 
          client.timer = setTimeout(monitor,5*1000);
        } else {
          console.log('  [IGNORE APP]', new Date().toLog(), cast.name, status);
          client.timer = setTimeout(monitor,5*1000);
        }
      } else {
console.log('client has no status', new Date().toLog(), cast.name);
        launch();
      }
    });
  }

  function playerMonitor(){
    client.player.getStatus(function(err, status){
      if(err){ remove(err);} else
      if ( status && status.hasOwnProperty('playerState')) { 
        if (status.playerState != 'PLAYING' && status.playerState != 'BUFFERING' ) {
          console.log('[RELOAD] ', new Date().toLog(), cast.name, status.playerState );
          launch();
        } else {
          console.log('  [PLAYER STATUS]', new Date().toLog(), cast.name, status.playerState); 
          client.timer = setTimeout(monitor,5*1000);
        }
      } else {
console.log('player has no status', new Date().toLog(), cast.name, status);
        launch();
      }
    });
  }

  function launch(){
console.log('[launch]',new Date().toLog(), cast.name);
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

detector.listen('daemon');


