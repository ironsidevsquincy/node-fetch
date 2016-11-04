'use strict';

exports.__esModule = true;

var _toStringTag = require('babel-runtime/core-js/symbol/to-string-tag');

var _toStringTag2 = _interopRequireDefault(_toStringTag);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _http = require('http');

var _headers = require('./headers.js');

var _headers2 = _interopRequireDefault(_headers);

var _body = require('./body');

var _body2 = _interopRequireDefault(_body);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
var Response = function (_Body) {
	(0, _inherits3.default)(Response, _Body);

	function Response() {
		var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		(0, _classCallCheck3.default)(this, Response);

		var _this = (0, _possibleConstructorReturn3.default)(this, _Body.call(this, body, opts));

		_this.url = opts.url;
		_this.status = opts.status || 200;
		_this.statusText = opts.statusText || _http.STATUS_CODES[_this.status];
		_this.headers = new _headers2.default(opts.headers);
		return _this;
	}

	/**
  * Convenience property representing if the request ended normally
  */


	/**
  * Clone this response
  *
  * @return  Response
  */
	Response.prototype.clone = function clone() {

		return new Response((0, _body.clone)(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok
		});
	};

	/**
  * Tag used by `Object.prototype.toString()`.
  */


	(0, _createClass3.default)(Response, [{
		key: 'ok',
		get: function get() {
			return this.status >= 200 && this.status < 300;
		}
	}, {
		key: _toStringTag2.default,
		get: function get() {
			return 'Response';
		}
	}]);
	return Response;
}(_body2.default);
/**
 * response.js
 *
 * Response class provides content decoding
 */

exports.default = Response;