/**
 * Resurce loader
 * 
 */
$.require("ru.vtsft.tes.engine.Global");

$.provide("ru.vtsft.tes.engine.LoaderFactory");
$.declare("ru.vtsft.tes.engine.LoaderFactory", null, {
	
	constructor : function (args) {
		$.safeMixin(this, args || {});
	},
	
	get : function (cacheObject, callback, format, self, type) {
		var that = this;
		return function (name) {
			
			var dfd = null;
			
			if (cacheObject[name]) {
                var dfd = new $.Deferred();
                dfd.cancel();
                callback.call(self, name, cacheObject[name] || {});
				return dfd;
			}

			var path = rootPath.replace(/\/$/, "") + "/" + that.core.descriptor.path[type].replace(/^\//, "") + format.replace('$0', name);

			switch (type) {
				case MODULE :
					dfd = $.xhrGet({
						url: path,
						handleAs: "javascript"
					});
					break;
				case TEMPLATE :
					dfd = $.xhrGet({
						url: path
					});
					break;
				default :
					dfd = $.xhrGet({
						url: path,
						handleAs: "json"
					});
					break;
			}
			
			dfd.then(function(response) {
				callback.call(self, name, response || {});
				var camelCasedType = type.slice(0, 1).toUpperCase() + type.slice(1);
				that.core.eventManager.fire(camelCasedType + "Loaded", {'name' : name});
				return response;
			});
						
			dfd.addErrback(function(object) {
				that.core.eventManager.fire(camelCasedType + "Failed", {'name' : name});
			});
			
			return dfd;
		};
	}
});



