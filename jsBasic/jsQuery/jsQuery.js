/**
 * jsQuery
 * 仿jQuery功能，但是和jQuery写的并非一个等级，只是为了能够更好的理解js
 */
(function () {
	/**
	 * 绑定事件
	 */
	function myAddEvent(obj, sEv, fn) {
		if (obj.attachEvent) {
			obj.attachEvent('on' + sEv, function () {
				fn.call(obj);
			})
		} else {
			obj.addEventListener(sEv, fn, false);
		}
	}

	/**
	 * 通过class获取dom节点对象
	 */
	function getByClass(oParent, sClass) {
		var aEle = oParent.getElementsByTagName('*');
		var aResult = [];
		for (var i = 0; i < aEle.length; i++) {
			if (aEle[i].className == sClass) {
				aResult.push(aEle[i]);
			}
		}
	}

	/**
	 * 获取样式
	 * 兼容
	 * @param obj
	 * @param attr
	 * @returns {*}
	 */
	function getStyle(obj, attr) {
		if (obj.currentStyle) {
			return obj.currentStyle[attr];
		} else {
			return getComputedStyle(obj, false)[attr];
		}
	}

	/**
	 * id class tagName
	 * 选择器
	 */
	function jsQuery(vArg) {
		//用来保存选中的元素
		this.elements = [];
		switch (typeof vArg) {
			case 'function':
				myAddEvent(window, 'load', vArg);
				break;
			case 'string':
				switch (vArg.charAt(0)) {
					case '#':
						var obj = document.getElementById(vArg.substring(1));
						this.elements.push(obj);
						break;
					case '.':
						this.elements = getByClass(document, vArg.substring(1));
						break;
					default:
						this.elements = document.getElementsByName(vArg);
				}
				break;
			case 'object':
				this.elements.push(vArg);
				break;
		}
	}

	/**
	 * click
	 */
	jsQuery.prototype.click = function (fn) {
		for (var i = 0; i < this.elements.length; i++) {
			myAddEvent(this.elements[i], 'click', fn);
		}
	}

	/**
	 * show
	 */
	jsQuery.prototype.show = function () {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].style.display = 'block';
		}
	}

	/**
	 * hide
	 */
	jsQuery.prototype.hide = function () {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].style.display = 'none';
		}
	}

	/**
	 * hover
	 * @param fnOver
	 * @param fnOut
	 */
	jsQuery.prototype.hover = function (fnOver, fnOut) {
		for (var i = 0; i < this.elements.length; i++) {
			myAddEvent(this.elements[i], 'mouseover', fnOver);
			myAddEvent(this.elements[i], 'mouseout', fnOut);
		}
	}

	/**
	 * css
	 * 设置样式 2个参数
	 * 获取样式 1个参数
	 * @param attr
	 * @param value
	 * @returns {*}
	 */
	jsQuery.prototype.css = function (attr, value) {
		if (arguments.length == 2) {//设置样式
			for (var i = 0; i < this.elements; i++) {
				this.elements[i].style[attr] = value;
			}
		} else {
			return getStyles(this.elements[0], attr);
		}
	}

	/**
	 * attr
	 * 设置属性 2个参数
	 * 获取属性 1个参数
	 * @param attr
	 * @param value
	 * @returns {*}
	 */
	jsQuery.prototype.attr = function (attr, value) {
		if (arguments.length == 2) {
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i][attr] = value;
			}
		} else {
			return this.elements[0][attr];
		}
	}

	/**
	 * toggle
	 */
	jsQuery.prototype.toggle = function () {
		var _arguments = arguments;
		for (var i = 0; i < this.elements.length; i++) {
			addToggle(this.elements[i]);
		}
		function addToggle(obj) {
			var count = 0;
			myAddEvent(obj, 'click', function () {
				_arguments[count++ % _arguments.length].call(obj);
			});
		}
	}

	/**
	 * eq
	 * @param n
	 * @returns {jsQuery|jQuery|HTMLElement}
	 */
	jsQuery.prototype.eq = function (n) {
		return $(this.elements[n]);
	}

	function appendAttr(arr1, arr2) {
		for (var i = 0; i < arr2.length; i++) {
			arr1.push(arr2[i]);
		}
	}

	/**
	 * find
	 * .class
	 * tagName
	 * @param str
	 */
	jsQuery.prototype.find = function (str) {
		var aResult = [];
		for (var i = 0; i < this.elements.length; i++) {
			switch (str.charAt(0)) {
				case '.':
					var aEle = getByClass(this.elements[i], str.substring(1));
					aResult = aResult.concat(aEle);
					break;
				default :
					var aEle = this.elements[i].getElementsByTagName(str);
					appentAttr(aResult, aEle);
			}
		}
		var newJsQuery = $();
		newJsQuery.elements = aResult;
		return newJsQuery;
	}

	/**
	 * 得到某个元素兄弟元素中的index
	 * @param obj
	 * @returns {number}
	 */
	function getIndex(obj) {
		var aBrother = obj.parentNode.children;
		for (var i = 0; i < aBrother.length; i++) {
			if (aBrother[i] == obj) {
				return i;
			}
		}
	}

	/**
	 * 得到元素的index
	 * @returns {number}
	 */
	jsQuery.prototype.index = function () {
		return getIndex(this.elements[0]);
	}

	/**
	 * 继承
	 * 为了提供更好的扩展性
	 * @param name
	 * @param fn
	 */
	jsQuery.prototype.extend = function (name, fn) {
		jsQuery.prototype[name] = fn;
	}

	/**
	 * $替代new jsQuery
	 * @param vArg
	 * @returns {jsQuery}
	 */
	function $(vArg) {
		return new jsQuery(vArg);
	}
})();