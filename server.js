#!/bin/env node

var http = require('http');
var fs = require('fs');
var URL  = require('url');
function cnv(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}


http.createServer(function (req, res) {
  var query = URL.parse(req.url, true).query;
  var cb;
  if (query.hasOwnProperty('callback')) {
    cb = query.callback;
    delete query.callback;
  }
 /* 
  for (var key in query) {
    var val = query[key];
    if (key === 'callback' && /^[a-zA-Z]+[0-9a-zA-Z]*$/.test(val) ) {
      cb = val;
    } else {
      data.push( '"' + cnv(key) + '":"' + cnv(val) + '"' );
    }
  }
*/

console.log(query);
  fs.readdir(__dirname + '/img', function(err, files){
    if (err) throw err;
    var fileList = [];
    files.filter(function(file){
      return fs.statSync(__dirname + '/img/' + file).isFile() 
             && /.*\.(png|gif|jpe?g)$/.test(__dirname + '/img/' + file);
    }).forEach(function (file) {
      fileList.push(file);
    });
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(cb ? cb + "(" + JSON.stringify(fileList) + ")"
                     : JSON.stringify(fileList));
  });

}).listen(9000);



