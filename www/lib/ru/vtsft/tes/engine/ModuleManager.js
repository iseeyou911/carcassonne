
/**
 * Module manager
 */

$.require("ru.vtsft.tes.engine.Global");

$.provide("ru.vtsft.tes.engine.ModuleManager");
$.declare("ru.vtsft.tes.engine.ModuleManager", null, {
	
	modules : {},
	
	templates : {},
	
	descriptors : {},
	
	locales : {},
	
	/**
	 * Constructor
	 * 
	 * @params args 
	 * {
	 * 	core : Core,
	 * 	loaderFactory : LoaderFactory
	 * }
	 */	
	constructor : function (args) {
		$.safeMixin(this, args || {});
		
		this.getModule = this.loaderFactory.get(this.modules, this.pushModule, '$0.js', this, MODULE);
		this.getTemplate = this.loaderFactory.get(this.templates, this.pushTemplate, '$0.html', this, TEMPLATE);
		this.getDescriptor = this.loaderFactory.get(this.descriptors, this.pushDescriptor, '$0.json', this, DESCRIPTOR);
		this.getLocale = this.loaderFactory.get(this.locales, this.pushLocale, '$0.json', this, LOCALE);
	},
	
	pushModule : function (name, module) {
		if (module && !exports[name]) {
			exports[name] = module;
		}
		
		this.modules[name] = (new exports[name]()) || {};
	},
	
	pushTemplate : function (name, template) {
		this.templates[name] = template || {};
	},
	
	pushDescriptor : function (name, descriptor) {
		this.descriptors[name] = descriptor || {};
	},
	
	pushLocale : function (name, locale) {
		this.locales[name] = locale || {};
	},
	
	load : function (name, hasLayout) {
		if (hasLayout) {
			return [this.getModule(name), this.getTemplate(name), this.getDescriptor(name), this.getLocale(name)];
		} else {
			return [this.getModule(name), this.getDescriptor(name), this.getLocale(name)];
		}
	}
});

