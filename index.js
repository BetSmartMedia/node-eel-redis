var eel = require('eel')

eel.backends.register('redis:', createBackend)

module.exports = createBackend

var redis = require('redis')

function createBackend (uri) {
	var port = uri.port || 6379
		, host = uri.hostname || 'localhost'
		, client = redis.createClient(host, port)
		, db
		;

	if (uri.auth) client.auth(uri.auth)
	if (uri.query && (db = parseInt(uri.query.db)) && !isNaN(db)) client.select(db)

	function onError (err) {
		var msg = 'Redis client emitted error: ' + err
		var fields = {
			uri: uri.href,
			err: err,
			stack: err.stack.split('\n').map(function (l) { return l.trim() }),
		}

		if (err.code == 'ECONNREFUSED') eel.backends.unload(handler)
		else reconnect()

		eel.error(msg, fields)
	}

	var list = uri.query.list || 'logstash'

	function handler (entry) {
		var output = eel.formatter.safeJSON(entry)
		if (output) client.rpush(list, output)
	}

	handler.client = client
	handler.end = function () { client.quit() }

	return handler
}
