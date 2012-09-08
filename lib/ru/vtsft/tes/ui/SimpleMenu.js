/**
 * Dojo have big bad menu we do it small and beautiful
 */

if (!dojo._hasResource["ru.vtsft.tes.ui.SimpleMenu"]) {
// Register this class autoloading
    dojo.provide("ru.vtsft.tes.ui.SimpleMenu");
    dojo.provide("ru.vtsft.tes.ui.SimpleMenuItem");
// Include dependencies
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");

// Create class declaration extending templating system
    dojo.declare('ru.vtsft.tes.ui.SimpleMenu', [dijit._Widget, dijit._Templated], {
        templateString : dojo.cache("dijit", "templates/SimpleMenu.html", '<ul role="menu" class="tes-menu" data-dojo-attach-point="menuConteiner, focusNode"></ul>'),

        constructor : function (args) {

            this.inherited(arguments);
            dojo.safeMixin(this, args || {});
        },

        addItem : function (item, order) {
            var self = this;

            item = item.domNode || item;

            if (!(item instanceof HTMLLIElement)) {
                item = dojo.create("li", {
                    "class" : "tes-menu-item",
                    innerHTML : item
                })
            }
            dojo.connect(item, "onclick", function (e){
                dijit.popup.close(self);
                self.onBlur();
            })
            dojo.place(item, this.menuConteiner, order || "last");
        },

        focus : function () {
            dijit.focus(this.focusNode);
        },

        startup : function() {
            if (this._started) {
                return;
            }
            dojo.forEach(this.getChildren() || [], function(children) {
                children.startup();
            });
            this.inherited(arguments);
        }
    })

    dojo.declare('ru.vtsft.tes.ui.SimpleMenuItem', [dijit._Widget, dijit._Templated], {
        templateString : dojo.cache("dijit", "templates/SimpleMenuItem.html", '<li class="tes-menu-item" data-dojo-attach-point="menuItem" data-dojo-attach-event="onclick:onClick"><span class="dijitReset dijitInline  tes-menu-item-icon" data-dojo-attach-point="menuIcon"></span><span class="dijitReset dijitInline tes-menu-item-label" data-dojo-attach-point="menuItemLabel"></span></li>'),

        constructor : function (args) {
            this.inherited(arguments);
            dojo.safeMixin(this, args || {});
        },

        postCreate : function () {
            this.inherited(arguments);
            this.menuItemLabel.innerHTML = this.label;
            dojo.addClass(this.menuIcon, this.icon || "");
        },

        onClick : function () {

        }
    })

}