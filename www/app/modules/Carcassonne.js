/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 21.12.11
 * Time: 20:22
 * To change this template use File | Settings | File Templates.
 */

(function (global) {
    dojo.provide("Carcassonne");
    dojo.require("ru.vtsft.tes.engine.module.ITemplatedModule");
   // dojo.require("ru.seriouscow.carcassonne.engine.Field");
    dojo.require("dojo.DeferredList");
    dojo.require("ru.seriouscow.carcassonne.tools.MarkupTool");

    $.declare("Carcassonne", [ru.vtsft.tes.engine.module.ITemplatedModule], {

        _init : function () {
        },

        _run : function () {
            var self = this;

            this.template.mainLayout.resize();

            var cards = this.sandbox.getResource("cards");

           //self.template.field.init(cards);
        },

        _refresh : function () {
            this.template.mainLayout.resize();
        },

        _stop : function () {
        },

        _destroy : function () {
        }
    })

    if (!global) {
        return new Carcassonne();
    }
    if (!global.exports) {
        global.exports = {};
    }
    global.exports.Carcassonne = Carcassonne;
    
}(window))

////@ sourceURL=/app/modules/Carcassonne.js