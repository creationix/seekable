seekable
========

Allows for forward seeking and buffered reading in a simple-stream of binary data.

### seekable(getStream) -> seek

Create a `seek` function from a stream object.

The `getStream` function allows seekable to get a new stream from you when it needs to rewind and start over.  It may be called more than once.  Make sure to pass in a new stream each time.

```js
var seekable = require('seekable');

var seek = seekable(function (callback) {
  // Create a stream for the thing you want to read from
  // This may be called multiple times if you ever seek backwards.
  callback(null, makeMyStream());
});
```

### seek(offset, bytes) continuable&lt;data>

Seek to position `offset` and consume `bytes` calling the continuable's `callback(err, data)` when done.

Note that if you seek to a position that's already been read and discarded in the current source, it will ask you for another one to start over.

```js
seek(100, 100)(function (err, chunk) {
  // I now have 100 bytes as position 100.
});
```

## License

The MIT License (MIT)

Copyright (c) 2013 Tim Caswell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

