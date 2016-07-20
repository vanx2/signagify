#!/bin/env node
var fs = require('fs');
var path = require('path');
var mediaPath = "z:\\投稿受付";
var savePath = "z:\\配信済み";
    function getFiles( dir ) {
      fs.readdirSync( dir
/*
      ).sort(
      function(a, b){
        return fs.statSync( path.join(dir, a) ).mtime.getTime() -
               fs.statSync( path.join(dir, b) ).mtime.getTime();
      }
*/
      ).forEach(function (file) {
        var target = path.join(dir, file);
        var fstat = fs.statSync(target);
        if ( ( (fstat.isFile() && /^\.(txt|mp4|mpeg|png|gif|jpe?g)$/i.test(path.extname(target)) ) ||
                fstat.isDirectory() ) &&
                new Date(fstat.ctime) > new Date().setDate( today.getDate() - 7 )   ){
          console.log(file + ' : ' + fstat.ctime);
          fs.renameSync(target, path.join(savePath, file) );
        }
      });
    }
    getFiles( mediaPath.replace(RegExp(path.sep + '$'), '') );

