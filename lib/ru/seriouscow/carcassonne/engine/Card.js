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


    sidePoints : [
        [10, 3, 11],
        [6, 2, 7],
        [8, 1, 9],
        [4, 0, 5]
    ],
    /**
     * count of rotation to 90 degree
     */
    shift : 0,

    constructor : function (args) {
        this.type = [null, null, null, null, null];
        this.sidePoints = [
                                [10, 3, 11],
                                [6, 2, 7],
                                [8, 1, 9],
                                [4, 0, 5]
                           ];
        this.shift = 0;
        this.oldShift = 0;

        dojo.safeMixin(this, args || {});
        connectorPattern = [{"x":0,"y":0.5,"type":0,"role":"connector"},{"x":0.5,"y":1,"type":1,"role":"connector"},{"x":1,"y":0.5,"type":2,"role":"connector"},{"x":0.5,"y":0,"type":0,"role":"connector"},{"x":0,"y":0.25,"type":1,"role":"connector"},{"x":0,"y":0.75,"type":1,"role":"connector"},{"x":1,"y":0.25,"type":2,"role":"connector"},{"x":1,"y":0.75,"type":2,"role":"connector"},{"x":0.25,"y":1,"type":1,"role":"connector"},{"x":0.75,"y":1,"type":1,"role":"connector"},{"x":0.25,"y":0,"type":1,"role":"connector"},{"x":0.75,"y":0,"type":1,"role":"connector"}];
        for (var i = 0; i < this.connectorsType.length; i++) {
            connectorPattern[i].type = this.connectorsType[i];
        }

        this.vertex = connectorPattern.concat(this.vertex);
        delete this.connectorsType;
    },

    rotate : function (node) {
        var self = this;
        var i = this.shift;
        this.oldShift = this.shift || 0;

        //Check if card have all same sides
        if (dojo.every([1, 2, 3], function (item) {
            return self.sidesComparator(self, 0, self, item);
        })) {
            return false;
        }

        for (var j = 0; j < 3; j++) {
            this.shift = this.shift != 3 || this.shift != -3 ? this.shift + 1 : 0;
            this.sidePoints = [this.sidePoints.pop()].concat(this.sidePoints);

            var a = this.sidePoints[0][0];
            this.sidePoints[0][0] = this.sidePoints[0][2];
            this.sidePoints[0][2] = a;

            a = this.sidePoints[2][0];
            this.sidePoints[2][0] = this.sidePoints[2][2];
            this.sidePoints[2][2] = a;

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

        //Check if card have all same sides
        if (dojo.every([1, 2, 3], function (item) {
            return self.sidesComparator(self, 0, self, item);
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

    /**
     * Checking if place available for this card
     * @param node - place for card
     * @param startWith - side
     */
    isPlaceAvailableForCard : function (node, startWith) {
        var i, flag = false, j, jj,
            childrenSideType = [],
            reverse = [2, 3, 0, 1],
            childrenCount = 0;

        //Getting neighborhood nods
        for (i = 0; i < node.childrenNodes.length; i++) {
            if (node.childrenNodes[i] && node.childrenNodes[i].card) {
                childrenCount++;
                childrenSideType.push([node.childrenNodes[i].card, reverse[i]]);
            } else {
                childrenSideType.push(-1);
            }
        }

        i = 0;
        j = startWith || 0;
        jj = 0;
        while (true) {
            if (childrenSideType[j] == -1 || this.sidesComparator(this, i,childrenSideType[j][0], childrenSideType[j][1])) {
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
    },
    sidesComparator : function (a, sideA, b, sideB) {
        var av = a.vertex;
        var bv = b.vertex;
        var pointsA = a.sidePoints[sideA];
        var pointsB = b.sidePoints[sideB];

        return  av[pointsA[0]].type == bv[pointsB[0]].type &&
                av[pointsA[1]].type == bv[pointsB[1]].type &&
                av[pointsA[2]].type == bv[pointsB[2]].type;
    }
})