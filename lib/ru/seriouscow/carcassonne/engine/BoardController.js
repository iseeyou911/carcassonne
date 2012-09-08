/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 */
dojo.provide('ru.seriouscow.carcassonne.engine.BoardController');

dojo.require('dojox.collections.ArrayList');
dojo.require('ru.seriouscow.carcassonne.engine.Card');
dojo.require('ru.seriouscow.carcassonne.engine.Node');

dojo.declare('ru.seriouscow.carcassonne.engine.BoardController', null, {

    cards : [],
    cardsOrder : [],
    nextCard : null,
    rootNode : null,

    _emptyNodes : null,
    _hashTable : [],
    _indexArray : [],
    _availablePlaces : [],
    _dX : 500,
    _dY : 500,

    boardBox : {t:0, l:0, b:0, r:0},

    constructor : function (args) {
        this.init();
        dojo.safeMixin(this, args || {});
    },

    init : function (){
        this._emptyNodes = new dojox.collections.ArrayList();
        this._hashTable = [];
        this._indexArray = [];
        this._availablePlaces = [];

        this.cards = [];
        this.cardsOrder = [];
        this.nextCard = null;
        this.rootNode = null;
    },

    createDeck : function (cards) {

        this.cards = [];
        this.cardsOrder = [];

        var tmp = new dojox.collections.ArrayList();
        var ii = 0;

        for (var i = 0; i < cards.length; i++) {
            this.cards[i] = new ru.seriouscow.carcassonne.engine.Card(cards[i]);
            tmp.add(ii);
            ii++;
        }

        for (var i = 0; i < cards.length; i++) {
            var index = tmp.item(Math.floor(Math.random() * tmp.count));
            tmp.remove(index);
            this.cardsOrder.push(index);
        }
    },

    /**
     * Creating one node;
     * @param parentNode - parent node if exist or {l : left, t : top}
     * @param direction - direction of new node relation to parent node
     * @param card - card for node if exist
     */
    createNode : function (parentNode, direction, card) {

        if (parentNode && parentNode.childrenNodes && parentNode.childrenNodes[direction]){
            return parentNode.childrenNodes[direction];
        }

        var widthWithMargin = CARCASSONNE.WIDTH + CARCASSONNE.MARGIN * 2;
        var dT = [widthWithMargin, 0, -widthWithMargin, 0];
        var dL = [0, -widthWithMargin, 0, widthWithMargin];
        var dX = [1, 0, -1, 0];
        var dY = [0, -1, 0, 1];

        var reverse = [2, 3, 0, 1];

        var node;
        if (arguments.length >= 2 && typeof direction == "number") {
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
            node = this.rootNode = new ru.seriouscow.carcassonne.engine.Node(typeof direction == "object" ? {
                l : direction.l,
                t : direction.t
            } : {});
        }

        node.card = card || (arguments.length == 1 || typeof direction != "number" ? parentNode : null);

        if (!node.card) {
            this._emptyNodes.add(node);
        }

        this._putToHashTable(node);

        this.boardBox.l = Math.min(this.boardBox.l, node.l);
        this.boardBox.t = Math.min(this.boardBox.t, node.t);

        this.boardBox.r = Math.max(this.boardBox.r, node.l + widthWithMargin);
        this.boardBox.b = Math.max(this.boardBox.b, node.t + widthWithMargin);

        return node;
    },

    /**
     * Placing card to empty node
     * @param node
     * @param card
     */
    placeCardToNode : function (node, card) {
        this._emptyNodes.remove(node);
        node.card = card;
    },

    _putToHashTable : function (node) {
        var index = 1000 * (node.x + this._dX) + node.y + this._dY;
        this._hashTable[index] = node;
        this._indexArray.push(index);
    },

    _getFromHashTable : function (x, y) {
        return this._hashTable[1000 * (x + this._dX) + y + this._dY];
    },

    /**
     * Creating nodes Neighborhoods
     * @param parent
     */
    createNeighborhoodNodes : function (parent) {
        var nodes = [];

        for (var i = 0; i < parent.childrenNodes.length; i++) {
            if (!parent.childrenNodes[i]) {
                nodes.push(this.createNode(parent, i));
            }
        }

        return nodes;
    },

    getNextCard : function (isFirstStep) {
        this._availablePlaces = [];

        this.nextCard = null;

        if (isFirstStep){
            this.nextCard = this.cards[this.cardsOrder.pop()];
            return this.nextCard;
        }

        for (var i = 0; i < this._emptyNodes.count; i++) {
            if (this.cardsOrder.length == 0) {
                return false;
            }
            if (!this.nextCard) {
                this.nextCard = this.cards[this.cardsOrder.pop()];
            }

            if (this.nextCard.isPlaceAvailableForCard(this._emptyNodes.item(i))) {
                this._availablePlaces.push(this._emptyNodes.item(i));
            }
        }

        if (this._availablePlaces.length == 0) {
            return this.getNextCard();
        }
        return this.nextCard;
    },

    getAvailableNodes : function () {
        return this._availablePlaces;
    }
})

