$.provide("ru.vtsft.tes.services.ServiceControllerV2");
$.require("ru.vtsft.tes.services.ExtendJsonRestStore");
$.require("dojox.io.xhrPlugins");
$.require("dojox.io.xhrWindowNamePlugin");
$.require("dojo.io.iframe")
$.declare("ru.vtsft.tes.services.ServiceControllerV2", null, {

    restURL : '',

    eventManager : {},

    constructor : function (args) {
        $.safeMixin(this, args)
        dojox.io.xhrPlugins.addCrossSiteXhr(restService, dojox.io.xhrPlugins.fullHttpAdapter);
        dojox.io.xhrPlugins.addCrossSiteXhr(restReportService, dojox.io.xhrPlugins.fullHttpAdapter);

        this.restURL = restService + "rest/v2";
    },
    getPolicyListMetaInformation : function(operatorCode, silenceMode) {
        return this.serviceTool($.xhrGet({
            url : this.restURL + "/policies/list/meta_information.json",
            handleAs: "json",
            preventCache : true,
            content : {
                operatorCode : operatorCode
            }
        }), "getPolicyListMetaInformation", silenceMode || false);
    },
    cancelPolicy  : function(policyId, operatorCode, silenceMode) {
        return this.serviceTool($.xhrGet({
            url : this.restURL + '/policies/trip_cancellation.json',
            handleAs: "json",
            preventCache : true,
            content : {
                id : policyId,
                operatorCode : operatorCode
            }
        }), "cancelPolicy", silenceMode || false)
    },
    returnPolicy  : function(policyId, operatorCode, silenceMode) {
        return this.serviceTool($.xhrGet({
            url : this.restURL + '/policies/return.json',
            handleAs: "json",
            preventCache : true,
            content : {
                id : policyId,
                operatorCode : operatorCode
            }
        }), "returnPolicy", silenceMode || false)
    },
    getPolicy  : function(policyId, operatorCode, silenceMode) {
        return this.serviceTool($.xhrGet({
            url : this.restURL + '/policies/get.json',
            handleAs: "json",
            preventCache : true,
            content : {
                id : policyId,
                operatorCode : operatorCode
            }
        }), "getPolicy", silenceMode || false)
    },
    confirmPolicy  : function(policyId, operatorCode, silenceMode) {

        return this.serviceTool($.xhrGet({
            url : this.restURL + '/policies/confirm.json',
            handleAs: "json",
            preventCache : true,
            content : {
                id : policyId,
                operatorCode : operatorCode
            }
        }), "confirmPolicy", silenceMode || false)

    },

    refundPolicy  : function(policyId, declarationNumber, declarationDate, operatorCode, silenceMode) {

        var data = {
            refundPolicyRequest : {
                declarationNumber : declarationNumber,
                declarationDate :  dojo.date.stamp.toISOString(declarationDate)
            }
        }

        var contents = {
            id : policyId,
            operatorCode : operatorCode
        }

        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : this.restURL + '/policies/refund.json?' + dojo.objectToQuery(contents),
            handleAs: "json",
            postData : dojo.toJson(data),
            preventCache : true

        }), "refundPolicy", silenceMode || false)
    },

    exportPolicyList  : function(operatorCode, query) {
        var downloadPdfIframeName = "downloadPdfIframe";
        var iframe = dojo.io.iframe.create(downloadPdfIframeName);
        dojo.io.iframe.setSrc(iframe, this.restURL +
            '/policies/list/export?operatorCode=' + operatorCode + ((query) ? '&query=' + encodeURIComponent($.toJson(query)) : ""), true)
    },

    getPolicyListSummary  : function(operatorCode, query, silenceMode) {

        var contents = {
            operatorCode : operatorCode
        }

        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : this.restURL + '/policies/list/summary.json?'  + dojo.objectToQuery(contents),
            handleAs: "json",
            postData : $.toJson({policyListSummaryRequest : query}),
            preventCache : true
        }), "getPolicyListSummary", silenceMode || false)
    },
    getPolicyListStore : function(operatorCode, callback) {
        var callback = callback ||
            function () {
            }

        var storeQRS = new ru.vtsft.tes.services.ExtendJsonRestStore({
            target:this.restURL + "/policies/list/get.json",
            requestMethod:"post",
            idAttribute:"policyID",
            processResults : callback,
            preventCache : true,
            content : {
                operatorCode : operatorCode
            },
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
    },

    getAvailableProducts : function(operatorCode, silenceMode) {
        return this.serviceTool($.xhrGet({
            url : this.restURL + '/products/get_available.json',
            handleAs: "json",
            preventCache : true,
            content : {
                operatorCode : operatorCode
            }
        }), "getAvailableProducts", silenceMode || false)
    },

    getProductParams : function(product, operatorCode, calc, silenceMode) {

        return this.serviceTool($.xhrGet({
            url : this.restURL + '/products/params.json',
            handleAs: "json",
            preventCache : true,
            content : {
                operatorCode : operatorCode,
                productCode : product,
                calc : calc
            }
        }), "getProductParams", silenceMode || false)
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
            url : this.restURL + '/operators/signin.json',
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

        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : this.restURL + '/operators/signout.json',
            handleAs: "json",
            postData : dojo.toJson(data),
            preventCache : true
        }), "signout", silenceMode || false)
    },

    getOperator : function (silenceMode) {

        return this.serviceTool($.xhrGet({
            headers: {"Content-Type": "application/json"},
            url : this.restURL + '/operators/get.json',
            handleAs: "json",
            preventCache : true
        }), "getOperator", silenceMode || false)
    },

    saveOperator : function (userData, silenceMode) {

        var data = {
            saveOperatorRequest : {
                userInfo : userData
            }
        }

        var self = this;
        return this.serviceTool($.xhrPost({
            headers: {"Content-Type": "application/json"},
            url : restService + '/operators/save.json',
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
            dojo.io.iframe.setSrc(iframe, restReportService + "rest/getCurrentReport" + ((reportName) ? '?reportName=' + encodeURIComponent(reportName) : "") + '&operatorCode=' + encodeURIComponent(agentCode), true)
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

