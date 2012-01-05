/**
 * Dojo have big bad menu we do it small and beautiful
 */

if (!dojo._hasResource["ru.vtsft.tes.ui.ItemList"]) {
// Register this class autoloading
    dojo.provide("ru.vtsft.tes.ui.ItemList");

// Include dependencies
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");

// Create class declaration extending templating system
    dojo.declare('ru.vtsft.tes.ui.ItemList', [dijit._Widget, dijit._Templated], {
        templateString : dojo.cache("dijit", "templates/ItemList.html", '<ul class="itemlist" data-dojo-attach-point="listConteiner, focusNode"></ul>'),

        constructor : function (args) {

            this.inherited(arguments);
            dojo.safeMixin(this, args || {});
        },

        focus : function () {
            dijit.focus(this.focusNode);
        },

        startup : function() {
            if (this._started) {
                return;
            }

            this.inherited(arguments);
        },

        /**
         * Adding Setting item to setting's category
         * @param item
         * @param parrent
         */
        addSettingsItem : function (item) {
            var li = $.create("li", {
                "class" : "itemlist-item"
            });

            var content = $.create("div", {
                "class" : "itemlist-item-content",
                align : "left"
            }, li, "last");

            if (item.content) {
                if (!(item.content instanceof Array)) {
                    item.content = [item.content]
                }
                $.forEach(item.content, function (item1) {
                    if (typeof item1 === "object") {
                        $.place(item1, content);
                    } else if (typeof item1 === "string") {
                        content.innerHTML += item1;
                    }
                })

            } else {
                var tmp = content;
                content = $.create("ul", {
                    "class" : "itemlist-subitems-list"
                })
                $.place(content, tmp);
            }

            $.create("div", {
                style: {"clear": "both"}
            }, li, "last");

            $.place(li, this.listConteiner, "last");

            return content;
        },

        /**
         * Adding Setting item to setting's category
         * @param item
         * @param parrent
         */
        addNamedItem : function (item) {
            var li = $.create("li", {
                "class" : "itemlist-item"
            });

            $.create("h3", {
                "class" : "itemlist-item-name",
                innerHTML : item.name
            }, li, "last");

            var content = $.create("div", {
                "class" : "itemlist-item-content",
                align : "left"
            }, li, "last");

            if (item.content) {
                if (!(item.content instanceof Array)) {
                    item.content = [item.content]
                }
                $.forEach(item.content, function (item1) {
                    if (typeof item1 === "object") {
                        $.place(item1, content);
                    } else if (typeof item1 === "string") {
                        content.innerHTML += item1;
                    }
                })

            } else {
                var tmp = content;
                content = $.create("ul", {
                    "class" : "itemlist-subitems-list"
                })
                $.place(content, tmp);
            }

            $.create("div", {
                style: {"clear": "both"}
            }, li, "last");

            $.place(li, this.listConteiner, "last");

            return content;
        },

        addName : function (name) {
            var h2 = $.create("h2", {
                "class" : "itemlist-name",
                innerHTML : name
            }, this.listConteiner, "last");
        },

        addSubItem : function (content, parent) {

            var li = $.create("li", {
                "class" : "itemlist-subitem"
            }, parent, "last");


            if (!(content  instanceof Array)) {
                content = [content]
            }
            $.forEach(content, function (item1) {
                if (typeof item1 === "object") {
                    $.place(item1, li);
                } else if (typeof item1 === "string") {
                    li.innerHTML += item1;
                }
            })

        }
    })

}