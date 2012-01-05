/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 21.12.11
 * Time: 21:26
 * To change this template use File | Settings | File Templates.
 */

dojo.provide('ru.seriouscow.carcassonne.engine.Field');

dojo.require('dijit._Widget');
dojo.require('dijit._TemplatedMixin');
dojo.require('dojox.collections.ArrayList');

var WIDTH = 120;
var TYPE_ROAD = 0;
var TYPE_FIELD = 1;
var TYPE_CASTLE = 2;
var TYPE_TOWN = 3;
var TYPE_CROSSROAD = 4;

dojo.declare('ru.seriouscow.carcassonne.engine.Field', [dijit._Widget, dijit._TemplatedMixin], {
    templateString : '<div style="width:100%; height: 100%; position: relative;" data-dojo-attach-point="field"></div>',
    node : null,
    _hashTable : [],
    _indexArray : [],
    _availablePlaces : [],

    _dX : 500,
    _dY : 500,

    _cX : null,
    _cY : null,

    cards : [],
    margin : 5,
    cardsOrder : [],

    _selectedNode : null,

    _currentShift : 0,

    _roadParts : [],
    _castleParts : [],
    constructor :function () {
        this.node = null;
        this._hashTable = [];
        this._indexArray = [];
        this._availablePlaces = [];

        this._dX = 500;
        this._dY = 500;

        this._cX = null;
        this._cY = null;

        this.cards = [];
        this.cardsOrder = [];

        this._selectedNode = null;

        this._currentShift = 0;

        this._roadParts = [];
        this._castleParts = [];
    },
    init : function () {
        var self = this;
        var box = dojo.marginBox(this.domNode);
        this.context2D = new Canvas(this.field, box.w, box.h);
        this.scene = new CanvasNode({
            centered : true
        });

        this._shadowImg = new Image();
        this._shadowImg.src = '/resources/images/shadow.png';

        this.table = new Rectangle(box.w * 6, box.h * 6, {
            x: 0,
            y: 0,
            zIndex: 0,
            centered : true
        })

        var img = new Image();
        img.src = '/resources/images/table_texture.jpg';
        img.onload = function () {
            self.table.fill = new Pattern(img, 'repeat')
        }

        this.scene.append(
            this.table
        )
        this.context2D.append(this.scene);

        this._emptyNodes = new dojox.collections.ArrayList();

        var tmp = new dojox.collections.ArrayList()
        var ii = 0;

        for (var i = 0; i < this.cards.length; i++) {
            this.cards[i] = new ru.seriouscow.carcassonne.engine.Card(this.cards[i]);
            tmp.add(ii);
            ii++;
        }

        for (var i = 0; i < this.cards.length; i++) {
            var index = tmp.item(Math.floor(Math.random() * tmp.count));
            tmp.remove(index);
            this.cardsOrder.push(index);
        }
    },

    newGame : function () {
        var self = this;
        var box = dojo.marginBox(this.domNode);
        var node = this._createNode(this.cards[this.cardsOrder.pop()]);
        this._drawNode(this.node);

        this._createNeighborhoodNodes(node);
        this._getNextCard();
        this._drawNextCard();
        this._drawAvailablePlaces();

        var nextCardButton = new Rectangle(WIDTH, WIDTH, {
            x: 0,
            y: WIDTH,
            fill : [200,100,100,0.5]
        })

        nextCardButton.when('click', function () {

            if (self._selectedNode) {
                var node = self._selectedNode;
                var tmp = [];
                self._clearAvailablePlaces();
                self._placeCardToNode(node, self.nextCard);
                tmp = self._checkCastle(node);


                self._drawNode(node);
                self._createNeighborhoodNodes(node);
                self._getNextCard();
                self._drawNextCard();
                self._drawAvailablePlaces();

                for (var i = 0; i < tmp.length; i++) {
                    for (var j = 0; j < tmp[i].length; j++) {
                        tmp[i][j].canvasNode.stroke = true;
                        tmp[i][j].canvasNode.strokeWidth = 2;
                        tmp[i][j].canvasNode.shadowColor = '#00ff00';
                    }
                }

                self._selectedNode = null;
            }
        });
        this.context2D.append(nextCardButton);

        this.scene.when('mousewheel', function (e) {
            var newScale = self.scene.scale + e.wheelDelta / Math.abs(e.wheelDelta) / 5;
            if (newScale >= 0.5 && newScale <= 1.3) {
                self.scene.animateTo('scale', newScale, 200);
                var dX = ( box.w - box.w * newScale) / 2 //+ self.scene.x + (box.w / 2 - e.clientX) * newScale
                var dY = (box.h - box.h * newScale) / 2 // + self.scene.y + (box.h / 2 - e.clientY) * newScale

                self.scene.animateTo('x', dX, 200);
                self.scene.animateTo('y', dY, 200);
            }
        })

        this.scene.when('mousedown', function (e) {
            e.stopImmediatePropagation();

            self._handlerMouseDownTimeOut = setTimeout(function() {

                self._isMouseDown = true;

            }, 150)
        })

        this.scene.when('mouseup', function (e) {
            self._cX = null;
            self._cY = null;
            clearTimeout(self._handlerMouseDownTimeOut);
            if (self._isMouseDown) {
                e.stopImmediatePropagation();

                setTimeout(function() {
                    self._isMouseDown = false;
                }, 3);
            }
        })

        this.scene.when('mousemove', function (e) {
            if (self._isMouseDown) {
                e.stopPropagation();
                if (self._cX && self._cY) {
                    self.scene.x += e.clientX - self._cX || 0;
                    self.scene.y += e.clientY - self._cY || 0;
                }

            }
            self._cX = e.clientX;
            self._cY = e.clientY;
        })

    },

    _checkRoad : function(node) {
        var result = [];
        for (var i = 0; i < 4; i++) {
            var subResult = [];
            if (this._checkRoadPopulate(node, subResult, null, i)) {
                result.push(subResult);
            }
        }

        return result;
    },

    _checkCastle : function(node) {
        var result = [];
        for (var i = 0; i < 4; i++) {
            var subResult = [];
            if (this._checkCastlePopulate(node, subResult, i)) {
                this._castleParts.push({nodeList : subResult});
                result.push(subResult);
            }
        }

        return result;
    },

    _checkCastlePopulate : function (node, nodeList, direction) {
        var reverse = [2, 3, 0, 1];

        if (!node.card ||
            node.card.type[direction] != TYPE_CASTLE) {
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

                if (nextNode.card.type[i] == TYPE_CASTLE && nextNode.card.center == TYPE_CASTLE && (!child || !child.card)) {
                    isFound = false;
                }

                if (!nextNode.card ||
                    nextNode.card.type[i] != TYPE_CASTLE) {
                    i = i != 3 ? i + 1 : 0;
                    continue;
                }

                var skip = false

                for (var j = 0; j < this._castleParts.length; j++) {
                    if ($.indexOf(this._castleParts[j].nodeList, node) != -1 &&
                        $.indexOf(this._castleParts[j].nodeList, child) != -1) {
                        skip = true;
                    }
                }

                if (skip){
                    i = i != 3 ? i + 1 : 0;
                    continue;
                }

                if (child && child.card && $.indexOf(nodeList, child) == -1 &&
                    nextNode.card.type[i] == TYPE_CASTLE && child.card.type[reverse[i]] == TYPE_CASTLE &&
                    ((node != nextNode && nextNode.card.center == TYPE_CASTLE) || (node == nextNode && nodeList.length == 1)|| (node == nextNode && nodeList.length != 1 && nextNode.card.center == TYPE_CASTLE))) {
                    nodeList.push(child);
                    Q.push(child);
                }

                i = i != 3 ? i + 1 : 0;
            }
        }

        return isFound && nodeList.length > 1;
        /*
         var reverse = [2, 3, 0, 1];

         nodeList = nodeList || [];
         nodeList.push(node);

         var i = direction || 0;

         for (var k = 0; k < 4; k++) {

         if (!node.card ||
         node.card.type[i] != TYPE_CASTLE) {
         i = i != 3 ? i + 1 : 0;
         continue;
         }

         var children = node.childrenNodes[i];

         if (!children) {
         return false;
         }

         var skip = false;

         for (var j = 0; j < this._castleParts.length; j++) {
         if ($.indexOf(this._castleParts[j].nodeList, node) != -1 &&
         $.indexOf(this._castleParts[j].nodeList, children) != -1) {
         skip = true;
         break;
         }
         }

         if (skip) {
         continue;
         }

         if ($.indexOf(nodeList, node.childrenNodes[i]) == -1) {
         if (this._checkCastlePopulate(children, nodeList)) {

         We need to find next part of castle in this card only if castle sides connected

         if (node.center != TYPE_CASTLE) {
         return true;
         }
         }
         }
         i = i != 3 ? i + 1 : 0;
         }
         return false;
         */
    },

    _checkRoadPopulate : function (node, nodeList, endPoints, direction) {
        var reverse = [2, 3, 0, 1];
        nodeList = nodeList || [];
        endPoints = endPoints || {startNode : null, startDirection : null, finishNode : null, finishDirection : null}

        nodeList.push(node);

        var i = direction || 0;

        for (var k = 0; k < 4; k++) {

            var skip = false;
            for (var j = 0; j < this._roadParts.length; j++) {
                if ((this._roadParts[j].startNode == node && i == this._roadParts[j].startDirection) ||
                    (this._roadParts[j].finishNode == node && i == this._roadParts[j].finishDirection) ||
                    (this._roadParts[j].startNode != node && this._roadParts[j].finishNode != node && $.indexOf(this._roadParts[j].nodeList, node) != -1)) {
                    skip = true;
                    break;
                }
            }

            if (skip) {
                continue;
            }

            if (node.card && node.card.type[i] == TYPE_ROAD && node.card.center != TYPE_FIELD && node.card.center != TYPE_ROAD && (!endPoints.startNode || node == endPoints.startNode)) {
                endPoints.startNode = node;
                endPoints.startDirection = i;
                if (nodeList.length > 1) {
                    return false;
                }
            }

            if (node.card &&
                node.card.type[i] == TYPE_ROAD &&
                node.childrenNodes[i] &&
                node.childrenNodes[i].card &&
                node.childrenNodes[i].card.type[reverse[i]] == TYPE_ROAD) {

                /*
                 If finish and start founded at crossroads or same deadend
                 */
                if (endPoints.startNode && ((endPoints.startNode == node.childrenNodes[i] && endPoints.startDirection != reverse[i]) ||
                    (endPoints.startNode != node.childrenNodes[i] && node.childrenNodes[i].card.center != TYPE_FIELD && node.childrenNodes[i].card.center != TYPE_ROAD))) {
                    endPoints.finishNode = node.childrenNodes[i];
                    endPoints.finishDirection = reverse[i];
                    nodeList.push(node.childrenNodes[i]);
                    this._roadParts.push({startNode : endPoints.startNode, startDirection : endPoints.startDirection, finishNode : endPoints.finishNode, finishDirection : endPoints.finishDirection, nodeList : nodeList});

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
                    this._roadParts.push({startNode : endPoints.startNode, startDirection : endPoints.startDirection, finishNode : endPoints.finishNode, finishDirection : endPoints.finishDirection, nodeList : nodeList});
                    return true;
                }

                if ($.indexOf(nodeList, node.childrenNodes[i]) == -1) {

                    if (this._checkRoadPopulate(node.childrenNodes[i], nodeList, endPoints)) {
                        return true;
                    }
                }
            }
            i = i != 3 ? i + 1 : 0;
        }

        return false;
    },

    _swichCardTo : function (card, nodeTo, x, y, scale) {
        var self = this;
        var box = dojo.marginBox(this.domNode);


        var animated = new ImageNode(card.image, {x: x, y: y, rotation : 89.9999 * Math.PI / 180 * card.oldShift, dWidth: WIDTH, dHeight : WIDTH, zIndex : 10000, centered : true, shadowBlur : 6, shadowColor : '#000000', stroke : true, strokeWidth : 2, scale: scale});

        this.context2D.append(animated);
        animated.animateTo('rotation', 89.9999 * Math.PI / 180 * card.shift, 300);
        animated.animateTo('scale', self.scene.scale + 0.1, 250);

        animated.after(250, function() {
            animated.animateTo('scale', self.scene.scale, 250);
        })

        animated.animateTo('x', (nodeTo.l + WIDTH / 2) * this.scene.scale + this.scene.x, 500);
        animated.animateTo('y', (nodeTo.t + WIDTH / 2) * this.scene.scale + this.scene.y, 500);

        animated.after(499, function () {
            self.context2D.remove(animated);
            self._drawTempCard(nodeTo, card);
        });


    },

    _drawAvailablePlaces : function () {
        for (var i = 0; i < this._availablePlaces.length; i++) {
            this._drawNode(this._emptyNodes.item(this._availablePlaces[i]));
        }
    },

    _clearAvailablePlaces : function () {
        var self = this;
        for (var i = 0; i < this._availablePlaces.length; i++) {

            var canvasNode = self._emptyNodes.item(self._availablePlaces[i]).canvasNode;
            canvasNode.removeEventListener('click', canvasNode.eventListeners.click.bubble[0]);
            canvasNode.animateTo('opacity', 0, 400);
            canvasNode.after(401, function () {
                self.scene.remove(canvasNode);
            })
        }
    },

    _drawNode : function (node) {
        var self = this;

        if (node.canvasNode) {
            self.scene.remove(node.canvasNode);
        }

        if (node.card) {
            node.canvasNode = new ImageNode(node.card.image, {rotation : 89.9999 * Math.PI / 180 * node.card.shift || 0, x: node.l + WIDTH / 2, y: node.t + WIDTH / 2, dWidth: WIDTH, dHeight : WIDTH, centered : true, zIndex: 1, shadowBlur : 10, shadowColor : '#000000'});
        } else {

            node.canvasNode = new ImageNode(this._shadowImg, {x: node.l + WIDTH / 2, y: node.t + WIDTH / 2, dWidth: WIDTH, dHeight : WIDTH, centered : true, zIndex: 1, cursor : 'pointer'});
            var a = node.canvasNode.when('click', function () {
                if (!self._isMouseDown) {
                    if (self._selectedNode && !self._selectedNode.card) {
                        self._drawNode(self._selectedNode);
                    }

                    var x = self._selectedNode ? (self._selectedNode.l + WIDTH / 2) * self.scene.scale + self.scene.x : WIDTH / 2;
                    var y = self._selectedNode ? (self._selectedNode.t + WIDTH / 2) * self.scene.scale + self.scene.y : WIDTH / 2;
                    var scale = self._selectedNode ? self.scene.scale : 1;

                    if (!self.nextCard.isPlaceAvailableForCard(node, 0)) {
                        self.nextCard.rotate(node);
                    } else {
                        self.nextCard.oldShift = self.nextCard.shift;
                    }

                    self._swichCardTo(self.nextCard, node, x, y, scale);
                    self._selectedNode = node;
                }
            });
        }

        this.scene.append(node.canvasNode);
    },

    /**
     * Creating one node;
     * @param parentNode - parent node if exist
     * @param direction - direction of new node relation to parent node
     * @param card - card for node if exist
     */
    _createNode : function (parentNode, direction, card) {
        var widthWithMargin = WIDTH + this.margin * 2;
        var dT = [widthWithMargin, 0, -widthWithMargin, 0];
        var dL = [0, -widthWithMargin, 0, widthWithMargin];
        var dX = [1, 0, -1, 0];
        var dY = [0, -1, 0, 1];

        var reverse = [2, 3, 0, 1];

        var node;
        if (arguments.length >= 2) {
            node = parentNode.childrenNodes[direction] = new ru.seriouscow.carcassonne.engine.Node({
                l : parentNode.l - dL[direction],
                t : parentNode.t - dT[direction],
                x : parentNode.x - dX[direction],
                y : parentNode.y - dY[direction]
            });

            for (var j = 0; j < 4; j++) {
                var neighborhood = this._getFromHashTable(node.x - dX[j], node.y - dY[j]);
                if (neighborhood) {
                    neighborhood.childrenNodes[reverse[j]] = node;
                    node.childrenNodes[j] = neighborhood;
                }
            }
        } else {
            var box = dojo.marginBox(this.domNode);

            node = this.node = new ru.seriouscow.carcassonne.engine.Node({
                l : (box.w - WIDTH) / 2,
                t : (box.h - WIDTH) / 2,
                card : 1
            });
        }

        node.card = card || (arguments.length == 1 ? parentNode : null);

        if (!node.card) {
            this._emptyNodes.add(node);
        }

        this._putToHashTable(node);
        return node;
    },

    /**
     * Placing card to empty node
     * @param node
     * @param card
     */
    _placeCardToNode : function (node, card) {
        this._emptyNodes.remove(node);
        node.card = card;
    },

    _drawTempCard : function (node, card) {
        var self = this;
        var canRotate = true;
        this.scene.remove(node.canvasNode);

        node.canvasNode = new ImageNode(card.image, {rotation : 89.9999 * Math.PI / 180 * card.shift, x: node.l + WIDTH / 2, y: node.t + WIDTH / 2, dWidth: WIDTH, dHeight : WIDTH, centered : true, zIndex: 2, shadowBlur : 6, shadowColor : '#000000', stroke : true, strokeWidth : 2});
        this.scene.append(node.canvasNode);

        node.canvasNode.when('click', function () {
            if (!self._isMouseDown) {
                if (canRotate && card.rotate(node)) {
                    node.canvasNode.animateTo('rotation', 89.9999 * Math.PI / 180 * card.shift, 500)
                } else {
                    canRotate = false;
                }
            }
        });
    },
    _getNextCard : function () {
        this._availablePlaces = [];

        this.nextCard = null;
        for (var i = 0; i < this._emptyNodes.count; i++) {
            if (this.cardsOrder.length == 0) {
                return false;
            }
            if (!this.nextCard) {
                this.nextCard = this.cards[this.cardsOrder.pop()];
            }

            if (this.nextCard.isPlaceAvailableForCard(this._emptyNodes.item(i))) {
                this._availablePlaces.push(i);
            }
        }

        if (this._availablePlaces.length == 0) {
            this._getNextCard();
        }
        return true;
    },

    _drawNextCard : function () {
        if (this._nextCardNode) {
            this.context2D.remove(this._nextCardNode);
        }

        this._nextCardNode = new ImageNode(this.nextCard.image, {x: 0, y: 0, dWidth: WIDTH, dHeight : WIDTH, zIndex : 10000});

        this.context2D.append(this._nextCardNode);
    },

    /**
     * Creating nodes Neighborhoods
     * @param parent
     */
    _createNeighborhoodNodes : function (parent) {
        var nodes = [];

        for (var i = 0; i < parent.childrenNodes.length; i++) {
            if (!parent.childrenNodes[i]) {
                nodes.push(this._createNode(parent, i));
            }
        }

        return nodes;
    },

    _putToHashTable : function (node) {
        var index = 1000 * (node.x + this._dX) + node.y + this._dY;
        this._hashTable[index] = node;
        this._indexArray.push(index);
    },

    _getFromHashTable : function (x, y) {
        return this._hashTable[1000 * (x + this._dX) + y + this._dY];
    }

})

dojo.declare('ru.seriouscow.carcassonne.engine.Card', null, {


    /**
     * top, right, bottom, left, center
     */
    type : [null, null, null, null, null],
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

        this.w = WIDTH;
        this.h = WIDTH;

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

