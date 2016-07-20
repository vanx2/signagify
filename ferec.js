
  var querystring = require('querystring');
  var http = require('http');
  var Iconv = require('iconv').Iconv;

  var post_data = querystring.stringify({
      'login' : 1,
      'user': 'xxx',
      'pass': 'xx'
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: '192.168.1.10',
      port: '80',
      path: '/login.gsp',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };


function postFerec(){
  console.log(new Date());
  var post_req = http.request(post_options, function(res) {
      iconv = new Iconv('EUC-JP', 'UTF-8//TRANSLIT//IGNORE');
//      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + iconv.convert(chunk).toString());
      });
  });

  post_req.on('error', function(e){
    console.log(e);
  });

  post_req.write(post_data);
  post_req.end();
}


var time = setInterval(postFerec, 1000 * 60 * 60 );
postFerec();
