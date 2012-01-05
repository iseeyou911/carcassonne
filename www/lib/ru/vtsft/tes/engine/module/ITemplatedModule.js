/**
 * 
 */

$.provide("ru.vtsft.tes.engine.module.ITemplatedModule");
$.provide("ru.vtsft.tes.engine.module.ITemplated");
$.require("dijit._Templated");
$.require("dijit._Widget");
$.require("ru.vtsft.tes.engine.module.IModule");
$.require("dojo.parser");

$.declare ("ru.vtsft.tes.engine.module.ITemplatedModule", [ru.vtsft.tes.engine.module.IModule], {

	init : function (sandbox){
		this.sandbox = sandbox;
		this.locale = this.sandbox.getLocale();

		this.box = this.sandbox.getBox();

        if (!this.box) {
            throw new Error("Box not found");
        }

		this.template = new ru.vtsft.tes.engine.module.ITemplated({
			widgetsInTemplate : true,
			templateString : this.sandbox.getTemplate(),
			locale : this.locale,
			_earlyTemplatedStartup : true
		}, this.box);

        this._init();
        this.isInit = true;
	},

    destroy : function() {
        this.inherited(arguments);
        this.template.destroyRecursive();
        for (var i in this.template._startupWidgets){
            this.template._startupWidgets[i].destroyRecursive();
        }
    },
    
    refresh : function() {
        if (!this.isRunning) {
            throw new Error("Module wasn't running");
        }
        this._refresh();
    },

    refresh : function () {

    }

});

$.declare ("ru.vtsft.tes.engine.module.ITemplated", [dijit._Widget, dijit._Templated], {
	constructor : function (args) {
		$.safeMixin(this, args);
	}
})