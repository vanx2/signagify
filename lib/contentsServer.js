var http = require('http');

var connect = require('connect'),
    serveStatic = require('serve-static');
exports.start = function(port,path){
var app = connect();
  app.use(serveStatic(path));
  app.listen(port);
};

