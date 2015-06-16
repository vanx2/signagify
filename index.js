#!/bin/env node

// web server for reciever.html and video
var contentsServer = require('./lib/contentsServer.js');
contentsServer.start(8080, './pub');

var detector = require('./lib/chromecastDetector.js');
var Client                = require('castv2-client').Client;
//var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var CustomReciever = require('./lib/customReciever.js');

// detect chromecast address in my network via multicast DNS
detector.on('detect', function(cast){
  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
  console.log('[KICK] ' + cast.name);

  var client = new Client();
  client.on('error', remove);
  client.on('status', function(status){
    console.log('[CLIENT STATUS] ' + cast.name, 
      (status.hasOwnProperty('applications') && status.applications[0].hasOwnProperty('displayName') ) ? 
       status.applications[0].displayName : status);
  });
  client.connect(cast.ip, function() {
/*
    client.getSessions(function(){
      console.log('getSessions');
    });
*/
    client.launch(CustomReciever, function(err, player) {
      player.on('status', function(status) {
        console.log('[PLAYER STATUS] ', (status.hasOwnProperty('playerState')) ? status.playerState : status) ;
      });
      player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true }, function(err, status) {
        if(err){ remove(err); }
        client.playTimer = setInterval(function() {
          player.getStatus(function(err, status){
            if(err){ remove(err); }
            if ( status.playerState != 'PLAYING' && status.playerState != 'BUFFERING' ) {
              console.log('player was ' + status.playerState );
              player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true },function (){}); // todo
            }
          });
        }, 3000);
        client.clientTimer = setInterval(function() {
          client.getStatus(function(err, status){
            if(err) {
              remove(err);
            } else if (status.hasOwnProperty('applications') && status.applications[0].appId === 'E8C28D3C'){
              remove(status.applications[0].appId + ' was running');
            }
          });
        }, 3000);
      });
    });
  });

  function remove(err) {
    console.log('[ERROR] ' + cast.name + ' ' + cast.ip);
    console.log(err);
    if(client.playTimer){clearInterval(client.playTimer);}
    if(client.clientTimer){clearInterval(client.clientTimer);}
    client.close();
//    delete detector.casts[cast.name];   // todo
    detector.emit('detect', cast);
  }
});
detector.listen('daemon');


