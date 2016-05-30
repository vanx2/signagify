# chromecast-detector
detect all chromecasts in local wifi n/w

## installation

  npm i chromecast-detector

## usage

### command line

The app will show detected chromecasts to STDOUT
```
node index.js
```

specify the chromecast name and ttl(second) as JSON
```
node index '{"names":["chrome-cast-name"],"ttl": 60}'
```

### module
"detect" event is fired
```
var detector = require('chromecast-detector');
detector.on('detect', function (cast){
  console.log(cast);
});
detector.listen();
```

stop to listen
```
detector.terminate();
```

resend the query
```
detector.sendQuery();
```
