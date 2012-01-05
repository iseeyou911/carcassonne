/**
 * 
 */

dojo.provide("ru.vtsft.tes.engine.Engine");

ru.vtsft.tes.engine.Engine = function (global, $){
	global.$ = $;
	global.exports = {};

	$.require("ru.vtsft.tes.engine.Global");
	$.require("ru.vtsft.tes.engine.Core");
	$.require("ru.vtsft.tes.engine.LoaderFactory");	
	$.require("ru.vtsft.tes.engine.ModuleManager");
	$.require("ru.vtsft.tes.engine.EventManager");
	$.require("ru.vtsft.tes.engine.PageManager");
	$.require("ru.vtsft.tes.services.ServiceControllerV2");
    $.require("ru.vtsft.tes.engine.SecurityManager");

	/**
	 * Create instance of Core
	 */
	var Core = new ru.vtsft.tes.engine.Core();
	
	/**
	 * Initialize loader factory
	 */
	var LoaderFactory = new ru.vtsft.tes.engine.LoaderFactory({
		core : Core
	})

	/**
	 * Initialize module manager
	 */
	var ModuleManager = new ru.vtsft.tes.engine.ModuleManager({
		core : Core,
		loaderFactory : LoaderFactory
	});

	/**
	 * Initialize event manager
	 */
	var EventManager = new ru.vtsft.tes.engine.EventManager();

    /**
     * Initialize services
     */
    var ServiceController = new ru.vtsft.tes.services.ServiceControllerV2({
        eventManager : EventManager
    });



    /**
     * Initialize SecurityManager
     */
    var SecurityManager = ru.vtsft.tes.engine.SecurityManager({
        signinService: $.hitch(ServiceController , "signin"),
        signoutService: $.hitch(ServiceController, "signout"),
        saveOperatorService: $.hitch(ServiceController , "saveOperator"),
        getOperatorService: $.hitch(ServiceController , "getOperator")
    });

    /**
	 * Initialize page manager
	 */
	var PageManager = new ru.vtsft.tes.engine.PageManager({
		eventManager : EventManager,
        securityManager : SecurityManager,
		core : Core
	});

    /**
	 * Configurating Core
	 */
	Core.moduleManager = ModuleManager;
	Core.eventManager = EventManager;

	/**
	 * Globals
	 */
	global.fire = $.hitch(EventManager, "fire");
    global.bind = $.hitch(EventManager, "bind");

    /**
     * Page manager public function
     */
    global.pageManager = {}
    global.pageManager.switchPage = $.hitch(PageManager, "switchPage");
    global.pageManager.toStartPage  = $.hitch(PageManager, "toStartPage");
    global.pageManager.reload  = $.hitch(PageManager, "reload");
    global.pageManager.getActualPages = $.hitch(PageManager, "getActualPages");
    global.pageManager.setSubpage = $.hitch(PageManager, "setSubpage");
    global.pageManager.getSubpage = function () {return PageManager.currentSubPage};
    /**
     * Security manager public function
     */
    global.securityManager = {};
    global.securityManager.signIn = $.hitch(SecurityManager, "signIn");
    global.securityManager.signOut = $.hitch(SecurityManager, "signOut");
    global.securityManager.isAuth = $.hitch(SecurityManager, "isAuth");
    global.securityManager.hasPermission = $.hitch(SecurityManager, "hasPermission");
    global.securityManager.hasAccess = $.hitch(SecurityManager, "hasAccess");
    global.securityManager.getUserData = $.hitch(SecurityManager, "getUserData");
    global.securityManager.getProperty = $.hitch(SecurityManager, "getProperty");
    global.securityManager.saveUserProperties = $.hitch(SecurityManager, "saveUserProperties");
    global.securityManager.sessionCookie = $.hitch(SecurityManager, "sessionCookie");

    global.services = ServiceController;
    /**
     * chain of Initialization: SecurityManager -> Core -> PageManager
     */
	return SecurityManager.init().then(function () {
        return Core.init(rootPath.replace(/\/$/, "") + "/index.json");
    }).then(function (){
        return PageManager.init(Core.descriptor.pageManager)
    })

};