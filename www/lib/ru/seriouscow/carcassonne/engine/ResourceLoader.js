/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 19:09
 * To change this template use File | Settings | File Templates.
 */


dojo.provide('ru.seriouscow.carcassonne.engine.ResourceLoader');

dojo.require('dojo.DeferredList');

dojo.declare('ru.seriouscow.carcassonne.engine.ResourceLoader', null, {
    getNewImageLoader : function () {
        var self = this;

        return new (function () {
            var promises = [];

            this.push = function (images){

                if (!(images instanceof Array)){
                    images = [images];
                }

                promises = promises.concat(images);

                return this;
            }

            this.load = function () {
                var p = [];

                for (var i = 0; i < promises.length; i++) {
                    p.push(self._getImage(promises[i]))
                }

                return new dojo.DeferredList(p);
            }

            return this;
        })()
    },
    _getImage : function (item) {
        var self = this;
        var dfd = new dojo.Deferred();
        var img = new Image();

        img.src = item.src;

        img.onload = function (e) {
            item.image = img
            dfd.callback({event : e, item : item});
        }

        img.onerror = function (e) {
            dfd.errback({event : e, item : item});
        }

        return dfd;
    }
});