/**
 * Sandbox
 */

$.provide("ru.vtsft.tes.engine.SandBox");

/**
 * Constructor
 *
 * @params args
 * {
 * 	descriptor : Descriptor,
 * 	core : Core
 * }
 */
ru.vtsft.tes.engine.SandBox = function (args) {
	var self = this;	
	
	$.safeMixin(this, args || {});
	this.core = null;
	
	/**
	 * Private fields
	 */
	
	var core = args.core;
	var eventManager = core.eventManager;

	/**
	 * Public fields
	 */
	
	this.eventHandler = {};
	this.hooks = {};

	/**
	 * Public methods
	 */
	
	this.getBox = function () {
		return core.getBox(this.descriptor.name);
	}
	
	this.fire = function (event, data, namespace) {

		namespace = namespace || this.descriptor.name;

		if (is("fire", namespace, event)) {
			eventManager.fire(createEventName(event, namespace), data || {});
		}
		return this;
	}
	
	this.bind = function (event, callback, namespace) {

		namespace = namespace || this.descriptor.name

		if (is("listen", namespace,  event)) {

			event = createEventName(event, namespace);

			if (!this.eventHandler[event]) {
				this.eventHandler[event] = new Array();
			}

            /**
             * checking that this event not yet binded
             */
            if (!$.some(this.eventHandler[event], function (item, index) {
					return item.callback === callback
				})) {
                handler = eventManager.bind(event, callback);

                this.eventHandler[event].push({
                    'callback' : callback,
                    'handler' : handler
                }) ;
            }

		}
		return this;
	}
	
	this.unbind = function (event, callback, namespace) {

		self = this;
        
			if (arguments.length == 2) {
                event = namespace  + event;
				$.forEach(this.eventHandler[event], function (item, index) {
					if (item.callback === callback) {
						eventManager.unbind(item.handler);
					}
				});
			} else if (arguments.length == 1) {
				eventManager.unbind(event);
			}

		return this;
	}
	
	this.unbindAll = function () {
		that = this;
        for (var i in this.eventHandler){
            $.forEach(this.eventHandler[i], function (item) {
                that.unbind(item.handler);
            });
        }

	}
	
	this.hook = function (event, hookFunc) {
		namespace = this.descriptor.name

		if (is("hook", namespace, event)) {
			event = namespace+ event;
			eventManager.hook(event, hookFunc);
			this.hooks.push(event);
		}
	}
	
	this.unhook = function (event) {

		namespace = this.descriptor.name

		if (is("hook", namespace, event)) {
			event = namespace+ event;
			eventManager.unhook(event);
		}
	}

	this.getAvailableActionListener = function() {
		return this.descriptor.acl.listen
	}

	this.getResource = function (resource) {
		return this.descriptor.resources[resource];
	}
	
	this.getTemplate = function () {
		return core.getTemplate(this.descriptor.name);
	}
	
	this.getLocale = function (){
		return core.getLocale(this.descriptor.name);
	}
	
	this.getText = function (text) {
		return core.getText(text, this.descriptor.name);
	}
	
	/**
	 * Private methods
	 */
	
	var is = function (role, namespace, event) {
		if (arguments.length === 3 &&
        self.descriptor &&
		self.descriptor.acl[role] &&
		self.descriptor.acl[role][namespace] &&
		(self.descriptor.acl[role][namespace][event] || self.descriptor.acl[role][namespace]["_all_"] )) {
			return true;
		} else {
            console.warn($.string.substitute("(${role}) event ${event} not found in ${namespace}", {
                role : role,
                namespace : namespace,
                event : event
            }))
        }
	}
	
	var createEventName = function (event, namespace) {
		return "/" + (namespace || self.descriptor.name) + "/" + event;
	}
}

