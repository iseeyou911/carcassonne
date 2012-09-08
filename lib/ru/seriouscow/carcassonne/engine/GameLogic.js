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

    pointsCache : {},
    fieldPaths : [],
    castlePaths : [],
    roadPaths : [],
    state : {},
    /**
     * calc path's caches
     * @param node
     */
    attachNode : function (node, card) {
        var i, j, k, l,
        reverse = [2, 3, 0, 1],
        mod = [], cardPaths = [], sidePoints = card.sidePoints;

        this.saveState();
        for (var i = 0; i < card.vertex.length; i++) {
            var pointNode = {
                node : node,
                vertex: card.vertex[i]
            }

            var type = card.vertex[i].type;

            var index = card.id + "_" + i;
            this.pointsCache[index] = pointNode;

        }

        for (i = 0; i < sidePoints.length; i++) {
            for (j = 0; j < sidePoints[i].length; j++) {
                var vertexNum = sidePoints[i][j],
                curIndex = card.id + "_" + vertexNum,
                path = null,
                pathIndex = null;

                for (var index = 0; index < cardPaths.length; index++) {
                    var item = cardPaths[index];
                    if (dojo.indexOf(item, curIndex) >= 0) {
                        path = item;
                        pathIndex = index;
                        break;
                    }
                }


                if (!path) {
                    path = dojo.map(this.getPath(card, vertexNum) || [], function (item){
                        return  card.id + "_" + item;
                    })
                }

                var cache = this._getPathCache(card.vertex[vertexNum].type), child = node.childrenNodes[i];

                if (child && child.card) {

                    var reversVertexNum = child.card.sidePoints[reverse[i]][j],
                    reversIndex = child.card.id + "_" + reversVertexNum;
                    path = path.concat([reversIndex, curIndex]);

                    for (l = 0; l < cache.length; l++) {
                        var item = cache[l];
                        if (dojo.indexOf(item, reversIndex) >= 0) {
                            path = item.concat(path);
                            delete cache[l];
                            break;
                        }
                    }
                    if (pathIndex == null) {
                        for (l = 0; l < cardPaths.length; l++) {
                            var item = cardPaths[l];
                            if (dojo.indexOf(item, reversIndex) >= 0) {
                                path = item.concat(path);
                                delete mod[l];
                                delete cardPaths[l];
                                break;
                            }
                        }
                    }
                }

                if (pathIndex != null) {
                    cardPaths[pathIndex] = path;
                    mod[pathIndex] = {
                        cache : cache,
                        type : card.vertex[vertexNum].type
                    }
                } else {
                    cardPaths.push(path);
                    mod.push({
                        cache : cache,
                        type : card.vertex[vertexNum].type
                    })
                }
            }
        }

        for (i = 0; i < mod.length; i++) {
            if (mod[i] == null) {
                continue;
            }
            mod[i].cache.push(cardPaths[i]);
            if (this.isPathClosed(cardPaths[i])){
                /*this.drawPath (cardPaths[i]);
                dojo.forEach(this.getNodesFromPath(cardPaths[i]), function (n){
                    n.canvasNode.stroke = "#00FF00";
                });
                */
            }

        }
    },

    saveState : function (){
        var key;

        this.state.roadPaths = this.roadPaths.length;
        this.state.castlePaths = this.castlePaths.length;
        this.state.fieldPaths = this.fieldPaths.length;
        this.state.pointsCache = {};

        for (key in this.pointsCache) {
            this.state.pointsCache[key] = true;
        }
    },

    rollback : function (){
        var key;

        this.roadPaths = this.roadPaths.slice(0, this.state.roadPaths);
        this.castlePaths = this.castlePaths.slice(0, this.state.castlePaths);
        this.fieldPaths = this.fieldPaths.slice(0, this.state.fieldPaths);

        for (key in this.pointsCache) {
	    if (!this.state.pointsCache[key]) {
		delete this.pointsCache[key];
	    }
            
        }
    },

    getNodesFromPath : function (path) {
        var nodes = [], connectors = {};

        for (var i = 0; i < path.length; i++) {

            var node1 = this.pointsCache[path[i]].node;

            if (dojo.indexOf(nodes, node1) == -1) {
                nodes.push(node1);
            }
        }

        return nodes;
    },

    findPath : function (card, vertex) {
        var index = card.id + "_" + vertex,
        cache = this._getPathCache(card.vertex[vertex].type),
        result;

        if (!cache) {
            return;
        }

        for (var i = 0; i < cache.length; i++) {
            var item = cache[i];
            if (dojo.indexOf(item, index) >= 0) {
                return item;
            }
        }

    },

    getAvailableTokens : function (card) {
        var self = this, result = [], i, j, k;

        //Searching paths for vertexes in the card

        for (i = 0; i < card.vertex.length; i++){
            var item = card.vertex[i];

            if (item.role != "connector") {
                var type = card.vertex[i].type;

                if (type == window.CARCASSONNE.TYPE_TOWN) {
                    result.push(i);
                    continue;
                }

                var path = this.findPath(card, i);

                //Checking if path already have token
                if (path) {
                    var isUsed = false;

                    for (j = 0; j < path.length; j++){
                        var vertex = path[j],
                        node = this.pointsCache[vertex].node,
                        tokens = node.tokens;

                        for (k = 0; k < (tokens || []).length; k++){
                            var token = tokens[k];

                            if (node.card.vertex[token].type != type) {
                                break;
                            }

                            if (dojo.indexOf(path, node.card.id + "_" + token) >= 0) {
                                isUsed = true;
                                break;
                            }
                        }
                        
                        if (isUsed) {
                            break;
                        }
                    }

                    if (!isUsed) {
                        result.push(i);
                    }
                }

            }
        };

        return result;
    },

    isPathClosed : function (path) {
        var nodes = [], connectors = {};

        for (var i = 0; i < path.length; i+=2) {
            var point1 = this.pointsCache[path[i]].vertex,
                point2 = this.pointsCache[path[i + 1]].vertex,
                node1 = this.pointsCache[path[i]].node,
                node2 = this.pointsCache[path[i + 1]].node,
                isPointConnectors = point1.role == "connector" && point2.role == "connector";
            if (point1.role == "connector") {
                connectors[path[i]] = connectors[path[i]] || isPointConnectors;
            }

            if (point2.role == "connector") {
                connectors[path[i + 1]] = connectors[path[i + 1]] || isPointConnectors;
            }
            if (dojo.indexOf(nodes, node1).length == 0) {
                nodes.push(node1);
            }
            if (dojo.indexOf(nodes, node2).length == 0) {
                nodes.push(node2);
            }
        }

        for (var key in connectors) {
            if (!connectors[key]) {
                return false;
            }
        }

        return nodes;
    },

    drawPath : function (path) {
        var i;
       /* if (this.lineCache) {
            for (i = 0; i < this.lineCache.length; i++) {
                this.lineCache[i].removeSelf();
                delete this.lineCache[i];
            }
        }
        this.lineCache = [];
*/
        for (i = 0; i < path.length - 1; i += 2) {
            var p1 = this.pointsCache[path[i]];
            var p2 = this.pointsCache[path[i + 1]];
            if (p1.node == p2.node) {
                var v1 = p1.vertex;
                var v2 = p2.vertex;

                var fXY = {
                    x : v1.x * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2,
                    y : v1.y * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2
                };
                var sXY = {
                    x : v2.x * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2,
                    y : v2.y * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2
                };
                var line = new Line(fXY.x, fXY.y, sXY.x, sXY.y, {zIndex : 3});
                //this.lineCache.push(line);
                p1.node.canvasNode.append(line);
            }

        }
    },

    getPath : function (card, startPoint, oldPoints) {
        var points = [ ], edges = card.edges;
        oldPoints = oldPoints || [];
        oldPoints.push(startPoint);

        for (var i = 0; i < edges.length; i++) {

            if (edges[i] == startPoint) {
                var nextPoint = i & 1 ? edges[i - 1] : edges[i + 1];
                if (dojo.indexOf(oldPoints, nextPoint) == -1) {
                    points.push(startPoint);
                    points.push(nextPoint);
                    oldPoints.push(nextPoint);
                    if (card.vertex[startPoint].type == card.vertex[nextPoint].type) {
                        points = points.concat(this.getPath(card, nextPoint, oldPoints));
                    }
                }
            }
        }
        return points;
    },

    _getPathCache : function (type) {
        if (type == window.CARCASSONNE.TYPE_ROAD) {
            return this.roadPaths;
        } else if (type == window.CARCASSONNE.TYPE_CASTLE) {
            return this.castlePaths;
        } else if (type == window.CARCASSONNE.TYPE_FIELD) {
            return this.fieldPaths;
        }
    }
})

