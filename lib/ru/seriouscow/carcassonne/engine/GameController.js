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
dojo.require('ru.seriouscow.carcassonne.engine.GameSceneK');
dojo.require('ru.seriouscow.carcassonne.CarcassonneGlobals');

dojo.declare('ru.seriouscow.carcassonne.engine.GameController', null, {
    cards : [],
    state : 'FIRST_SUBSTEP',

    init : function (box, textures, cards, canvas, players){
        var self = this;
        
        this.cards = cards;
        this.box = box;
        
        this.boardController = new ru.seriouscow.carcassonne.engine.BoardController();
        this.gameLogic = new ru.seriouscow.carcassonne.engine.GameLogic();
        this.gameScene = ru.seriouscow.carcassonne.engine.GameSceneK({
            textures : textures,
            getBox : function (){
                return box;
            },
            getNextCard : function (){
                return self.boardController.nextCard;
            },
            getBounds : function () {
                return self.boardController.boardBox;
            },
            onNextStep : function (node) {
                return self.nextStep(node);
            },
            getAvailableTokens : function (node, card) {
		self.gameLogic.attachNode(node, card);
                return self.gameLogic.getAvailableTokens(card);
            },
	    rollback : function () {
		self.gameLogic.rollback();
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

        this.gameScene.drawNode(node);

        this.boardController.placeCardToNode(node, this.boardController.nextCard);
        this.gameScene._selectedNode = null;
        this.boardController.createNeighborhoodNodes(node);
        this.boardController.getNextCard();
        this.gameScene.drawAvailablePlaces(this.boardController.getAvailableNodes());
        this.gameLogic.attachNode(node, node.card);
    },

    previousStep : function (){
        var self = this;


        if (this.state == 'SECOND_SUBSTEP') {
            this.gameLogic.rollback();
            this.state = 'FIRST_SUBSTEP';
            node.card = null;
            this.gameScene.drawNode(node);
            this.gameScene.drawAvailablePlaces(this.boardController.getAvailableNodes());
            return false;
        }
    },

    nextStep : function (node){
        var self = this;


        if (this.state == 'FIRST_SUBSTEP') {
            node.card = self.boardController.nextCard;
            this.gameScene.clearAvailablePlaces(this.boardController.getAvailableNodes());
            this.gameLogic.attachNode(node, node.card);

            this.state = 'SECOND_SUBSTEP';
            return true;
        } else {
            this.state = 'FIRST_SUBSTEP';
            this.boardController.placeCardToNode(node, self.boardController.nextCard);
            this.gameScene.drawNode(node);
            this.gameScene._selectedNode = null;
            this.boardController.createNeighborhoodNodes(node);
            this.boardController.getNextCard();
            this.gameScene.drawAvailablePlaces(this.boardController.getAvailableNodes());
            return false;
        }
    }
})
