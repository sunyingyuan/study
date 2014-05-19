(function(window,undefined){
	//构造jQuery对象
	var jQuery = (function(){
		var jQuery = function(selector, context){
			return new jQuery.fn.init(selector, context, rootjQuery);
		}
		return jQuery;
	})();
	//...
	//暴露jQuery $
	window.jQuery = window.$ = jQuery;

})(window);