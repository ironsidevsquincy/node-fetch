'use strict';

exports.__esModule = true;

var _toStringTag = require('babel-runtime/core-js/symbol/to-string-tag');

var _toStringTag2 = _interopRequireDefault(_toStringTag);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _url = require('url');

var _headers = require('./headers.js');

var _headers2 = _interopRequireDefault(_headers);

var _body = require('./body');

var _body2 = _interopRequireDefault(_body);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
var Request = function (_Body) {
	(0, _inherits3.default)(Request, _Body);

	function Request(input) {
		var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		(0, _classCallCheck3.default)(this, Request);

		var parsedURL = void 0;

		// normalize input
		if (!(input instanceof Request)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = (0, _url.parse)(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = (0, _url.parse)(input + '');
			}
			input = {};
		} else {
			parsedURL = (0, _url.parse)(input.url);
		}

		// fetch spec options
		var _this = (0, _possibleConstructorReturn3.default)(this, _Body.call(this, init.body || (0, _body.clone)(input), {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		}));

		_this.method = init.method || input.method || 'GET';
		_this.redirect = init.redirect || input.redirect || 'follow';
		_this.headers = new _headers2.default(init.headers || input.headers || {});

		// server only options
		_this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		_this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		_this.counter = init.counter || input.counter || 0;
		_this.agent = init.agent || input.agent;

		// server request options
		(0, _assign2.default)(_this, parsedURL);
		return _this;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	Request.prototype.clone = function clone() {
		return new Request(this);
	};

	/**
  * Tag used by `Object.prototype.toString()`.
  */


	(0, _createClass3.default)(Request, [{
		key: 'url',
		get: function get() {
			return (0, _url.format)(this);
		}
	}, {
		key: _toStringTag2.default,
		get: function get() {
			return 'Request';
		}
	}]);
	return Request;
}(_body2.default);
/**
 * request.js
 *
 * Request class contains server only options
 */

exports.default = Request;