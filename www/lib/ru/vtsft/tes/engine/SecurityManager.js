/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 28.09.11
 * Time: 16:21
 * To change this template use File | Settings | File Templates.
 */

$.provide("ru.vtsft.tes.engine.SecurityManager");
$.provide("ru.vtsft.tes.engine.security.User");

$.require("dojo.cookie");
$.declare ("ru.vtsft.tes.engine.SecurityManager", null, {
    user : null,
    disabled : false,
    session : {},

    getOperatorService : null,
    signinService : null,
    signoutService : null,
    saveOperatorService : null,

    constructor : function (args){
        $.safeMixin (this, args || {});
    },

    /**
     * checking cookie and if there is - server reauthorization
     */
    init : function (){
        var dfd = new $.Deferred ();

        var self = this;

        $.xhrPost = function (args) {
            if (self.user && self.user.ticket) {
                args.headers = args.headers || {};
                args.headers.ticket = args.headers.ticket || self.user.ticket
            }

            return $.xhr("POST", args, true);
        }

        $.xhrGet = function (args) {
            if (self.user && self.user.ticket) {
                args.headers = args.headers || {};
                args.headers.ticket = args.headers.ticket || self.user.ticket
            }
            
            return $.xhr("GET", args);
        }

        if (!this.disabled) {
            var isSigIn = $.cookie("user");

            try {
                isSigIn = $.fromJson(isSigIn);
            } catch (e) {
                isSigIn = {};
            }

            if (isSigIn && isSigIn.ticket) {
 
                this.user = {ticket : isSigIn.ticket};

                dfd = this.signIn(null,null, true).then(null, function(error){
                    /**
                     * if key is wrong we need to signout
                     */
                    self._signOut();
                    fire("BadSession", {data : self.user}, "SecurityManager");
                    console.warn("Bad old ticket you need to relogin")
                });
            } else {
                dfd.resolve();
            }
        } else {
            dfd.resolve();
        }

        return dfd;
    },

    /**
     *
     * @param user object
     *
     * OR
     *
     * @param login
     * @param password
     */
    signIn : function (login, password, key) {
        var self = this;
        var dfd = new $.Deferred ();

        var responseOk = function (response) {
            if (response.isOK) {
                dfd.resolve (response.data.userInfo);
            } else {
                dfd.reject({error: "bad login or password"});
            }
        }

        var responseFail = function (e){
            
            dfd.reject({error: "bad login or password"});
        }

        if (this.signinService){
            if (login && password) {
                this.signinService(login, password, true).then(responseOk, responseFail)
            } else if (key || (login && typeof login === "object")){
                this.getOperatorService(true).then(responseOk, responseFail);

            } else {
                dfd.reject({error: "No credential"});
            }
        } else {
            dfd.reject({error: "No signin service found"});
        }

        return dfd.then (function (result) {
            self.user = new ru.vtsft.tes.engine.security.User(result)
            $.cookie("user", $.toJson({ticket : self.user.ticket}), {expires: 30});
            self._createSession();
            fire("SignIn", {data : self.user}, "SecurityManager");

            return result;
        });
    },

    signOut : function (){
        var dfd = new $.Deferred ();

        if (this.signoutService) {
            this.signoutService(this.user.ticket, true);
        }

        this._signOut();

        dfd.resolve();
        fire("SignOut", {}, "SecurityManager");
        return dfd;
    },

    _signOut : function (){
        delete this.user;
        delete this.session;
        $.cookie("user", "", {expire: -1});
        $.cookie("session", "", {expire: -1});
    },

    hasPermission : function(permission) {
        if (this.disabled) {
            return true;
        }
        return $.some(this.user.permission, function (item){
            return item == permission;
        })
    },
    
    hasAccess : function (role){
        if (this.isAuth()){
            return this.user.role >= (ROLE[role] || 0);
        } else if (this.disabled) {
            return true;
        }

        return false;

    },
    getUserData : function () {
        return this.user;
    },

    getProperty : function (property, curObject){
        if (this.user) {
            var curProp = property.split(".");
            curObject = curObject || this.user.properties;

            if (curProp.length > 1 && curObject[curProp[0]]) {
                var element = curProp.shift();
                return this.getProperty(curProp.join("."), curObject[element])
            } else if (curProp.length == 1) {
                return curObject[curProp[0]];
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }


    },

    saveUserProperties : function (properties) {
        var dfd = new $.Deferred();

        if (this.user) {

            $.safeMixin(this.user.properties, properties || {});

            var user = {};
            user.ticket = this.user.ticket;
            user.name = this.user.name;
            user.properties = $.toJson(this.user.properties);

            //$.cookie("user", $.toJson(this.user), {expires: 5});
            if (this.saveOperatorService) {
                dfd = this.saveOperatorService(user, true);
            } else {
                dfd.resolve();
            }

        } else {
            dfd.reject("NO_USER_EXCEPTION");
        }

        return dfd;
    },

    protectObject : function (config) {
        
    },

    sessionCookie : function (paramName, param) {
        if (!this.session){
            this._createSession();
        }

        if (paramName && param) {
            this.session[paramName] = param;

            $.cookie("session", $.toJson(this.session), {expires: 5});
        } else if (paramName && param == undefined) {
            return this.session[paramName];
        } else if (paramName){
             this.session[paramName] = undefined;
            $.cookie("session", $.toJson(this.session), {expires: 5});
        }
        return undefined;
    },

    isAuth : function() {
        return this.disabled || !!this.user;
    },

    /**
     * 
     */
    _createSession : function (){
        try {
            this.session = $.cookie("session");
            if (this.session) {
                this.session = $.fromJson(this.session);
            }
        } catch(e){
            this.session = undefined;
            console.warn("Session corupted")
        } finally  {
            if (!this.session) {
                this.session = {startTime : (new Date()).toString()}
                $.cookie("session", $.toJson(this.session), {expires: 5});
            }
        }
    }
})

$.declare ("ru.vtsft.tes.engine.security.User", null, {
    name : null,
    ticket : null,
    permission : [],
    role : null,
    properties : {},
    code : null,
    
    constructor : function (args){
        $.safeMixin(this, args);

        this.role = ROLE[this.role];

        if (typeof this.properties === "string") {
            try {
                this.properties = eval('(function(){return ' + this.properties + '})()');
            } catch (e){
                this.properties = {};
            }

        }
    }

})
