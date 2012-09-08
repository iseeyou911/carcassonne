if(!dojo._hasResource["ru.vtsft.tes.ui.DialogBox"]){
dojo.provide("ru.vtsft.tes.ui.DialogBox");

dojo.requireLocalization("ru.vtsft.tes.ui", "DialogBox", null);
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
/**
 * Extended dialog box with buttons (OK and Cacncel by default)
 * To configure custom buttons you need to path following params to construnctor
 * {
 *      buttons : [
 *          {
 *              label : "Label",
 *              onClick : "on click function",
 *              type : "one of following value : primary || danger || success ||"
 *          },...
 *      ]
 * }
 */

dojo.declare("ru.vtsft.tes.ui.DialogBox", [dijit.Dialog], {
    templateString:dojo.cache("dijit", "templates/DialogBox.html", '<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabIndex=\"-1\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\n\t\t<div dojoAttachPoint=\"buttonsNode\" class=\"dijitDialogPaneButtons\" align="right"></div>\n</div>\n'),
    locale : dojo.i18n.getLocalization("ru.vtsft.tes.ui", "DialogBox", "ru"),

    constructor : function (args) {
        dojo.safeMixin(this, args);
        this.inherited(arguments);
        if (!this.buttons) {
            this.buttons = [
                {
                    label : this.locale.CANCEL,
                    onClick : dojo.hitch(this, this._onClickCancel)
                },
                {
                    label : this.locale.OK,
                    onClick : dojo.hitch(this, this._onClickOK),
                    type : "primary"
                }
            ]
        } else {
            for (var i = 0; i < this.buttons.length; i++) {
                if (typeof (this.buttons[i]) == "string") {
                    if (this.buttons[i] == "close") {
                        this.buttons[i] = {
                            label : this.locale.CLOSE,
                            onClick : dojo.hitch(this, this._onClickCancel),
                            type : "primary"
                        }

                    }
                }
            }
        }

    },

    startup : function (args) {
        this.inherited(arguments);
        this.setButtons();
    },

    setButtons : function () {
        for (var i = 0; i < this.buttons.length; i++) {

            var button = new dijit.form.Button(this.buttons[i]);
            dojo.addClass(button.domNode, this.buttons[i].type || "");
            dojo.place(button.domNode, this.buttonsNode);

        }
    },

    _onClickOK : function (event) {
        if (this.onClickOK) this.onClickOK();
        this.hide();
    },

    _onClickCancel : function (event) {
        if (this.onClickCancel) this.onClickCancel();
        this.hide();
    }

})
}