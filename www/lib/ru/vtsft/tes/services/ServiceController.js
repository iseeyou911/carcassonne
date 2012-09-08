$.provide("ru.vtsft.tes.services.ServiceController");
$.require("ru.vtsft.tes.services.ExtendJsonRestStore");
$.require("dojox.io.xhrPlugins");
$.require("dojox.io.xhrWindowNamePlugin");
$.require("dojo.io.iframe")
$.declare("ru.vtsft.tes.services.ServiceController", null, {

    eventManager : {},

    constructor : function (args) {
        $.safeMixin(this, args)
        dojox.io.xhrPlugins.addCrossSiteXhr(restService, dojox.io.xhrPlugins.fullHttpAdapter);
        dojox.io.xhrPlugins.addCrossSiteXhr(restReportService, dojox.io.xhrPlugins.fullHttpAdapter);
    },
    getPolicyListMetaInformation : function(agentCode, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrGet({
                url : restService + "rest/" + agentCode + "/policyListMetaInformation",
                handleAs: "json",
                preventCache : true
            }), "getPolicyListMetaInformation", silenceMode || false);
        }
    },
    cancelPolicy  : function(policyId, agentCode, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrPost({
                url : restService + "rest/" + agentCode + '/policies/' + policyId + '/tripCancellation',
                handleAs: "json",
                preventCache : true
            }), "cancelPolicy", silenceMode || false)
        }
    },
    returnPolicy  : function(policyId, agentCode, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrPost({
                url : restService + "rest/" + agentCode + '/policies/' + policyId + '/return',
                handleAs: "json",
                preventCache : true
            }), "returnPolicy", silenceMode || false)
        }
    },
    getPolicy  : function(policyId, agentCode, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrGet({
                url : restService + "rest/" + agentCode + '/policies/' + policyId,
                handleAs: "json",
                preventCache : true
            }), "getPolicy", silenceMode || false)
        }
    },
    confirmPolicy  : function(policyId, agentCode, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrPost({
                url : restService + "rest/" + agentCode + '/policies/' + policyId + '/confirm',
                handleAs: "json",
                preventCache : true
            }), "confirmPolicy", silenceMode || false)
        }
    },

    refundPolicy  : function(policyId, declarationNumber, declarationDate, agentCode, silenceMode) {
        if (agentCode) {

            var data = {
                refundPolicyRequest : {
                    declarationNumber : declarationNumber,
                    declarationDate :  dojo.date.stamp.toISOString(declarationDate)
                }
            }
            var self = this;
            return this.serviceTool($.xhrPost({
                headers: {"Content-Type": "application/json"},
                url : restService + 'rest/' + agentCode + '/policies/' + policyId + '/refund/',
                handleAs: "json",
                postData : dojo.toJson(data),
                preventCache : true
            }), "refundPolicy", silenceMode || false)
        }
    },

    exportPolicyList  : function(agentCode, query) {

        if (agentCode) {
            var downloadPdfIframeName = "downloadPdfIframe";
            var iframe = dojo.io.iframe.create(downloadPdfIframeName);
            dojo.io.iframe.setSrc(iframe, restService + "rest/" + agentCode +
                '/exportPolicyList' + ((query) ? '?query=' + encodeURIComponent($.toJson(query)) : ""), true)
        }
    },
    getPolicyListSummary  : function(agentCode, query, silenceMode) {
        if (agentCode) {
            return this.serviceTool($.xhrPost({
                headers: {"Content-Type": "application/json"},
                url : restService + "rest/" + agentCode + '/policyListSummary',
                handleAs: "json",
                postData : $.toJson({policyListSummaryRequest : query}),
                preventCache : true
            }), "getPolicyListSummary", silenceMode || false)
        }
    },
    getPolicyListStore : function(agentCode, callback) {
        var callback = callback ||
            function () {
            }

        if (agentCode) {
            var storeQRS = new ru.vtsft.tes.services.ExtendJsonRestStore({
                target:restService + "rest/" + agentCode + "/policyList",
                requestMethod:"post",
                idAttribute:"policyID",
                processResults : callback,
                preventCache : true,
                transformator : function (result) {
                    var items = [];
                    if (result.getPolicyListResult.returnCode.code == "OK" && result.getPolicyListResult.policyList.policy) {
                        if (result.getPolicyListResult.policyList.policy instanceof Array) {
                            items = result.getPolicyListResult.policyList.policy
                        } else {

                            items = [result.getPolicyListResult.policyList.policy]
                        }
                    }
                    return items;
                }
            });

            return storeQRS;
        }
    },

    getAvailableProducts : function(agentCode, silenceMode) {

        if (agentCode) {
            return this.serviceTool($.xhrGet({
                url : restService + "rest/" + agentCode + '/products',
                handleAs: "json",
                preventCache : true
            }), "getAvailableProducts", silenceMode || false)
        }
    },

    getProductParams : function(agentCode, product, silenceMode) {

        if (agentCode) {
            return this.serviceTool($.xhrGet({
                url : restService + "rest/" + agentCode + '/products/' + product,
                handleAs: "json",
                preventCache : true
            }), "getProductParams", silenceMode || false)
        }
    },

    signin : function (username, password, silenceMode) {
        var data = {
            signinRequest : {
                username : username,
                password :  password
            }
        }

        var self = this;
        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : restService + 'rest/agent/signin/',
            handleAs: "json",
            postData : dojo.toJson(data),
            preventCache : true
        }), "signin", silenceMode || false)
    },

    signout : function (key, silenceMode) {
        var data = {
            signoutRequest : {
                ticket : key || null
            }
        }

        var self = this;
        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : restService + 'rest/agent/signout/',
            handleAs: "json",
            postData : dojo.toJson(data),
            preventCache : true
        }), "signin", silenceMode || false)
    },

    saveOperator : function (userData, silenceMode) {

        var data = {
            saveOperatorRequest : {
                userInfo : userData
            }
        }

        var self = this;
        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json", "ticket" : securityManager.getUserData().ticket},
            url : restService + 'rest/' + userData.name + '/saveOperator/',
            handleAs: "json",
            postData : dojo.toJson(data),
            preventCache : true
        }), "saveOperator", silenceMode || false)
    },

    getReportList : function (agentCode, silenceMode) {
         return this.serviceTool($.xhrGet({
            url : restReportService + 'rest/getReportList?operatorCode=' + agentCode,
            handleAs: "json",
            preventCache : true
        }), "getReportList", silenceMode || false)
    },

    getCurrentReport  : function(agentCode, reportName) {
        if (agentCode) {
            var downloadReportIframe = "downloadReportIframe";
            var iframe = dojo.io.iframe.create(downloadReportIframe);
            dojo.io.iframe.setSrc(iframe, restReportService + "rest/getCurrentReport" + ((reportName) ? '?reportName=' + encodeURIComponent(reportName) : "")+ '&operatorCode=' + encodeURIComponent(agentCode), true)
        }
    },
    
    serviceTool : function (deffired, serviceName, silenceMode) {
        var self = this;
        this.eventManager.fire("/Services/Request", {silenceMode : silenceMode, promise : deffired, name : serviceName});
        $.when(deffired, function (result) {
            self.eventManager.fire("/Services/Response", {silenceMode : silenceMode, name : serviceName, response : result});
            self._resultTransformer(result, serviceName, silenceMode);
        }, function (error) {
            self.eventManager.fire("/Services/TransferError", {silenceMode : silenceMode, name : serviceName, error : error});
        })
        return deffired
    },
    _resultTransformer : function (result, serviceName, silenceMode) {
        result.isOK = false;
        result.data = {};
        for (var a in result) {
            $.safeMixin(result.data, result[a]);
            if (result[a].returnCode && result[a].returnCode.code == "OK") {
                result.isOK = true;
                result[a] = null;
                break;
            } else if (result[a].returnCode && result[a].returnCode.code != "OK") {
                result[a] = null;
                this.eventManager.fire("/Services/ResponseError", {silenceMode : silenceMode, name : serviceName || "", response : result});
                break;
            }
        }
    }

})

