#!/bin/env node

var detector = require('./lib/chromecastDetector.js');
var Client   = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

// detect chromecast address in my network via multicast DNS
detector.on('detect', function (cast){
  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
//  if ( cast.name.substr(0,8) != 'signage@' ){ return; }
  console.log('[KICK] ', new Date().toLogFormat(), cast.name );

  var client = new Client();
  client.connect(cast.ip, monitor);
  function launch(){
    client.launch(CustomReciever, function(err, player) {
      client.player = player;
      if(err){ remove(err); } else {
        client.player.on('status', function(status) {
          console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
            (status.hasOwnProperty('playerState')) ? status.playerState : status) ;
        });
        setTimeout(monitor,3*1000);
      }
    });
  }
  function monitor(){
console.log('watch');
              client.getStatus(function(err, status){
                if(err) {remove(err);}
                if (status && status.hasOwnProperty('applications')){
                  if (status.applications[0].appId === 'E8C28D3C'){
                    console.log('backdrop!');
                    launch();
                  } else if (status.applications[0].appId == CustomReciever.APP_ID ) {
console.log('join');
                    client.join(status.applications[0], CustomReciever, function (err, player) {
                      if(err){ remove(err);}
                      player.getStatus(function(err, status){
                        if(err){ remove(err);}
                        if ( status && status.hasOwnProperty('playerState')) { 
                          if (status.playerState != 'PLAYING' && status.playerState != 'BUFFERING' ) {
                            console.log('[RELOAD] ', new Date().toLogFormat(), cast.name, status.playerState );
                            launch();
                          } else {
                            console.log('[PLAYER STATUS]',status.playerState); 
                            setTimeout(monitor,3*1000);
                          }
                        } else {
console.log('player has no status', status);
                        }
                      });
                    });
                  } else {
                    console.log('[IGNORE APP]', status);
                    setTimeout(monitor,3*1000);
                  }
                } else {
console.log('client has no status', status);
                  setTimeout(monitor,3*1000);
                }
              });
  }
  function remove(err) {
    console.log('[ERROR]', new Date().toLogFormat(), cast.name, err);
    if(client.receiver){ client.close();}
    delete client;
    delete detector.casts[cast.name];   // todo
  }
});

Date.prototype.toLogFormat = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};

detector.listen('daemon');


