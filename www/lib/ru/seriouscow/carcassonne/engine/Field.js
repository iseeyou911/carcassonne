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
dojo.require('ru.seriouscow.carcassonne.engine.ResourceLoader');
dojo.require('ru.seriouscow.carcassonne.CarcassonneGlobals');
dojo.require('ru.seriouscow.carcassonne.engine.GameController');

dojo.declare('ru.seriouscow.carcassonne.engine.Field', [dijit._Widget, dijit._TemplatedMixin], {
    templateString : '<div style="width:100%; height: 100%; position: relative;" data-dojo-attach-point="field"></div>',
    resourceLoader : new ru.seriouscow.carcassonne.engine.ResourceLoader(),

    init : function (cards) {
        var self = this;
        var box = dojo.marginBox(this.domNode);
        this.context2D = new Canvas(this.field, box.w, box.h);
        this.theGame = new ru.seriouscow.carcassonne.engine.GameController()


        var textures = {
            table : {src : '/resources/images/table_texture.jpg'},
            placeHolder : {src : '/resources/images/shadow.png'},
            rotateArrow : {src : '/resources/images/rotateArrow.png'},
            nextButton : {src : '/resources/images/nextButton.png'}
        }

        this.resourceLoader.getNewImageLoader().push(cards).push(textures.table).
        push(textures.placeHolder).push(textures.rotateArrow).push(textures.nextButton).load().then(function(){
            self.theGame.init(box, textures, cards, self.context2D);
            self.theGame.newGame();
        })
    }
/*
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


    },

    _drawNextCard : function () {
        if (this._nextCardNode) {
            this.context2D.remove(this._nextCardNode);
        }

        this._nextCardNode = new ImageNode(this.nextCard.image, {x: 0, y: 0, dWidth: WIDTH, dHeight : WIDTH, zIndex : 10000});

        this.context2D.append(this._nextCardNode);
    }

*/
})



