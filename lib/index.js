'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _url = require('url');

var _http = require('http');

var http = _interopRequireWildcard(_http);

var _https = require('https');

var https = _interopRequireWildcard(_https);

var _zlib = require('zlib');

var zlib = _interopRequireWildcard(_zlib);

var _stream = require('stream');

var _body = require('./body');

var _body2 = _interopRequireDefault(_body);

var _response = require('./response');

var _response2 = _interopRequireDefault(_response);

var _headers = require('./headers');

var _headers2 = _interopRequireDefault(_headers);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _fetchError = require('./fetch-error');

var _fetchError2 = _interopRequireDefault(_fetchError);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */

/**
 * index.js
 *
 * a request API compatible with window.fetch
 */

function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	_body2.default.Promise = fetch.Promise;
	_headers2.default.FOLLOW_SPEC = fetch.FOLLOW_SPEC;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		var options = new _request2.default(url, opts);

		if (!options.protocol || !options.hostname) {
			throw new Error('only absolute urls are supported');
		}

		if (options.protocol !== 'http:' && options.protocol !== 'https:') {
			throw new Error('only http(s) protocols are supported');
		}

		var send = (options.protocol === 'https:' ? https : http).request;

		// normalize headers
		var headers = new _headers2.default(options.headers);

		if (options.compress) {
			headers.set('accept-encoding', 'gzip,deflate');
		}

		if (!headers.has('user-agent')) {
			headers.set('user-agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
		}

		if (!headers.has('connection') && !options.agent) {
			headers.set('connection', 'close');
		}

		if (!headers.has('accept')) {
			headers.set('accept', '*/*');
		}

		// detect form data input from form-data module, this hack avoid the need to pass multipart header manually
		if (!headers.has('content-type') && options.body && typeof options.body.getBoundary === 'function') {
			headers.set('content-type', 'multipart/form-data; boundary=' + options.body.getBoundary());
		}

		// bring node-fetch closer to browser behavior by setting content-length automatically
		if (!headers.has('content-length') && /post|put|patch|delete/i.test(options.method)) {
			if (typeof options.body === 'string') {
				headers.set('content-length', Buffer.byteLength(options.body));
				// detect form data input from form-data module, this hack avoid the need to add content-length header manually
			} else if (options.body && typeof options.body.getLengthSync === 'function') {
				// for form-data 1.x
				if (options.body._lengthRetrievers && options.body._lengthRetrievers.length == 0) {
					headers.set('content-length', options.body.getLengthSync().toString());
					// for form-data 2.x
				} else if (options.body.hasKnownLength && options.body.hasKnownLength()) {
					headers.set('content-length', options.body.getLengthSync().toString());
				}
				// this is only necessary for older nodejs releases (before iojs merge)
			} else if (options.body === undefined || options.body === null) {
				headers.set('content-length', '0');
			}
		}

		options.headers = headers.raw();

		// http.request only support string as host header, this hack make custom host header possible
		if (options.headers.host) {
			options.headers.host = options.headers.host[0];
		}

		// send request
		var req = send(options);
		var reqTimeout = void 0;

		if (options.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					req.abort();
					reject(new _fetchError2.default('network timeout at: ' + options.url, 'request-timeout'));
				}, options.timeout);
			});
		}

		req.on('error', function (err) {
			clearTimeout(reqTimeout);
			reject(new _fetchError2.default('request to ' + options.url + ' failed, reason: ' + err.message, 'system', err));
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			// handle redirect
			if (fetch.isRedirect(res.statusCode) && options.redirect !== 'manual') {
				if (options.redirect === 'error') {
					reject(new _fetchError2.default('redirect mode is set to error: ' + options.url, 'no-redirect'));
					return;
				}

				if (options.counter >= options.follow) {
					reject(new _fetchError2.default('maximum redirect reached at: ' + options.url, 'max-redirect'));
					return;
				}

				if (!res.headers.location) {
					reject(new _fetchError2.default('redirect location header missing at: ' + options.url, 'invalid-redirect'));
					return;
				}

				// per fetch spec, for POST request with 301/302 response, or any request with 303 response, use GET when following redirect
				if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && options.method === 'POST') {
					options.method = 'GET';
					delete options.body;
					delete options.headers['content-length'];
				}

				options.counter++;

				resolve(fetch((0, _url.resolve)(options.url, res.headers.location), options));
				return;
			}

			// normalize location header for manual redirect mode
			var headers = new _headers2.default();
			for (var _iterator = (0, _keys2.default)(res.headers), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
				var _ref;

				if (_isArray) {
					if (_i >= _iterator.length) break;
					_ref = _iterator[_i++];
				} else {
					_i = _iterator.next();
					if (_i.done) break;
					_ref = _i.value;
				}

				var _name = _ref;

				if (Array.isArray(res.headers[_name])) {
					for (var _iterator2 = res.headers[_name], _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
						var _ref2;

						if (_isArray2) {
							if (_i2 >= _iterator2.length) break;
							_ref2 = _iterator2[_i2++];
						} else {
							_i2 = _iterator2.next();
							if (_i2.done) break;
							_ref2 = _i2.value;
						}

						var val = _ref2;

						headers.append(_name, val);
					}
				} else {
					headers.append(_name, res.headers[_name]);
				}
			}
			if (options.redirect === 'manual' && headers.has('location')) {
				headers.set('location', (0, _url.resolve)(options.url, headers.get('location')));
			}

			// prepare response
			var body = res.pipe(new _stream.PassThrough());
			var response_options = {
				url: options.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: options.size,
				timeout: options.timeout
			};

			// response object
			var output = void 0;

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no content-encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!options.compress || options.method === 'HEAD' || !headers.has('content-encoding') || res.statusCode === 204 || res.statusCode === 304) {
				output = new _response2.default(body, response_options);
				resolve(output);
				return;
			}

			// otherwise, check for gzip or deflate
			var name = headers.get('content-encoding');

			// for gzip
			if (name == 'gzip' || name == 'x-gzip') {
				body = body.pipe(zlib.createGunzip());
				output = new _response2.default(body, response_options);
				resolve(output);
				return;

				// for deflate
			} else if (name == 'deflate' || name == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				var raw = res.pipe(new _stream.PassThrough());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					output = new _response2.default(body, response_options);
					resolve(output);
				});
				return;
			}

			// otherwise, use response as-is
			output = new _response2.default(body, response_options);
			resolve(output);
			return;
		});

		// accept string, buffer or readable stream as body
		// per spec we will call tostring on non-stream objects
		if (typeof options.body === 'string') {
			req.write(options.body);
			req.end();
		} else if (options.body instanceof Buffer) {
			req.write(options.body);
			req.end();
		} else if ((0, _typeof3.default)(options.body) === 'object' && options.body.pipe) {
			options.body.pipe(req);
		} else if ((0, _typeof3.default)(options.body) === 'object') {
			req.write(options.body.toString());
			req.end();
		} else {
			req.end();
		}
	});
};

module.exports = fetch;

/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;
/**
 * Option to make newly constructed Headers objects conformant to the
 * **latest** version of the Fetch Standard. Note, that most other
 * implementations of fetch() have not yet been updated to the latest
 * version, so enabling this option almost certainly breaks any isomorphic
 * attempt. Also, changing this variable will only affect new Headers
 * objects; existing objects are not affected.
 */
fetch.FOLLOW_SPEC = false;
fetch.Response = _response2.default;
fetch.Headers = _headers2.default;
fetch.Request = _request2.default;