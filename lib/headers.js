'use strict';

exports.__esModule = true;
exports.MAP = undefined;

var _toStringTag = require('babel-runtime/core-js/symbol/to-string-tag');

var _toStringTag2 = _interopRequireDefault(_toStringTag);

var _iterator7 = require('babel-runtime/core-js/symbol/iterator');

var _iterator8 = _interopRequireDefault(_iterator7);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _common = require('./common.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

function sanitizeName(name) {
	name += '';
	if (!(0, _common._checkIsHttpToken)(name)) {
		throw new TypeError(name + ' is not a legal HTTP header name');
	}
	return name.toLowerCase();
}

function sanitizeValue(value) {
	value += '';
	if ((0, _common._checkInvalidHeaderChar)(value)) {
		throw new TypeError(value + ' is not a legal HTTP header value');
	}
	return value;
}

var MAP = exports.MAP = (0, _symbol2.default)('map');
var FOLLOW_SPEC = (0, _symbol2.default)('followSpec');

var Headers = function () {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	function Headers(headers) {
		(0, _classCallCheck3.default)(this, Headers);

		this[MAP] = (0, _create2.default)(null);
		this[FOLLOW_SPEC] = Headers.FOLLOW_SPEC;

		// Headers
		if (headers instanceof Headers) {
			var init = headers.raw();
			for (var _iterator = (0, _keys2.default)(init), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
				var _ref;

				if (_isArray) {
					if (_i >= _iterator.length) break;
					_ref = _iterator[_i++];
				} else {
					_i = _iterator.next();
					if (_i.done) break;
					_ref = _i.value;
				}

				var name = _ref;

				for (var _iterator2 = init[name], _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
					var _ref2;

					if (_isArray2) {
						if (_i2 >= _iterator2.length) break;
						_ref2 = _iterator2[_i2++];
					} else {
						_i2 = _iterator2.next();
						if (_i2.done) break;
						_ref2 = _i2.value;
					}

					var value = _ref2;

					this.append(name, value);
				}
			}
		} else if (Array.isArray(headers)) {
			// array of tuples
			for (var _iterator3 = headers, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
				var _ref3;

				if (_isArray3) {
					if (_i3 >= _iterator3.length) break;
					_ref3 = _iterator3[_i3++];
				} else {
					_i3 = _iterator3.next();
					if (_i3.done) break;
					_ref3 = _i3.value;
				}

				var el = _ref3;

				if (!Array.isArray(el) || el.length !== 2) {
					throw new TypeError('Header pairs must contain exactly two items');
				}
				this.append(el[0], el[1]);
			}
		} else if ((typeof headers === 'undefined' ? 'undefined' : (0, _typeof3.default)(headers)) === 'object') {
			// plain object
			for (var _iterator4 = (0, _keys2.default)(headers), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
				var _ref4;

				if (_isArray4) {
					if (_i4 >= _iterator4.length) break;
					_ref4 = _iterator4[_i4++];
				} else {
					_i4 = _iterator4.next();
					if (_i4.done) break;
					_ref4 = _i4.value;
				}

				var prop = _ref4;

				// We don't worry about converting prop to ByteString here as append()
				// will handle it.
				this.append(prop, headers[prop]);
			}
		}
	}

	/**
  * Return first header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */


	Headers.prototype.get = function get(name) {
		var list = this[MAP][sanitizeName(name)];
		if (!list) {
			return null;
		}

		return this[FOLLOW_SPEC] ? list.join(',') : list[0];
	};

	/**
  * Return all header values given name
  *
  * @param   String  name  Header name
  * @return  Array
  */


	Headers.prototype.getAll = function getAll(name) {
		if (!this.has(name)) {
			return [];
		}

		return this[MAP][sanitizeName(name)];
	};

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */


	Headers.prototype.forEach = function forEach(callback, thisArg) {
		var _this = this;

		var _loop = function _loop(name) {
			_this[MAP][name].forEach(function (value) {
				callback.call(thisArg, value, name, _this);
			});
		};

		for (var name in this[MAP]) {
			_loop(name);
		}
	};

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */


	Headers.prototype.set = function set(name, value) {
		this[MAP][sanitizeName(name)] = [sanitizeValue(value)];
	};

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */


	Headers.prototype.append = function append(name, value) {
		if (!this.has(name)) {
			this.set(name, value);
			return;
		}

		this[MAP][sanitizeName(name)].push(sanitizeValue(value));
	};

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */


	Headers.prototype.has = function has(name) {
		return !!this[MAP][sanitizeName(name)];
	};

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */


	Headers.prototype.delete = function _delete(name) {
		delete this[MAP][sanitizeName(name)];
	};

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	Headers.prototype.raw = function raw() {
		return this[MAP];
	};

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */


	Headers.prototype.keys = function keys() {
		var keys = [];
		if (this[FOLLOW_SPEC]) {
			keys = (0, _keys2.default)(this[MAP]).sort();
		} else {
			this.forEach(function (_, name) {
				return keys.push(name);
			});
		};
		return (0, _getIterator3.default)(keys);
	};

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */


	Headers.prototype.values = _regenerator2.default.mark(function values() {
		var _this2 = this;

		var _iterator5, _isArray5, _i5, _ref5, name;

		return _regenerator2.default.wrap(function values$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						if (!this[FOLLOW_SPEC]) {
							_context2.next = 19;
							break;
						}

						_iterator5 = this.keys(), _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);

					case 2:
						if (!_isArray5) {
							_context2.next = 8;
							break;
						}

						if (!(_i5 >= _iterator5.length)) {
							_context2.next = 5;
							break;
						}

						return _context2.abrupt('break', 17);

					case 5:
						_ref5 = _iterator5[_i5++];
						_context2.next = 12;
						break;

					case 8:
						_i5 = _iterator5.next();

						if (!_i5.done) {
							_context2.next = 11;
							break;
						}

						return _context2.abrupt('break', 17);

					case 11:
						_ref5 = _i5.value;

					case 12:
						name = _ref5;
						_context2.next = 15;
						return this.get(name);

					case 15:
						_context2.next = 2;
						break;

					case 17:
						_context2.next = 20;
						break;

					case 19:
						return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
							var values;
							return _regenerator2.default.wrap(function _callee$(_context) {
								while (1) {
									switch (_context.prev = _context.next) {
										case 0:
											values = [];

											_this2.forEach(function (value) {
												return values.push(value);
											});
											return _context.delegateYield((0, _getIterator3.default)(values), 't0', 3);

										case 3:
										case 'end':
											return _context.stop();
									}
								}
							}, _callee, _this2);
						})(), 't0', 20);

					case 20:
					case 'end':
						return _context2.stop();
				}
			}
		}, values, this);
	});

	/**
  * Get an iterator on entries.
  *
  * @return  Iterator
  */

	Headers.prototype.entries = _regenerator2.default.mark(function entries() {
		var _this3 = this;

		var _iterator6, _isArray6, _i6, _ref6, name;

		return _regenerator2.default.wrap(function entries$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						if (!this[FOLLOW_SPEC]) {
							_context4.next = 19;
							break;
						}

						_iterator6 = this.keys(), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : (0, _getIterator3.default)(_iterator6);

					case 2:
						if (!_isArray6) {
							_context4.next = 8;
							break;
						}

						if (!(_i6 >= _iterator6.length)) {
							_context4.next = 5;
							break;
						}

						return _context4.abrupt('break', 17);

					case 5:
						_ref6 = _iterator6[_i6++];
						_context4.next = 12;
						break;

					case 8:
						_i6 = _iterator6.next();

						if (!_i6.done) {
							_context4.next = 11;
							break;
						}

						return _context4.abrupt('break', 17);

					case 11:
						_ref6 = _i6.value;

					case 12:
						name = _ref6;
						_context4.next = 15;
						return [name, this.get(name)];

					case 15:
						_context4.next = 2;
						break;

					case 17:
						_context4.next = 20;
						break;

					case 19:
						return _context4.delegateYield(_regenerator2.default.mark(function _callee2() {
							var entries;
							return _regenerator2.default.wrap(function _callee2$(_context3) {
								while (1) {
									switch (_context3.prev = _context3.next) {
										case 0:
											entries = [];

											_this3.forEach(function (value, name) {
												return entries.push([name, value]);
											});
											return _context3.delegateYield((0, _getIterator3.default)(entries), 't0', 3);

										case 3:
										case 'end':
											return _context3.stop();
									}
								}
							}, _callee2, _this3);
						})(), 't0', 20);

					case 20:
					case 'end':
						return _context4.stop();
				}
			}
		}, entries, this);
	});

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */

	Headers.prototype[_iterator8.default] = function () {
		return this.entries();
	};

	/**
  * Tag used by `Object.prototype.toString()`.
  */


	(0, _createClass3.default)(Headers, [{
		key: _toStringTag2.default,
		get: function get() {
			return 'Headers';
		}
	}]);
	return Headers;
}();

exports.default = Headers;


Headers.FOLLOW_SPEC = false;