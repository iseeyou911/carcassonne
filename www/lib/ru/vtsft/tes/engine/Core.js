$.require("ru.vtsft.tes.engine.SandBox");
$.require("dojo.DeferredList");
$.provide("ru.vtsft.tes.engine.Core");

$.declare ("ru.vtsft.tes.engine.Core", null, {

	descriptor : {},

	runningModules: {},
    moduleBoxes : {},

	constructor : function (args) {
		$.safeMixin(this, args || {});
		this.descriptor.path = {};
	},

    /**
     * Public core initializer
     * 
     * @param descriptorOrFileName
     * @param callback
     *
     * @return deferred object
     */
	init : function (descriptorOrFileName) {
        var self = this;
        var dfd = new $.Deferred();

		if (typeof descriptorOrFileName === "object") {

			this.descriptor = descriptorOrFileName;
            this._initModules(dfd);

			return dfd;
		}

		$.xhrGet({
			url: descriptorOrFileName,
			handleAs: "json"
		}).then(function (response) {

			self.descriptor = response;
			self._initModules(dfd);

		}, function (error) {
                dfd.reject(error);
			throw  EXCEPTION.CORE_STARTUP_FAILED;
		});
		
		return dfd;
	},

    /**
     * Initializing module by name
     * @param name
     */
	initModule : function (name, box, hasLayout) {
		var self = this;

		return $.when(new dojo.DeferredList(self.moduleManager.load(name, hasLayout || self.descriptor.layout[name])), function (result) {
			self._initModule(name, box);
            return name;
		});

	},

    /**
     *
     * @param name
     */

    refreshModule : function (name, needResize) {
        try {
			this.moduleManager.modules[name].refresh(needResize);
		} catch (e) {
            console.error({module: name , error : e});
			throw EXCEPTION.MODULE_RUN_FAILED;
		}
    },

    /**
     * Running module by name
     * @param name
     */
	runModule : function (name){
        var dfd = new $.Deferred();

		try {
			this.moduleManager.modules[name].run();
            dfd.resolve();
		} catch (e) {
			dfd.reject(e);
            console.error({module: name , error : e});
			throw EXCEPTION.MODULE_RUN_FAILED;
		}

        return dfd;
	},

    /**
     * Stoping module by name
     * @param name
     */
	stopModule : function (name){
		var dfd = new $.Deferred();

		try {
			this.moduleManager.modules[name].stop();
            dfd.resolve();
		} catch (e) {
			dfd.reject(e);
            console.error({module: name , error : e});
			throw EXCEPTION.MODULE_STOP_FAILED;
		}

        return dfd;
	},

    /**
     *
     * @param name
     */
	destroyModule: function (name) {
		if (this.runningModules[name]) {
			this.runningModules[name].destroy();

			$.query(this.getBox(name)).orphan();
			delete this.runningModules[name];
            delete this.moduleBoxes[name];
		}
		return this;
	},
	
	_getBox: function (name) {
		return $.query("[moduleId="+name+"]")[0];
	},

    getBox: function (name) {
		return this.moduleBoxes[name];
	},

	getLocale : function (moduleName) {
		if (this.moduleManager.modules[moduleName]) {
			try {
				return this.moduleManager.locales[moduleName][this.descriptor['locale']];
			} catch (e) {
				console.log("Locale not found in module " + moduleName);
				return "";
			}
		}
	},
	
	getText: function (text, moduleName) {
		if (this.moduleManager.modules[moduleName]) {
			try {
				return this.moduleManager.locales[moduleName][this.descriptor['locale']][text];
			} catch (e) {
				console.warn("Aliase " + text + " not found in module " + moduleName);
				return "";
			}
		}
		return "";
	},
	
	getTemplate : function (moduleName){
		if (this.moduleManager.modules[moduleName]) {
			return 	this.moduleManager.templates[moduleName]
		}
	},
    /**
     * initialization all app modules (page modules wasn't initalized)
     * @param dfd
     */
	_initModules : function (dfd) {
		var self = this;

        try {
            for (var i = 0, c = this.descriptor.modules.length, name, promises = []; i < c; i++) {
                name = this.descriptor.modules[i];
                promises = promises.concat(self.moduleManager.load(name, this.descriptor.layout[name]));
            }

            $.when(new dojo.DeferredList(promises), function (result) {
                for (var i = 0, c = self.descriptor.modules.length, name; i < c; i++) {
                    name = self.descriptor.modules[i];
                    self._initModule(name);
                }

                self.eventManager.fire("/Core/AllModulesLoaded");
                dfd.resolve();
            });
        } catch (e) {
            dfd.reject(e);
        }

	},

    /**
     * Real module initializing
     * @param name
     */
	_initModule : function (name, box) {

		if (this.moduleManager.modules[name]) {
            this.moduleBoxes[name] = box || this._getBox(name);

			var sandbox = new ru.vtsft.tes.engine.SandBox({
				descriptor : this.moduleManager.descriptors[name],
				core : this
			});
            try {
                this.moduleManager.modules[name].init(sandbox);
                this.runningModules[name] = this.moduleManager.modules[name];
                this.eventManager.fire("/Core/ModuleLoaded", {
                    "name" : name
                });
            } catch (e) {
                console.error({module: name, error : e})
                throw EXCEPTION.MODULE_INIT_FAILED;
            }

		} else {
			this.eventManager.fire("/Core/ModuleLoadedFail", {
				"name" : name
			});
		}
	}
});