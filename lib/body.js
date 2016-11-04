'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

exports.clone = clone;

var _encoding = require('encoding');

var _isStream = require('is-stream');

var _isStream2 = _interopRequireDefault(_isStream);

var _bufferToArraybuffer = require('buffer-to-arraybuffer');

var _bufferToArraybuffer2 = _interopRequireDefault(_bufferToArraybuffer);

var _stream = require('stream');

var _fetchError = require('./fetch-error.js');

var _fetchError2 = _interopRequireDefault(_fetchError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DISTURBED = (0, _symbol2.default)('disturbed');
/**
 * body.js
 *
 * Body interface provides common methods for Request and Response
 */

var CONSUME_BODY = (0, _symbol2.default)('consumeBody');

/**
 * Body class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */

var Body = function () {
	function Body(body) {
		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    _ref$size = _ref.size,
		    size = _ref$size === undefined ? 0 : _ref$size,
		    _ref$timeout = _ref.timeout,
		    timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

		(0, _classCallCheck3.default)(this, Body);

		this.body = body;
		this[DISTURBED] = false;
		this.size = size;
		this.timeout = timeout;
	}

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	Body.prototype.arrayBuffer = function arrayBuffer() {
		return this[CONSUME_BODY]().then(function (buf) {
			return (0, _bufferToArraybuffer2.default)(buf);
		});
	};

	/**
  * Decode response as json
  *
  * @return  Promise
  */


	Body.prototype.json = function json() {
		// for 204 No Content response, buffer will be empty, parsing it will throw error
		if (this.status === 204) {
			return Body.Promise.resolve({});
		}

		return this[CONSUME_BODY]().then(function (buffer) {
			return JSON.parse(buffer.toString());
		});
	};

	/**
  * Decode response as text
  *
  * @return  Promise
  */


	Body.prototype.text = function text() {
		return this[CONSUME_BODY]().then(function (buffer) {
			return buffer.toString();
		});
	};

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */


	Body.prototype.buffer = function buffer() {
		return this[CONSUME_BODY]();
	};

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */


	Body.prototype.textConverted = function textConverted() {
		var _this = this;

		return this[CONSUME_BODY]().then(function (buffer) {
			return convertBody(buffer, _this.headers);
		});
	};

	/**
  * Decode buffers into utf-8 string
  *
  * @return  Promise
  */


	Body.prototype[CONSUME_BODY] = function () {
		var _this2 = this;

		if (this[DISTURBED]) {
			return Body.Promise.reject(new Error('body used already for: ' + this.url));
		}

		this[DISTURBED] = true;

		// body is null
		if (!this.body) {
			return Body.Promise.resolve(new Buffer(0));
		}

		// body is string
		if (typeof this.body === 'string') {
			return Body.Promise.resolve(new Buffer(this.body));
		}

		// body is buffer
		if (Buffer.isBuffer(this.body)) {
			return Body.Promise.resolve(this.body);
		}

		// body is stream
		// get ready to actually consume the body
		var accum = [];
		var accumBytes = 0;
		var abort = false;

		return new Body.Promise(function (resolve, reject) {
			var resTimeout = void 0;

			// allow timeout on slow response body
			if (_this2.timeout) {
				resTimeout = setTimeout(function () {
					abort = true;
					reject(new _fetchError2.default('Response timeout while trying to fetch ' + _this2.url + ' (over ' + _this2.timeout + 'ms)', 'body-timeout'));
				}, _this2.timeout);
			}

			// handle stream error, such as incorrect content-encoding
			_this2.body.on('error', function (err) {
				reject(new _fetchError2.default('Invalid response body while trying to fetch ' + _this2.url + ': ' + err.message, 'system', err));
			});

			_this2.body.on('data', function (chunk) {
				if (abort || chunk === null) {
					return;
				}

				if (_this2.size && accumBytes + chunk.length > _this2.size) {
					abort = true;
					reject(new _fetchError2.default('content size at ' + _this2.url + ' over limit: ' + _this2.size, 'max-size'));
					return;
				}

				accumBytes += chunk.length;
				accum.push(chunk);
			});

			_this2.body.on('end', function () {
				if (abort) {
					return;
				}

				clearTimeout(resTimeout);
				resolve(Buffer.concat(accum));
			});
		});
	};

	(0, _createClass3.default)(Body, [{
		key: 'bodyUsed',
		get: function get() {
			return this[DISTURBED];
		}
	}]);
	return Body;
}();

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */


exports.default = Body;
function convertBody(buffer, headers) {
	var ct = headers.get('content-type');
	var charset = 'utf-8';
	var res = void 0,
	    str = void 0;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return (0, _encoding.convert)(buffer, 'UTF-8', charset).toString();
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	var p1 = void 0,
	    p2 = void 0;
	var body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if ((0, _isStream2.default)(body) && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new _stream.PassThrough();
		p2 = new _stream.PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance.body = p1;
		body = p2;
	}

	return body;
}

// expose Promise
Body.Promise = global.Promise;