define(function () {
	/**
	 * 正则表达式用来分裂事件字符串
	 *
	 * \s 匹配任何空白字符，包括空格、制表符、换页符等。与 [ \f\n\r\t\v] 等效。
	 *
	 * @type {RegExp}
	 */

	var eventSplitgter = /\s+/;

	/**
	 * 可以混合到*任何对象*为了向它提供自定义事件的模块。你可以绑定`的`或删除与`关`回调函数的事件;`触发`-ing一个事件触发回调都相继。
	 *
	 *      var object = new Events();
	 *      object.on('expand', function(){ alert('expanded'); });
	 *      object.trigger('expand');
	 *
	 * @constructor
	 */
	function Events() {
	};

	/**
	 * 绑定一个或多个空间分隔的事件，事件``，在``回调函数。路过`“所有”`将回调绑定到发射的所有事件。
	 * @param events
	 * @param callback
	 * @param context
	 * @returns {Events}
	 */
	Events.prototype.on = function (events, callback, context) {
		var cache, event, list;
		if (!callback) {
			return this;
		}
		cache = this.__events || (this.__events = {});
		events = events.split(eventSplitgter);

		while (event = events.shift()) {
			list = cache[event] || (cache[event] = []);
			list.push(callback, context);
		}

		return this;
	};

	/**
	 *
	 * @param events
	 * @param callback
	 * @param context
	 * @returns {Events}
	 */
	Events.prototype.once = function (events, callback, context) {
		var that = this;
		var cb = function () {
			that.off(events, cb);
			callback.apply(context || that, context);
		}
		return this.on(events, cb, context);
	};

	/**
	 * 删除一个或多个回调。如果'上下文'为null，删除与该函数的所有回调。如果'回调'为空，将删除所有回调事件。如果'事件'为null，将删除所有绑定的回调为所有事件。
	 * @param events
	 * @param callback
	 * @param context
	 * @returns {Events}
	 */
	Events.prototype.off = function (events, callback, context) {
		var cache, event, list, i;

		//没有事件或删除所有事件
		if (!(cache = this.__events)) {
			return this;
		}
		if (!(events || callback || context)) {
			delete this.__events;
			return this;
		}

		events = events ? event.split(eventSplitgter) : keys(cache);

		//遍历回调列表，在合适的地方拼接
		while (event = events.shift()) {
			list = cache[event];
			if (!list) continue;

			if (!(callback || context)) {
				delete cache[event];
				continue;
			}

			for (i = list.length - 2; i >= 0; i -= 2) {
				if(!(callback && list[i] !== callback || context && list[i + 1] !== context)){
					list.splice(i, 2);
				}
			}
		}

		return this;
	};
// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.prototype.trigger = function(events) {
		var cache, event, all, list, i, len, rest = [], args, returned = true;
		if (!(cache = this.__events)) return this

		events = events.split(eventSplitter)

		// Fill up `rest` with the callback arguments.  Since we're only copying
		// the tail of `arguments`, a loop is much faster than Array#slice.
		for (i = 1, len = arguments.length; i < len; i++) {
			rest[i - 1] = arguments[i]
		}

		// For each event, walk through the list of callbacks twice, first to
		// trigger the event, then to trigger any `"all"` callbacks.
		while (event = events.shift()) {
			// Copy callback lists to prevent modification.
			if (all = cache.all) all = all.slice()
			if (list = cache[event]) list = list.slice()

			// Execute event callbacks except one named "all"
			if (event !== 'all') {
				returned = triggerEvents(list, rest, this) && returned
			}

			// Execute "all" callbacks.
			returned = triggerEvents(all, [event].concat(rest), this) && returned
		}

		return returned
	}

	Events.prototype.emit = Events.prototype.trigger


	// Helpers
	// -------

	var keys = Object.keys

	if (!keys) {
		keys = function(o) {
			var result = []

			for (var name in o) {
				if (o.hasOwnProperty(name)) {
					result.push(name)
				}
			}
			return result
		}
	}

	// Mix `Events` to object instance or Class function.
	Events.mixTo = function(receiver) {
		receiver = isFunction(receiver) ? receiver.prototype : receiver
		var proto = Events.prototype

		var event = new Events
		Object.keys(proto).forEach(function(key) {
			receiver[key] = function() {
				proto[key].apply(event, Array.prototype.slice.call(arguments))
				return this
			}
		})
	}

	// Execute callbacks
	function triggerEvents(list, args, context) {
		var pass = true

		if (list) {
			var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
			// call is faster than apply, optimize less than 3 argu
			// http://blog.csdn.net/zhengyinhui100/article/details/7837127
			switch (args.length) {
				case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
				case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
				case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
				case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
				default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
			}
		}
		// trigger will return false if one of the callbacks return false
		return pass;
	}

	function isFunction(func) {
		return Object.prototype.toString.call(func) === '[object Function]'
	}

	return Events;

});