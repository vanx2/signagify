#!/bin/env node

// web server for reciever.html and video
var contentsServer = require('./lib/contentsServer.js');
contentsServer.start(8080, './pub');

