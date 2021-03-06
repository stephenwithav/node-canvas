'use strict';

/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var util = require('util');

/**
 * Initialize a `PNGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.png".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.png')
 *       , stream = canvas.createPNGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var PNGStream = module.exports = function PNGStream(canvas, sync) {
  if (!(this instanceof PNGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  Readable.call(this);

  var self = this;
  var method = sync
      ? 'streamPNGSync'
      : 'streamPNG';
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamPNG' === method) method = 'streamPNGSync';

  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPNGSync once and let it emit data at will.
  var hasStarted = false;
  self._read = function () {
    if (!hasStarted) {
      hasStarted = true;
      process.nextTick(function(){
        canvas[method](function(err, chunk, len){
          if (err) {
            self.emit('error', err);
          } else if (len) {
            self.push(chunk);
          } else {
            self.push(null);
          }
        });
      });
    }
  };
};

util.inherits(PNGStream, Readable);
