var seekable = require('./seekable.js');
var binarySource = require('simple-stream-helpers/binary-source.js');
var consume = require('simple-stream-helpers/consume.js');
var slow = require('simple-stream-helpers/slow.js');
var bops = require('bops');
var test = require('tape');

// Create our data source
var data = bops.create(0x1000);
for (var i = 0; i < 0x1000; i++) {
  data[i] = i % 0x100;
}

test("seek with exact chunks of 0x100", function (assert) {
  commonTest(binarySource(data, 0x100), assert);
});

// test("slow seek with exact chunks of 0x100", function (assert) {
//   commonTest(slow(binarySource(data, 0x100)), assert);
// });
// 
// test("seek with tiny chunks of 0x17", function (assert) {
//   commonTest(binarySource(data, 0x17), assert);
// });
// 
// test("slow seek with tiny chunks of 0x17", function (assert) {
//   commonTest(slow(binarySource(data, 0x17)), assert);
// });


function commonTest(source, assert) {
  var seek = seekable(source);
  one();
  
  function one() {
    seek(0x600, 0x100)(function (err, chunk) {
      if (err) throw err;
      assert.equal(chunk.length, 0x100);
      assert.equal(chunk[0x00], data[0x600]);
      assert.equal(chunk[0xff], data[0x6ff]);
      two();
    });
  }
  
  function two() {
    seek(0x680, 0x80)(function (err, chunk) {
      if (err) throw err;
      assert.equal(chunk.length, 0x80);
      assert.equal(chunk[0x00], data[0x680]);
      assert.equal(chunk[0x7f], data[0x6ff]);
      three();
    });
  }
  
  function three() {
    seek(0x789, 0x123)(function (err, chunk) {
      if (err) throw err;
      assert.equal(chunk.length, 0x123);
      assert.equal(chunk[0x000], data[0x789]);
      assert.equal(chunk[0x122], data[0x8ab]);
      assert.end();
    });
  }
}
