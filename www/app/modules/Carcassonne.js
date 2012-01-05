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
    dojo.require("ru.seriouscow.carcassonne.engine.Field");
    dojo.require("dojo.DeferredList");

    $.declare("Carcassonne", [ru.vtsft.tes.engine.module.ITemplatedModule], {

        _init : function () {
        },

        _run : function () {
            var self = this;

            this.template.mainLayout.resize();


            var cards = this.sandbox.getResource("cards");

            for (var i = 0, promises = []; i < cards.length; i++) {
                promises.push(this._getImage(cards[i]));
            }

           (new dojo.DeferredList(promises)).addCallback(function (e) {

               self.template.field.cards = cards;
               self.template.field.init();
               self.template.field.newGame();
            });
        },

        _refresh : function () {
            this.template.mainLayout.resize();
        },

        _stop : function () {
        },

        _destroy : function () {
        },

        _getImage : function (item) {
            var self = this;
            var dfd = new dojo.Deferred();
            var img = new Image();

            img.src = item.image;

            img.onload = function (e) {
                item.image = img

                dfd.callback({event : e, item : item});
            }

            img.onerror = function (e) {
                dfd.errback({event : e, item : item});
            }

            return dfd;
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