/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 20:27
 * To change this template use File | Settings | File Templates.
 */

dojo.provide('ru.seriouscow.carcassonne.engine.GameController');

dojo.require('ru.seriouscow.carcassonne.engine.BoardController');
dojo.require('ru.seriouscow.carcassonne.engine.GameLogic');
dojo.require('ru.seriouscow.carcassonne.engine.GameScene');
dojo.require('ru.seriouscow.carcassonne.CarcassonneGlobals');

dojo.declare('ru.seriouscow.carcassonne.engine.GameController', null, {
    cards : [],

    init : function (box, textures, cards, canvas, players){
        var self = this;
        
        this.cards = cards;
        this.box = box;
        
        this.boardController = new ru.seriouscow.carcassonne.engine.BoardController();
        this.gameLogic = new ru.seriouscow.carcassonne.engine.GameLogic();
        this.gameScene = ru.seriouscow.carcassonne.engine.GameScene({
            textures : textures,
            getBoxObserver : function (){
                return box;
            },
            getNextCardObserver : function (){
                return self.boardController.nextCard;
            },
            getBoardBoxObserver : function () {
                return self.boardController.boardBox;
            },
            nextSubstepObserver : function (node) {
                self.nextStep(node)
            },
            context2D : canvas
        });
    },

    newGame : function (){
        this.boardController.createDeck(this.cards);
        this.gameScene.init();

        var node = this.boardController.createNode(this.boardController.getNextCard(true), {
            l : 0,
            t : 0
        });


        this.nextStep(node);
    },

    nextStep : function (node){
        var self = this;
        this.gameScene.clearAvailablePlaces(this.boardController.getAvailableNodes());
        
        if (node.card == null) {
            self.boardController.placeCardToNode(node, self.boardController.nextCard);
            self.gameScene._selectedNode = null;
        }

        this.boardController.createNeighborhoodNodes(node);
        this.gameScene.drawNode(node);

        this.boardController.getNextCard();
        this.gameScene.drawAvailablePlaces(this.boardController.getAvailableNodes());
    }
})