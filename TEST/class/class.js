define(function(require, exports, module) {

	// The base Class implementation.
	function Class(o) {
		// Convert existed function to Class.
		if (!(this instanceof Class) && isFunction(o)) {
			return classify(o)
		}
	}

	module.exports = Class


	// Create a new Class.
	//
	//  var SuperPig = Class.create({
	//    Extends: Animal,
	//    Implements: Flyable,
	//    initialize: function() {
	//      SuperPig.superclass.initialize.apply(this, arguments)
	//    },
	//    Statics: {
	//      COLOR: 'red'
	//    }
	// })
	//
	Class.create = function(parent, properties) {
		if (!isFunction(parent)) {
			properties = parent
			parent = null
		}

		properties || (properties = {})
		parent || (parent = properties.Extends || Class)
		properties.Extends = parent

		// The created class constructor
		function SubClass() {
			// Call the parent constructor.
			parent.apply(this, arguments)

			// Only call initialize in self constructor.
			if (this.constructor === SubClass && this.initialize) {
				this.initialize.apply(this, arguments)
			}
		}

		// Inherit class (static) properties from parent.
		if (parent !== Class) {
			mix(SubClass, parent, parent.StaticsWhiteList)
		}

		// Add instance properties to the subclass.
		implement.call(SubClass, properties)

		// Make subclass extendable.
		return classify(SubClass)
	}


	function implement(properties) {
		var key, value

		for (key in properties) {
			value = properties[key]

			if (Class.Mutators.hasOwnProperty(key)) {
				Class.Mutators[key].call(this, value)
			} else {
				this.prototype[key] = value
			}
		}
	}


	// Create a sub Class based on `Class`.
	Class.extend = function(properties) {
		properties || (properties = {})
		properties.Extends = this

		return Class.create(properties)
	}


	function classify(cls) {
		cls.extend = Class.extend
		cls.implement = implement
		return cls
	}


	// Mutators define special properties.
	// Mutators 定义特殊的属性
	Class.Mutators = {

		'Extends': function(parent) {
			var existed = this.prototype
			var proto = createProto(parent.prototype)

			// Keep existed properties.
			mix(proto, existed)

			// Enforce the constructor to be what we expect.
			proto.constructor = this

			// Set the prototype chain to inherit from `parent`.
			this.prototype = proto

			// Set a convenience property in case the parent's prototype is
			// needed later.
			this.superclass = parent.prototype
		},

		'Implements': function(items) {
			isArray(items) || (items = [items])
			var proto = this.prototype, item

			while (item = items.shift()) {
				mix(proto, item.prototype || item)
			}
		},

		'Statics': function(staticProperties) {
			mix(this, staticProperties)
		}
	}


	// Shared empty constructor function to aid in prototype-chain creation.
	// 提供空构造函数以供原型链使用
	function Ctor() {
	}

	// See: http://jsperf.com/object-create-vs-new-ctor
	/**
	 * 原型构造函数
	 *
	 */
	var createProto = Object.__proto__ ?
		function(proto) {
			return { __proto__: proto }
		} :
		function(proto) {
			Ctor.prototype = proto
			return new Ctor()
		}


	// Helpers
	// ------------

	/**
	 * 混合
	 * 将s中非原型链的属性和方法  --> 添加到r中
	 *
	 * wl什么意思 莫非跟具体业务有关系
	 */
	function mix(r, s, wl) {
		// Copy "all" properties including inherited ones.
		for (var p in s) {
			if (s.hasOwnProperty(p)) {
				if (wl && indexOf(wl, p) === -1) continue

				// 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
				if (p !== 'prototype') {
					r[p] = s[p]
				}
			}
		}
	}

	/**
	 * 判断内置对象利器
	 */
	var toString = Object.prototype.toString

	/**
	 * 判断是不是Array
	 */
	var isArray = Array.isArray || function(val) {
		return toString.call(val) === '[object Array]'
	}

	/**
	 * 判断是不是Function
	 */
	var isFunction = function(val) {
		return toString.call(val) === '[object Function]'
	}

	/**
	 * 定位Array中某个元素的下标
	 * 如果没有返回-1
	 */
	var indexOf = Array.prototype.indexOf ?
		function(arr, item) {
			return arr.indexOf(item)
		} :
		function(arr, item) {
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] === item) {
					return i
				}
			}
			return -1
		}
})
