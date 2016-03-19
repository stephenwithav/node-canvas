'use strict';

/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var util = require('util');

/**
 * Initialize a `JPEGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.jpeg".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.jpeg')
 *       , stream = canvas.createJPEGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var JPEGStream = module.exports = function JPEGStream(canvas, options, sync) {
  if (!(this instanceof JPEGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  Readable.call(this);

  var self = this;
  var method = sync
      ? 'streamJPEGSync'
      : 'streamJPEG';
  this.options = options;
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamJPEG' == method) method = 'streamJPEGSync';

  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPNGSync once and let it emit data at will.
  var hasStarted = false;

  self._read = function () {
    if (!hasStarted) {
      hasStarted = true;
      process.nextTick(function(){
        canvas[method](options.bufsize, options.quality, options.progressive, function(err, chunk){
          if (err) {
            self.emit('error', err);
          } else if (chunk) {
            self.push(chunk);
          } else {
            self.push(null);
          }
        });
      });
    }
  };
};

util.inherits(JPEGStream, Readable);
