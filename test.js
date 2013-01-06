require('./')
var test = require('tap').test
	, log = require('eel')
	, fakeRedis = require('fakeredis')
	, redis = require('redis')
	, testUrl = 'redis://hostname:1234/?db=1'
	;

redis.createClient = function (port, host) {
	var client = fakeRedis.createClient()
	client.select = function (db) { this.db = db }
	return client
}


function unitTest (name, callback) {
	test(name, function (t) {
		var handler = log.backends.configure(testUrl, ['info', 'error'])
		t.on('end', function () { log.backends.unload(testUrl) })
		callback(t, handler.client)
	})
}

unitTest('Log a single message', function (t, client) {
	t.plan(3)
	var entry  // The log entry that should be emitted
	log.once('entry', function (e) { entry = e })
	log('Something happened')
	client.llen('logstash', function (err, len) {
		t.equal(1, len, 'single log entry in list')
	})
	client.lpop('logstash', function (err, res) {
		t.ok(res, 'log entry has content')
		t.deepEqual(JSON.parse(res), entry)
	})
})
