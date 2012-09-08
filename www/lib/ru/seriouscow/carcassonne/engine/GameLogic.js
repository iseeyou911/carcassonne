/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 21.12.11
 * Time: 21:26
 * To change this template use File | Settings | File Templates.
 *
 * Some game complicated logic: finding closed structures (roads, castles, fields, and etc)
 */

dojo.provide('ru.seriouscow.carcassonne.engine.GameLogic');

dojo.require('dijit._Widget');
dojo.require('dijit._TemplatedMixin');
dojo.require('dojox.collections.ArrayList');


dojo.declare('ru.seriouscow.carcassonne.engine.GameLogic', null, {

    /**
     * checking closed road;
     *
     * @param node
     */
    checkRoad : function(node, roadCache) {
        var result = [];
        for (var i = 0; i < 4; i++) {
            var subResult = {};
            if (this._checkRoadPopulate(node, null, null, i, roadCache, subResult)) {
                roadCache.push(subResult);
                result.push(subResult);
            }
        }

        return result;
    },

    /**
     * checking closed castle
     * @param node
     */
    checkCastle : function(node, castleCache) {
        var result = [];
        for (var i = 0; i < 4; i++) {
            var subResult = [];
            if (this._checkCastlePopulate(node, subResult, i, castleCache)) {
                castleCache.push({nodeList : subResult});
                result.push(subResult);
            }
        }

        return result;
    },

    _checkCastlePopulate : function (node, nodeList, direction, castleCache) {
        var reverse = [2, 3, 0, 1];

        if (!node.card ||
            node.card.type[direction] != CARCASSONNE.TYPE_CASTLE) {
            return false
        }

        var Q = [node];

        nodeList = nodeList || [];
        nodeList.push(node);

        var isFound = true;

        var pres

        while (Q.length != 0) {

            var nextNode = Q.pop();
            var i = direction || 0;

            for (var k = 0; k < 4; k++) {

                var child = nextNode.childrenNodes[i];

                if (nextNode.card.type[i] == CARCASSONNE.TYPE_CASTLE && nextNode.card.center == CARCASSONNE.TYPE_CASTLE && (!child || !child.card)) {
                    isFound = false;
                }

                if (!nextNode.card ||
                    nextNode.card.type[i] != CARCASSONNE.TYPE_CASTLE) {
                    i = i != 3 ? i + 1 : 0;
                    continue;
                }

                var skip = false

                for (var j = 0; j < castleCache.length; j++) {
                    if ($.indexOf(castleCache[j].nodeList, node) != -1 &&
                        $.indexOf(castleCache[j].nodeList, child) != -1) {
                        skip = true;
                    }
                }

                if (skip){
                    i = i != 3 ? i + 1 : 0;
                    continue;
                }

                if (child && child.card && $.indexOf(nodeList, child) == -1 &&
                    nextNode.card.type[i] == CARCASSONNE.TYPE_CASTLE && child.card.type[reverse[i]] == CARCASSONNE.TYPE_CASTLE &&
                    ((node != nextNode && nextNode.card.center == CARCASSONNE.TYPE_CASTLE) ||
                        (node == nextNode && nodeList.length == 1)||
                        (node == nextNode && nodeList.length != 1 && nextNode.card.center == CARCASSONNE.TYPE_CASTLE))) {
                    nodeList.push(child);
                    Q.push(child);
                }

                i = i != 3 ? i + 1 : 0;
            }
        }

        return isFound && nodeList.length > 1;
    },

    _checkRoadPopulate : function (node, nodeList, endPoints, direction, roadCache, subResult) {
        var reverse = [2, 3, 0, 1];
        nodeList = nodeList || [];
        endPoints = endPoints || {startNode : null, startDirection : null, finishNode : null, finishDirection : null}

        nodeList.push(node);

        var i = direction || 0;

        for (var k = 0; k < 4; k++) {

            var skip = false;
            for (var j = 0; j < this._roadParts.length; j++) {
                if ((roadCache[j].startNode == node && i == roadCache[j].startDirection) ||
                    (roadCache[j].finishNode == node && i == roadCache[j].finishDirection) ||
                    (roadCache[j].startNode != node && roadCache[j].finishNode != node && $.indexOf(roadCache[j].nodeList, node) != -1)) {
                    skip = true;
                    break;
                }
            }

            if (skip) {
                continue;
            }

            if (node.card && node.card.type[i] == CARCASSONNE.TYPE_ROAD && node.card.center != CARCASSONNE.TYPE_FIELD && node.card.center != CARCASSONNE.TYPE_ROAD && (!endPoints.startNode || node == endPoints.startNode)) {
                endPoints.startNode = node;
                endPoints.startDirection = i;
                if (nodeList.length > 1) {
                    return false;
                }
            }

            if (node.card &&
                node.card.type[i] == CARCASSONNE.TYPE_ROAD &&
                node.childrenNodes[i] &&
                node.childrenNodes[i].card &&
                node.childrenNodes[i].card.type[reverse[i]] == CARCASSONNE.TYPE_ROAD) {

                /*
                 If finish and start founded at crossroads or same deadend
                 */
                if (endPoints.startNode && ((endPoints.startNode == node.childrenNodes[i] && endPoints.startDirection != reverse[i]) ||
                    (endPoints.startNode != node.childrenNodes[i] && node.childrenNodes[i].card.center != CARCASSONNE.TYPE_FIELD && node.childrenNodes[i].card.center != CARCASSONNE.TYPE_ROAD))) {
                    endPoints.finishNode = node.childrenNodes[i];
                    endPoints.finishDirection = reverse[i];
                    nodeList.push(node.childrenNodes[i]);

                    dojo.safeMixin(subResult, {startNode : endPoints.startNode, startDirection : endPoints.startDirection, finishNode : endPoints.finishNode, finishDirection : endPoints.finishDirection, nodeList : nodeList});

                    return true

                }

                /*
                 if road is cycled
                 */
                if (!endPoints.startNode && nodeList.length > 1 && node.childrenNodes[i] == nodeList[0] && node != nodeList[1]) {
                    endPoints.startDirection = i;
                    endPoints.startNode = endPoints.finishNode = node.childrenNodes[i];
                    endPoints.finishDirection = reverse[i];
                    nodeList.push(node.childrenNodes[i]);

                    dojo.safeMixin(subResult, {startNode : endPoints.startNode, startDirection : endPoints.startDirection, finishNode : endPoints.finishNode, finishDirection : endPoints.finishDirection, nodeList : nodeList});

                    return true;
                }

                if ($.indexOf(nodeList, node.childrenNodes[i]) == -1) {

                    if (this._checkRoadPopulate(node.childrenNodes[i], nodeList, endPoints, roadCache, subResult)) {
                        return true;
                    }
                }
            }
            i = i != 3 ? i + 1 : 0;
        }

        return false;
    }
})

