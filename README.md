seekable
========

Allows for forward seeking and buffered reading in a simple-stream of binary data.

### seekable(stream) -> seek

Create a `seek` function from a stream object.

### seek(offset, bytes) continuable&lt;data>

Seek to position `offset` and consume `bytes` calling the continuable's `callback(err, data)` when done.

Note that you can't rewind the source stream and so offset must always be after the end of the last place you read from.
