define(function () {

	//向外提供的接口
	return {
		Class: Class
	};

	function Class(o) {
		if (!(this instanceof Class) && isFunction(o)) {
			return classify(o);
		}
	};

	Class.create = function (parent, properties) {
		if (!isFunction(parent)) {
			properties = parent;
			parent = null;
		}

		properties || (properties = {});
		parent || (parent = properties.Extends || Class);
		properties.Extends = parent;

		function SubClass() {
			parent.apply(this, arguments);
			if (this.constructor === subClass && this.initialize) {
				this.initialize.apply(this, arguments);
			}
		}

		if (parent !== Class) {
			//?StaticsWhiteList
			mix(SubClass, parent, parent.StaticsWhiteList);
		}

		implement.call(SubClass, properties);

		return classify(SubClass);
	};

	function implement(properties) {
		var key, value;
		for (key in properties) {
			value = properties[key];

			if (Class.Mutators.hasOwnProperty(key)) {
				Class.Mutators[key].call(this, value);
			} else {
				this.prototype[key] = value;
			}
		}
	};

	Class.extend = function (properties) {
		properties || (properties = {});
		properties.Extends = this;

		return Class.create(properties);
	};

	function classify(clazz) {
		clazz.extend = Class.extend;
		clazz.implement = implement;
		return clazz;
	};

	Class.Mutators = {
		'Extends': function (parent) {
			var existed = this.prototype;
			var proto = createProto(parent.prototype);

			//保留已有的属性
			mix(proto, existed);

			//将构造函数赋值为我们期待的那样
			proto.constructor = this;

			//将原型链设置为继承自"parent"
			this.prototype = proto;

			//设置parent的一个原型属性，供以后方便使用
			this.superclass = parent.prototype;
		},

		'Implements': function (item) {
			isArray(item) || (items = [item]);
			var proto = this.prototype, item;

			while (item = ites.shift()) {
				mix(proto, item.prototype || item);
			}
		},

		'Statics': function (staticProperties) {
			mix(this, staticProperties);
		}

	}

	/**
	 * 为了下面createProto函数服务
	 * 共享空的构造函数 为了原型链的创建
	 * @constructor
	 */
	function ProtoChainHelper() {

	}

	/**
	 * 创建对象的原型链
	 * @type {Function}
	 */
	var createProto = Object.__proto__ ?
		function (proto) {
			return {
				__proto__: proto
			};
		} :
		function (proto) {
			ProtoChainHelper.prototype = proto;
			return new ProtoChainHelper();
		}

	// ------------------

	/**
	 * 继承， sub继承sup
	 * 只是继承本身具有的属性和方法，不会继承原型链中的属性和方法
	 * @param sup
	 * @param sub
	 * @param wl
	 */
	function mix(sup, sub, wl) {
		for (var s in sub) {
			if (sub.hasOwnProperty(s)) {
				if (wl && indexOf(wl, s) === -1) {
					continue;
				}
				//在低版本的Safari中， prototype也会被枚举出来， 需排除
				if (s !== 'prototype') {
					sup[s] = sub[s];
				}
			}
		}
	}

	//可以通过toString.call(this)来判断this是js中的内置对象
	//和typeof有着本质的不同typeof判断的粒度比较粗
	//而Object.prototype.toString判断的粒度比较细
	var toString = Object.prototype.toString;

	/**
	 * 判断是否为数组Array
	 * Array.isArray IE6中没有这个属性
	 * @type {Function}
	 */
	var isArray = Array.isArray || function (val) {
		return toString.call(val) === '[object Array]';
	};

	/**
	 * 判断是否为函数function
	 * @param val
	 * @returns {boolean}
	 */
	var isFunction = function (val) {
		return toString.call(val) === '[object Function]';
	};

	/**
	 * 判断元素在数组中的下标
	 * 从0开始
	 * 如果不存在则返回-1
	 * @type {Function}
	 */
	var indexOf = Array.prototype.indexOf ?
		function (arr, item) {
			return arr.indexOf(item);
		} :
		function (arr, item) {
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] === item) {
					return i;
				}
			}
			return -1;
		}
});
