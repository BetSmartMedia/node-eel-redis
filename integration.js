require('./')
var test = require('tap').test
	, log = require('eel')
	, redis = require('redis')
	;

test('Integration with real redis', function (t) {
	var handler = log.backends.configure('redis://', ['debug', 'info', 'warning', 'error', 'critical'])
		, key = 'logstash'
		, client = handler.client
		, expected = []
		, push = expected.push.bind(expected)
		;

	log.on('entry', push)
	log.debug("Something common happened")
	log.info("Something relevant happened")
	log.warning("Something strange happened")
	log.error("Something bad happened")
	log.critical("Something awful happened")
	log.removeListener('entry', push)

	t.plan(7)

	// Date.prototype.toISOString = function () { return 'timestamp' }

	client.once('drain', function () {
		client.llen(key, function (err, len) {
			t.equal(len, 5, 'got 5 entries')

			function next () {
				client.lpop(key, function (err, entry) {
					if (err) return t.emit('error', err)
					if (!entry) {
						t.equal(0, expected.length, 'no unexpected entries')
						client.del(key)
						log.backends.unload('redis://')
						return
					}
					t.deepEqual(expected.shift(), JSON.parse(entry))
					next()
				})
			}

			next()

		})
	})
})
