var bops = require('bops');
module.exports = seekable;

function seekable(getStream) {
  var stream;   // The current source stream.
  var buffer;   // Buffered chunks.
  var consumed; // Total number of bytes we've consumed ever.
  var position; // Position in original stream of first byte in buffer.
  var target;   // The place we want to seek to
  var size;     // The number of bytes we want to emit
  var callback; // Where to report the emitted bytes
  var last;     // Store the last emitted item in case we want to rewind a little.
  
  function init(source) {
    stream = source;
    buffer = [];
    consumed = 0;
    position = 0;
    last = null;
  }

  // Read to position in a stream and read some bytes
  return function (t, s) {
    if (callback) throw new Error("Only one seek at a time");
    target = t;
    size = s;
    return continuable;
  };

  function log() {
    return buffer.map(function (item) { return item.length; });
  }

  function continuable(cb) {
    if (callback) return cb(new Error("Only one seek at a time"));
    getStream(function (err, source) {
      if (err) return cb(err);
      init(source);
      callback = cb;
      seek();
    });
  }

  function finish(err, item) {
    var cb = callback;
    callback = null;
    cb(err, item);
  }

  function seek() {
    console.log("Seeking %s/%s", position, target, log());
    if (target < position) {
      if (last) {
        console.log("unshift last output", last.length);
        position -= last.length;
        buffer.unshift(last);
        last = null;
        return seek();
      }
      return finish(new Error("Can't seek backwards to " + target + " from " + position));
    }
    while (position < target) {

      // If there is no data, load some and try again.
      if (!buffer.length) return getMore(seek);

      // First check for data to throw away.
      var first = buffer[0];
      // If we can throw away a whole chunk, do it.
      if (position + first.length <= target) {
        position += first.length;
        buffer.shift();
        continue;
      }

      // Otherwise slice the chunk in front to get where we need to be.
      var diff = target - position;
      buffer[0] = bops.subarray(first, diff);
      position += diff;
      break;
    }

    console.log("Seeking %s/%s", position, target, log());
    consume();
  }

  function consume() {
    console.log("Consuming %s/%s", consumed, target + size, log());
    if (consumed < target + size) return getMore(consume);
    console.log("Consuming %s/%s", consumed, target + size, log());
    process();
  }

  function process() {
    console.log("processing", log());

    // Check for exact size
    var first = buffer[0];
    var item;
    if (first.length === size) {
      console.log("Exact change", size);
      item = buffer.shift();
    }
    else if (first.length > size) {
      console.log("pslice %s/%s", size, first.length);
      item = bops.subarray(first, 0, size);
      buffer[0] = bops.subarray(first, size);
    }
    else {
      item = bops.create(size);
      var i = 0;
      while (i < size) {
        console.log("piecemeal %s/%s", i, size, log());
        var diff = size - i;
        first = buffer[0];
        if (first.length <= diff) {
          buffer.shift();
          bops.copy(first, item, i);
          i += first.length;
        }
        else {
          bops.copy(bops.subarray(first, 0, diff), item, i);
          buffer[0] = bops.subarray(first, diff);
          i += diff;
        }
      }
    }
    last = item;
    console.log("after processing", log());
    position += size;
    finish(null, item);
  }

  function getMore(callback) {
    stream.read(function (err, item) {
      if (err) return finish(err);
      if (item === undefined) return finish(new Error("Unexpected end of base stream"));
      buffer.push(item);
      consumed += item.length;
      callback();
    });
  }

}

