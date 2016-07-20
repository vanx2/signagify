#!/bin/env node

var detector = require('chromecast-detector');
var Client   = require('castv2-client').Client;
var CustomReciever = require('castv2-client').DefaultMediaReceiver;
CustomReciever.APP_ID = '5D393044'; // my custome receiver

detector.on('detect', function (cast){
  if ( cast.name.substr(0,7) != 'signage' ){ return; }
console.log("[DETECT]", cast.name);
  c = new Client();
  c.on('error', function(err){remove(err);});
  c.on('status', function (status){console.log(status);});
  c.connect(cast.ip, checkApp);
  function checkApp(){
    delete c.timer;
    if (! c) {remove("client is null"); return; }
    c.getStatus(function (err, status){
      if ( err ) { remove(err); return; }
      if (status && status.hasOwnProperty('applications')){
        if (status.applications[0].appId === 'E8C28D3C'){
          console.log('  [Backdrop]', new Date().toLog(), cast.name);
          launch();
        } else if (status.applications[0].appId == CustomReciever.APP_ID ) {
          console.log('  [RUNNING]', new Date().toLog(), cast.name);
        } else {
          if (status.applications[0].appId == '0F5096E8'){
            console.log('  [GUEST USE]', new Date().toLog(), cast.name);
          } else {
            console.log('  [IGNORE APP]', new Date().toLog(), cast.name, status);
          }
        }
      }
    });
    c.timer = setTimeout(checkApp, 10 * 1000);
  }
  function launch(){
    c.launch(CustomReciever, function(err, player) {
      if(err){ remove(err); } else {
        c.receiver = player;
      }
    });
  }
  function remove(err) {
    console.log('[ERROR]', new Date().toLog(), cast.name, err);
    try{
      clearTimeout(c.timer);
    } catch(e){
      console.log(e);
    }
    try{
      c.close();
    } catch(e){
      console.log(e);
    }
    delete c;
    delete detector.casts[cast.id];
console.log(detector.casts);
    detector.sendQuery();
  }
});

Date.prototype.toLog = function() {
  return this.toISOString().split('T')[0] + ' ' +  this.toLocaleTimeString();
};

detector.listen();

