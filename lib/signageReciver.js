var util        = require('util');
var castv2Cli         = require('castv2-client');
var Application       = castv2Cli.Application;
var MediaController   = castv2Cli.MediaController;

function DefaultMediaReceiver(client, session) {
  Application.apply(this, arguments);

  this.media = this.createController(MediaController);

  this.media.on('status', onstatus);

  var self = this;

  function onstatus(status) {
    self.emit('status', status);
  }

}

//DefaultMediaReceiver.APP_ID = 'CC1AD845';
DefaultMediaReceiver.APP_ID = '5D393044';   // changed appId
//DefaultMediaReceiver.APP_ID = 'B90E0EAD';   // changed appId

util.inherits(DefaultMediaReceiver, Application);

DefaultMediaReceiver.prototype.getStatus = function(callback) {
  this.media.getStatus.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.load = function(media, options, callback) {
  this.media.load.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.play = function(callback) {
  this.media.play.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.pause = function(callback) {
  this.media.pause.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.stop = function(callback) {
  this.media.stop.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.seek = function(currentTime, callback) {
  this.media.seek.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.send = function(message, callback) {
  this.media.send.apply(this.media, arguments);
};

module.exports = DefaultMediaReceiver;