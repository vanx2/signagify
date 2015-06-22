var http = require('http');
var static = require('node-static');

exports.start = function(port,path){
  var file = new static.Server(path || '../pub');
  http.createServer(function (request, response) {
    request.addListener('end', function () {
console.log(request.connection.remoteAddress);
      file.serve(request, response);
    }).resume();
  }).listen(port || 8080);
};

