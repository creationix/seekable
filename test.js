var seekable = require('./seekable.js');
var binarySource = require('simple-stream-helpers/binary-source.js');
var slow = require('simple-stream-helpers/slow.js');
var bops = require('bops');
var test = require('tape');

// Create our data source
var data = bops.create(0x1000);
for (var i = 0; i < 0x1000; i++) {
  data[i] = i % 0x100;
}

test("seek with exact chunks of 0x100", function (assert) {
  commonTest(function (callback) {
    callback(null, binarySource(data, 0x100));
  }, assert);
});

test("slow seek with exact chunks of 0x100", function (assert) {
  commonTest(function (callback) {
    callback(null, slow(binarySource(data, 0x100)));
  }, assert);
});

test("seek with tiny chunks of 0x17", function (assert) {
  commonTest(function (callback) {
    callback(null, binarySource(data, 0x17));
  }, assert);
});

test("slow seek with tiny chunks of 0x17", function (assert) {
  commonTest(function (callback) {
    callback(null, slow(binarySource(data, 0x17)));
  }, assert);
});

test("seek with large chunks of 0x800", function (assert) {
  commonTest(function (callback) {
    callback(null, binarySource(data, 0x800));
  }, assert);
});

test("slow seek with large chunks of 0x800", function (assert) {
  commonTest(function (callback) {
    callback(null, slow(binarySource(data, 0x800)));
  }, assert);
});


function commonTest(getSource, assert) {
  var seek = seekable(getSource);
  subTest(0x600, 0x100, function () {
    subTest(0x780, 0x80, function () {
      subTest(0x89a, 0x123, function () {
        subTest(0x900, 0x10, function () {
          subTest(0x300, 0x50, function () {
            assert.end();
          });
        });
      });
    });
  });

  function subTest(start, size, next) {
    seek(start, size)(function (err, chunk) {
      if (err) throw err;
      assert.equal(chunk.length, size);
      assert.equal(chunk[0], data[start]);
      assert.equal(chunk[size - 1], data[start + size - 1]);
      next();
    });
  }

}
