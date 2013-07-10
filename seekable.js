var bops = require('bops');
module.exports = seekable;

function seekable(stream) {
  var consumed = 0;
  var position = 0;
  var buffers = [];
  // Read to position in a stream and read some bytes
  return function (offset, bytes) {
    var callback;
    console.log("\nSEEK", offset, bytes);
    
    return function (cb) {
      callback = cb;
      seek(offset + bytes, onSeek);
    };

    function onSeek(err) {
      var output, next, diff;
      if (err) return callback(err);

      // Skip bytes till we're where we want to be.
      while (position < offset) {
        console.log("SEEKING", bytes, buffers.map(function (buffer) { return buffer.length; }));
        diff = offset - position;
        next = buffers[0];

        // If entire chunks are to be ignored, throw them away.
        if (next.length <= diff) {
          buffers.shift();
          console.log("SHIFTING CHUNK", -next.length);
          position += next.length;
          continue;
        }

        // Otherwise, skip the front part of the next buffer;
        console.log("EATING FRONT", -diff);
        buffers[0] = bops.subarray(next, diff);
        position += diff;
      }
      console.log({position:position,consumed:consumed})


      // Otherwise, piece smaller pieces together till we've got enough.
      console.log("\nCONSUMING", bytes, buffers.map(function (buffer) { return buffer.length; }));

      // If the next buffer is the exact size we want, send it up!
      if (buffers[0].length === bytes) {
        output = buffers.shift();
        position += output.length;
        console.log("exact change", buffers.map(function (buffer) { return buffer.length; }));
        return callback(null, output);
      }

      // If it's bigger than we want, consume the front of it.
      if (buffers[0].length >= bytes) {
        output = bops.subarray(buffers[0], 0, bytes);
        buffers[0] = bops.subarray(buffers[0], bytes);
        position += output.length;
        console.log("subarray", buffers.map(function (buffer) { return buffer.length; }));
        return callback(null, output);
      }

      output = bops.create(bytes);
      var i = 0;
      while (i < bytes) {
        diff = bytes - i;
        next = buffers[0];
        if (next.length <= diff) {
          buffers.shift();
          bops.copy(next, output, i);
          i += next.length;
        }
        else {
          bops.copy(bops.subarray(next, 0, diff), output, i);
          buffers[0] = bops.subarray(next, diff);
          i += diff;
        }
      }
      position += bytes;

      console.log("piecemeal", buffers.map(function (buffer) { return buffer.length; }));
      return callback(null, output);
    }
  };

  function seek(target, callback) {
    console.log({target:target,consumed:consumed})
    if (target < consumed) return callback();
    stream.read(function (err, item) {
      if (item === undefined) {
        console.log("END");
        return callback(err);
      }
      console.log("ADDING", item.length);
      buffers.push(item);
      consumed += item.length;
      return seek(target, callback);
    });
  }
}

