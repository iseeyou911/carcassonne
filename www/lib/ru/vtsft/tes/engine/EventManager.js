
/**
 * Event manager
 * 
 */

$.provide("ru.vtsft.tes.engine.EventManager");
$.declare("ru.vtsft.tes.engine.EventManager",null,{
	
	hooks : {},
	
	fire : function (event, data, namespace) {

        if (namespace) {
            event = "/" + namespace + "/" + event
        }

		if (this.hooks[event]) {
			var result = this.hooks(data);
			
			if (result === false) {
				return this;
			} 
			
			data = result || data;
		}
		
		$.publish(event, [{type : event}, data]);
		
		return this;
	},
	
	bind : function (event, callback, namespace) {
        if (namespace) {
            event = "/" + namespace + "/" + event
        }

		return $.subscribe(event, callback);
	},
	
	unbind : function (handle) {
		$.unsubscribe(handle);
		return this;
	},
	
	hook : function (event, hookFunction) {
		this.hooks[event] = hookFunction;
		return this;
	},
	
	unhook : function (event) {
		delete this.hooks[event];
		return this;
	}
});


