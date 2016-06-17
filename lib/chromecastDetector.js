var mdns = require('multicast-dns');

var detector = mdns();

// detected chromecasts
detector.casts = {};

// start to detect
detector.listen = function (daemon){
  var self = this;

  // when get response
  self.on('response', function (response) {
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
    if (name && ip && ( ! self.casts.hasOwnProperty(id) || 
                    self.casts[id].ip != ip || self.casts[id].name != name ) ) {
      self.casts[id] = {name: name, ip: ip, port: port, id: id};
      console.log("[DETECT] ", self.casts[id] );
      self.emit('detect', self.casts[id]);
      if (! daemon) {
        self.destroy();
      }
    }
  });

  self.sendQuery();
};

detector.sendQuery = function (){
  var self = this;

  self.query({
    questions:[{
      name: '_googlecast._tcp.local',
      type: 'ptr'
    }]
  });
};

module.exports = detector;

