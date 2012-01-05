/**
 * 
 */

$.provide("ru.vtsft.tes.engine.module.IModule");
$.declare ("ru.vtsft.tes.engine.module.IModule", null, {
	sandbox : {},
    isRunning : false,
    isInit : false,
    handlers : [],
    init : function (sandbox){
		this.sandbox = sandbox;
		this.locale = this.sandbox.getLocale();
        this._init();
        this.isInit = true;
	},
	
	run : function (callback){
        if (!this.isInit) {
            throw new Error("Module wasn't initialized");
        }

        this._run();
        this.isRunning = true;
	},

	stop : function (){
        if (!this.isRunning) {
            throw new Error("Module wasn't running");
        }
        this._stop();
		this.isRunning = false;
	},

	destroy : function () {
        this._destroy();
        this.isInit = false;
        if (this.isRunning) {
            this.stop();
        }
        
		this.sandbox.unbindAll();

        $.forEach(this.handlers, function (item){
            $.disconnect(item);
        });
        this.handlers =  new Array();
	},

    _init : function (){

    },
    _destroy : function (){

    },
    _run : function (){

    },
    _stop : function (){

    },
    connect : function (object, event, callback){
        var handler = $.connect(object, event, callback);
        this.handlers.push(handler);
        return handler;
    }
});