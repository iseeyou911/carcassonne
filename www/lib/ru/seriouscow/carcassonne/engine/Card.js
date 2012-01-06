/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 *
 * Representatoin of game card
 */

dojo.provide('ru.seriouscow.carcassonne.engine.Card');

dojo.declare('ru.seriouscow.carcassonne.engine.Card', null, {

    /**
     * top, right, bottom, left, center
     */
    type : [null, null, null, null, null],

    /**
     * count of rotation to 90
     */
    shift : 0,

    constructor : function (args) {
        this.type = [null, null, null, null, null];
        this.shift = 0;
        this.oldShift = 0;
        dojo.safeMixin(this, args || {})
    },

    rotate : function (node) {
        var self = this;
        var i = this.shift;
        this.oldShift = this.shift || 0;

        if (dojo.every(this.type, function (item, i) {
            return item == self.type[0];
        })) {
            return false;
        }

        for (var j = 0; j < 3; j++) {
            this.shift = this.shift != 3 || this.shift != -3 ? this.shift + 1 : 0;
            this.type = [this.type.pop()].concat(this.type);
            if (this.isPlaceAvailableForCard(node, 0)) {
                if (Math.abs(this.oldShift - this.shift) > 2) {
                    this.shift = this.oldShift - 1;
                }
                return true;
            }
        }

        this.type = [this.type.pop()].concat(this.type);
        this.shift = this.oldShift;
        return false;
    },

    canRotate : function(node){
        var self = this;
        
        if (dojo.every(this.type, function (item) {
            return item == self.type[0];
        })) {
            return false;
        }


        for (var j = 1; j < 4; j++) {
            if (this.isPlaceAvailableForCard(node, j) ) {
                return true
            }
        }
        return false;
    },

    isPlaceAvailableForCard : function (node, startWith) {
        var childrenSideType = [];
        var reverse = [2, 3, 0, 1];
        var childrenCount = 0;

        for (var i = 0; i < node.childrenNodes.length; i++) {
            if (node.childrenNodes[i] && node.childrenNodes[i].card) {
                childrenCount++;
                childrenSideType.push(node.childrenNodes[i].card.type[reverse[i]]);
            } else {
                childrenSideType.push(-1);
            }
        }

        var flag = false;
        var i = 0;
        var j = startWith || 0;
        var jj = 0;
        while (true) {
            if (this.type[i] == childrenSideType[j] || childrenSideType[j] == -1) {
                i++;
                flag = true;

                if (j == childrenSideType.length - 1) {
                    j = 0;
                } else {
                    j++;
                }

                if (i == 4) {
                    return true;
                }
            } else {
                if (startWith != null || jj == 3) {
                    return false;
                }
                jj++;
                i = 0;
                j = jj;

            }
        }

    }
})