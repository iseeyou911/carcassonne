$.provide("ru.vtsft.tes.services.ExtendJsonRestStore");


$.require("dojox.data.JsonRestStore");

function index(_7, _8, _9, id) {
    _7.addCallback(function(_a) {
        if (_7.ioArgs.xhr && _9) {
            _9 = _7.ioArgs.xhr.getResponseHeader("Content-Range");
            _7.fullLength = _9 && (_9 = _9.match(/\/(.*)/)) && parseInt(_9[1]);
        }
        return _a;
    });
    return _7;
}
;

drr = dojox.rpc.Rest = function(_b, _c, _d, _e) {
    var _f;
    _f = function(id, _10) {
        return drr._get(_f, id, _10);
    };
    _f.isJson = _c;
    _f._schema = _d;
    _f.cache = {
        serialize:_c ? ((dojox.json && dojox.json.ref) || dojo).toJson : function(_11) {
            return _11;
        }
    };
    _f._getRequest = _e ||
        function(id, _12) {

            if (dojo.isObject(id)) {
                id = id ? dojo.toJson(id) : null;
            } else {
                id = id.replace("?query=", "")
            }
            var sort = "";
            if (_12 && _12.sort && !_12.queryStr) {
                sort = "?sort=(";
                for (var i = 0; i < _12.sort.length; i++) {
                    var _13 = _12.sort[i];
                    sort += (i > 0 ? "," : "") + encodeURIComponent((_13.descending ? "-" : "+") + _13.attribute);
                }
                sort += ")";
            }
            var _14 = {
                url:_b + (sort == null ? "" : sort) + "&preventCache=" + (new Date()).getTime(),
                handleAs:_c ? "json" : "text",
                contentType:_c ? "application/json" : "text/plain",
                sync:dojox.rpc._sync,
                postData : id,
                headers: {
                    Accept:_c ? "application/json,application/javascript" : "*/*"
                }
            };
            if (_12 && (_12.start >= 0 || _12.count >= 0)) {
                _14.headers.Range = "items=" + (_12.start || "0") + "-" + (("count" in _12 && _12.count != Infinity) ? (_12.count + (_12.start || 0) - 1) : "");
            }
            dojox.rpc._sync = false;
            return _14;
        };

    function _15(_16) {
        _f[_16] = function(id, _17) {
            return drr._change(_16, _f, id, _17);
        };
    }

    ;

    _15("put");
    _15("post");
    _15("delete");
    _f.servicePath = _b;
    return _f;
};
drr._index = {};
drr._timeStamps = {};
drr._change = function(_18, _19, id, _1a) {
    var _1b = _19._getRequest(id);
    _1b[_18 + "Data"] = _1a;
    return index(dojo.xhr(_18.toUpperCase(), _1b, true), _19);
};
drr._get = function(_1c, id, _1d) {
    _1d = _1d || {};
    return index(dojo.xhrPost(_1c._getRequest(id, _1d)), _1c, (_1d.start >= 0 || _1d.count >= 0), id);
};

$.declare("ru.vtsft.tes.services.ExtendJsonRestStore", [dojox.data.JsonRestStore], {

    constructor : function(args) {
        $.safeMixin(this, args || {});
    },

    processResults : function () {
    },

    transformator : function (e) {
        return e
    },

    _processResults : function (items, arg2) {
        this.processResults(items, arg2);
        items = this.transformator(items);

        var itemsCount = items.length;
        return {
            totalCount:arg2.fullLength || (arg2.request.count == itemsCount ? (arg2.request.start || 0) + itemsCount * 2 : itemsCount),
            items:items
        };
    }
})