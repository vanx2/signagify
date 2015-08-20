var detector = require('./lib/chromecastDetector.js');

detector.on('detect',function (cast){
console.log(detector.casts);
delete detector.casts[cast.id];
detector.sendQuery();

});

detector.listen('daemon');

