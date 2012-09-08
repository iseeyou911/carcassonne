if(!dojo._hasResource["ru.vtsft.tes.ui.ButtonSet"]){
dojo.provide("ru.vtsft.tes.ui.ButtonSet")

dojo.declare("ru.vtsft.tes.ui.ButtonSet", [dijit._Widget, dijit._Templated], {
    templateString : dojo.cache("dijit", "templates/ButtonSet.html", '<span class="dijitReset dijitInline tesButtonSet" data-dojo-attach-point="buttonConteiner"></span>'),

    buttons : [],

    widgetsInTemplate : true,

    addClass : '',

    constructor : function (args, container){
        this.inherited(arguments);
        this.buttons = [];
    },
    postCreate : function (){
        var self = this;

        this.inherited(arguments);
        if (this.srcNodeRef) {
            dojo.addClass(this.domNode, this.srcNodeRef.className);
            this.domNode.style = this.srcNodeRef.style;

            dojo.forEach(this.srcNodeRef.childNodes, function (item) {
                if (item instanceof HTMLElement ){
                    self.buttons.push(item);
                    dojo.place(item, self.buttonConteiner);
                }
            })
        }

    },

    startup : function () {
        this.inherited(arguments);



        for (i in this.buttons) {
            if (i == 0) {
                dojo.addClass(this.buttons[i], "leftButton");
            } else if (i == this.buttons.length - 1) {
                dojo.addClass(this.buttons[i], "rightButton");
            } else {
                dojo.addClass(this.buttons[i], "centerButton");
            }
        }
    },

    destroy : function (){
        delete this.buttons;
    },
    /**
     *
     * @param button - Node!
     */
    addButton : function (button) {
        if (typeof button === "string"){
            button = $.create("span", {
                "class" : "tesButtonSetText dijitReset dijitInline ",
                innerHTML : button
            });
        }

        this.buttons.push(button);
        dojo.place(button, this.buttonConteiner);
    }
})
}