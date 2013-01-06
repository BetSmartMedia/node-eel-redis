# eel-redis - Redis backend for [eel][eel]

## Synopsis

```javascript
var log = require('eel')
require('eel-redis')

// Default parameters (except password)
var handler = log.backends.configure('redis://password@localhost:6379/?list=logstash')

// All URI parts are optional, so you could also say:
var handler = log.backends.configure('redis://')

// Redis client is available as `handler.client`.
// You may wish to attach an error handler to it (keep in mind that the redis
// client already automatically reconnects)
handler.client.on('error', function (err) {
	var msg = 'Redis client emitted error: ' + err
	var fields = {
		uri: uri.href,
		err: err,
		stack: err.stack.split('\n').map(function (l) { return l.trim() }),
	}
	log.backends.unload(handler)  // Avoid infinite callback recursion
	log.error(msg, fields)
})
```

## Description

This is a Redis backend for [eel][eel] (EventEmitter logging).

## Installation

`npm install --save eel eel-redis`

_Installing `eel` as a direct dependency is necessary for `require('eel')` to work in your app._
[eel]: (https://github.com/BetSmartMedia/eel)
