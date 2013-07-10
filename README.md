seekable
========

Allows for forward seeking and buffered reading in a simple-stream of binary data.

### seekable(stream) -> seek

Create a `seek` function from a stream object.

### seek(offset, bytes, callback)

Seek to position `offset` and consume `bytes` calling `callback(err, data)` when done.

Note that you can't rewing the source stream and so offset must always be after the end of the last place you read from.
