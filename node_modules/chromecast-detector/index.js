var mdns = require('multicast-dns');

var detector = mdns();

// detected chromecasts
detector.casts = {};

// start to detect
detector.listen = function (options){
  var _self = this;

  // when get response
  _self.on('response', function (response) {
    var name = ip = id = port = '';
    response.answers.forEach(function (an) {
      if (an.type === 'PTR' && an.name === '_googlecast._tcp.local'){
        name = an.data.replace(/\._googlecast\._tcp\.local$/, '');
      }
    });
    response.additionals.forEach(function (ad) {
      if        ( ad.type === 'TXT' && ad.name === name + '._googlecast._tcp.local' ) {
        id   = ad.data.replace(/^id=/, '');
      } else if ( ad.type === 'A'   && ad.name === name + '.local' ) {
        ip   = ad.data;
      } else if ( ad.type === 'SRV' ) {
        port = ad.data.port;
      }
    });
    if (name && ip && 
         ( ! _self.casts.hasOwnProperty(id) ||  _self.casts[id].ip != ip || _self.casts[id].name != name ) &&
         ( ! ( options && options.hasOwnProperty("names") && options.names.indexOf(name) < 0 ) ) ) {
      _self.casts[id] = {name: name, ip: ip, port: port, id: id};
      if ( ! module.parent) { console.log("[DETECT]", _self.casts[id] ); }
      _self.emit('detect', _self.casts[id]);
    }
  });

  _self.sendQuery();

  // die after 120sec that is chromecast mdns ttl
  if ( options && options.hasOwnProperty("ttl") && isFinite(options.daemon.ttl) ) {
    var timer = setTimeout(_self.terminate, ttl * 1000 );
  }
};

detector.sendQuery = function (){
console.log("Q");
  this.query({
    questions:[{
      name: '_googlecast._tcp.local',
      type: 'ptr'
    }]
  });
  
};
detector.terminate = function (){
  this.destroy();
};

if (module.parent) {
  module.exports = detector;
} else {
  detector.listen( ( process.argv.length > 2) ? JSON.parse( process.argv.slice(2) ) : undefined );
}


