/**
 * Globals
 */

//-------------------------Constants--------------------------

dojo.provide("ru.vtsft.tes.engine.Global");

window.restReportService = /*replace to=^${reportServerUrl}^*/'http://localhost:28080/tes-report/'/*/replace*/;
window.restService = /*replace to=^${restServiceUrl}^*/'http://localhost:18080/travel-ext-services/'/*/replace*/;
window.birtServer = /*replace to=^${birtServerUrl}^*/'http://localhost:18080/travel-ext-services/'/*/replace*/;
window.rootPath = /*replace to=^${rootPath}^*/'/'/*/replace*/;
window.appVersion = /*replace to=^"${project.version}"^*/"0.6"/*/replace*/;

window.MODULE = "MODULE";
window.TEMPLATE = "TEMPLATE";
window.DESCRIPTOR = "DESCRIPTOR";
window.LOCALE = "LOCALE";

window.ROLE = {
    USER : 1,
    MODERATOR : 2,
    ADMIN : 3
}


window.EXCEPTION = {
	CORE_STARTUP_FAILED : new Error("STARTUP_FAILED"),
	MODULE_BOX_NOT_FOUND : new Error("MODULE_BOX_NOT_FOUND"),
	PAGE_MANAGER_INIT_FAILED : new Error("PAGE_MANAGER_INIT_FAILED"),
	MODULE_RUN_FAILED : new Error("MODULE_RUN_FAILED"),
	MODULE_STOP_FAILED : new Error("MODULE_STOP_FAILED"),
    MODULE_INIT_FAILED : new Error("MODULE_INIT_FAILED"),
	PAGE_NOT_FOUND : new Error("PAGE_NOT_FOUND"),
    NO_USER_EXCEPTION : new Error("NO_USER_EXCEPTION")
}
