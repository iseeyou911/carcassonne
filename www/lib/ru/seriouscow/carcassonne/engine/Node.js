/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 */
dojo.provide('ru.seriouscow.carcassonne.engine.Node');

dojo.declare('ru.seriouscow.carcassonne.engine.Node', null, {

    constructor : function (args) {

        /**
         * top, right, bottom, left
         */
        this.childrenNodes = [null, null, null, null];
        this.card = null;
        //
        this.l = 0;
        this.t = 0;

        this.w = CARCASSONNE.WIDTH;
        this.h = CARCASSONNE.WIDTH;

        this.x = 0;
        this.y = 0;

        dojo.safeMixin(this, args || {});
    },

    getTop : function () {
        return this.childrenNodes[0];
    },

    getRight : function () {
        return this.childrenNodes[1];
    },

    getBottom : function () {
        return this.childrenNodes[2];
    },

    getLeft : function () {
        return this.childrenNodes[3];
    }
})

