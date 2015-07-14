#!/bin/env node

var Client         = require('castv2-client').Client;
var SignageReciever = require('./lib/customReciever.js');
var detector = require('chromecast-detector');

detector.on('detect', function (cast){
//  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
  if ( cast.name.substr(0,8) != 'signage@' ){ return; }
  var client = new Client();
  client.on('error', function(err){console.log(err)});
  client.on('status', function(cstatus){
    console.log('[CLIENT STATUS]', new Date().toLogFormat(), cast.name, 
      (cstatus.hasOwnProperty('applications') && cstatus.applications[0].hasOwnProperty('displayName') ) ? 
       cstatus.applications[0].displayName : cstatus);
  });
  client.connect( cast.ip, function() {
    client.watch = setInterval( function() {
      client.getStatus(function(err, cstatus){
        if (cstatus.hasOwnProperty('applications')) {
          var appId = cstatus.applications[0].appId;
          console.log('[appID]', appId);
        } else {return;}
        if (appId == 'E8C28D3C'){   // backdrop
          client.launch(SignageReciever, function(err, player) {
            if( err ) { detach(err);} else {
              client.player = player;
              player.on('status', function(pstatus) {
                console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
                  (pstatus.hasOwnProperty('playerState')) ? pstatus.playerState : pstatus) ;
              });
            }
          });
        } else if (appId == SignageReciever.APP_ID ) { // signage
          if (! client.player) {
            client.join(cstatus.applications[0], SignageReciever, function (err, player) {
              if( err ) { detach(err);} else {
                client.player = player;
                player.on('status', function(pstatus) {
                  console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
                    (pstatus.hasOwnProperty('playerState')) ? pstatus.playerState : pstatus) ;
                });
                player.getStatus(function(err, pstatus){
console.log(pstatus);
                  if( err ) { detach(err);} else
                  if ( pstatus && pstatus.hasOwnProperty('playerState') && 
                       pstatus.playerState != 'PLAYING' && pstatus.playerState !='BUFFERING'){
                    player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true }, function(err, ppstatus) {
console.log(ppstatus);
                      if ( err ) { detach(err); } else
                      if ( ppstatus && ppstatus.hasOwnProperty('playerState') && 
                           ppstatus.playerState != 'PLAYING' && ppstatus.playerState !='BUFFERING') {
                        detach('status is ' + ppstatus.playerState);
                      }
                    });
                  }
                });
              }
            });
          } else {
            player = client.player;
            player.getStatus(function(err, pstatus){
console.log(pstatus);
              if ( err ) { detach(err);}
              else if ( pstatus && pstatus.hasOwnProperty('playerState') && 
                   pstatus.playerState != 'PLAYING' && pstatus.playerState !='BUFFERING'){
                player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true }, function(err, ppstatus) {
console.log(ppstatus);
                  console.log(ppstatus);
                  if ( err ) { detach(err); } else
                  if ( ppstatus.hasOwnProperty('playerState') &&
                       ppstatus.playerState != 'PLAYING' && ppstatus.playerState !='BUFFERING') {
                    detach('status is ' + ppstatus.playerState);
                  }
                });
              }
            });
          }
        } else if (cstatus.hasOwnProperty('applications')){
          console.log('[ignore app]', cstatus.applications[0]);
        }
      });
    }, 5*1000);
  });
  function check(){
  }
  function detach(err){
    console.log('[ERROR]', new Date().toLogFormat(), cast.name, err);
    if(client.clientTimer){clearInterval(client.clientTimer);}
    if(client.receiver){ client.close();}
    delete client;
    delete detector.casts[cast.name];   // todo
  }
});
Date.prototype.toLogFormat = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};
detector.listen('forever');

