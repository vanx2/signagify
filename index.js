#!/bin/env node

var detector = require('./lib/chromecastDetector.js');
var Client                = require('castv2-client').Client;
var CustomReciever = require('./lib/customReciever.js');

// detect chromecast address in my network via multicast DNS
detector.on('detect', function (cast){
  if ( cast.name.substr(0,4) != 'vanx' ){ return; }
//  if ( cast.name.substr(0,8) != 'signage@' ){ return; }
  console.log('[KICK] ', new Date().toLogFormat(), cast.name );

  var client = new Client();
  client.on('error', remove);
  client.on('status', function(status){
    console.log('[CLIENT STATUS]', new Date().toLogFormat(), cast.name,
      (status.hasOwnProperty('applications') && status.applications[0].hasOwnProperty('displayName') ) ?
       status.applications[0].displayName : status);
  });
  client.connect(cast.ip, function() {
    client.launch(CustomReciever, function(err, player) {
      if(err){ remove(err); } else {
        player.on('status', function(status) {
          console.log('[PLAYER STATUS]', new Date().toLogFormat(), cast.name,
            (status.hasOwnProperty('playerState')) ? status.playerState : status) ;
        });
        player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true }, function(err, status) {
          if(err){ remove(err); } else {
            client.clientTimer = setInterval(function() {
              client.getStatus(function(err, status){
                if(err) {
                  remove(err);
                } else if (status.hasOwnProperty('applications') && status.applications[0].appId === 'E8C28D3C'){
                  remove('dropped'); 
                } else if (status.hasOwnProperty('applications') && status.applications[0].appId == CustomReciever.APP_ID ) {
                  player.getStatus(function(err, status){
                    if(err){ remove(err);
                    } else if ( status.playerState != 'PLAYING' && status.playerState != 'BUFFERING' ) {
                      console.log('[RELOAD] ', new Date().toLogFormat(), cast.name, status.playerState );
//                      if(client.clientTimer){clearInterval(client.clientTimer);}
                      player.load({contentId: 'http://192.168.1.171:8080/x.mp4'}, { autoplay: true },function (){}); // todo
                    }
                  });
                }
              });
            }, 10000);
          }
        });
      }
    });
  });
  function remove(err) {
    console.log('[ERROR]', new Date().toLogFormat(), cast.name, err);
    if(client.clientTimer){clearInterval(client.clientTimer);}
    try { client.close(); } catch (err) {console.log(err);}
    try { delete client;} catch (err) {console.log(err);}
    detector.emit('detect', cast);
//    delete detector.casts[cast.name];   // todo
  }
});

Date.prototype.toLogFormat = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};

detector.listen('daemon');


