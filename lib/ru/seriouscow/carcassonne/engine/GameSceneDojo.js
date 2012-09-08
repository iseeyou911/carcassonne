/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 *
 * Representation of game card
 */

dojo.provide('ru.seriouscow.carcassonne.engine.GameSceneDojo');

dojo.require("dojox.gfx");
dojo.require('dojox.gfx.fx');

dojo.declare('ru.seriouscow.carcassonne.engine.GameSceneDojo', null, {

    context2D : null,
    scene : null,

    textures : {},
    _cX : null,
    _cY : null,


    constructor : function (args) {
        this._cX = null;
        this._cY = null;
        dojo.safeMixin(this, args || {});
    },

    init : function (args) {
        var box = this.getBoxObserver();
        var self = this;

        var width = box.w * 6;
        var height = box.h * 6;
        var scene = this.scene = dojox.gfx.createSurface(this.context2D, box.w, box.h);
        scene.whenLoaded(function (){
            self.table = scene.createRect({
				width: width,
				height: height,
                x : (box.w) / 2 - width / 2,
                y : (box.h) / 2 - height / 2
			}).setFill({
                    src : self.textures.table.image.src,
                    type : 'pattern',
                    width : self.textures.table.image.width,
                    height : self.textures.table.image.height,
                    x : 0,
                    y : 0
            });

            self.cardsNode = self.scene.createGroup();
        })
    },

    swichCardTo : function (card, nodeTo, x, y, scale) {
        var self = this;
        var box = this.getBoxObserver();
        self.scene.catchMouse = false;
        var animated = self.cardsNode.createImage({
                src : card.image.src,
                x: x,
                y: y,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH
            }).setTransform(dojox.gfx.matrix.rotategAt(90 * card.oldShift || 0, x, y));

        var tableBox = this.table.getBoundingBox();
        var newX = tableBox.x + tableBox.width / 2  + nodeTo.l - CARCASSONNE.WIDTH / 2;
        var newY = tableBox.y + tableBox.height / 2  + nodeTo.t - CARCASSONNE.WIDTH / 2;

        var anim = dojox.gfx.fx.animateTransform({
            duration:	300,
            shape: 		animated,
            transform:	[
                {name: "rotategAt", start:[90 * card.oldShift || 0, x, y], end: [90 *  card.shift, x, y]},
                {name: "translate", start:[x, y], end: [newX, newY]}
            ]
        });

        dojo.connect(anim, "onEnd", function(){
            self.cardsNode.remove(animated);
           // self.scene.catchMouse = true;
           // self.drawTempCard(nodeTo, card);
        });

        anim.play();


    },

    drawNode : function (node) {
        var self = this;
        var tableBox = this.table.getBoundingBox();
        var x = tableBox.x + tableBox.width / 2  + node.l - CARCASSONNE.WIDTH / 2;
        var y = tableBox.y + tableBox.height / 2  + node.t - CARCASSONNE.WIDTH / 2;
        
        if (node.canvasNode) {
            self.cardsNode.remove(node.canvasNode);
        }

        if (node.card) {

            node.canvasNode = self.cardsNode.createImage({
                src : node.card.image.src,
                x: x,
                y: y,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH
            }).setTransform(dojox.gfx.matrix.rotateAt(90 * Math.PI / 180 * node.card.shift || 0, x, y));

        } else {

            var tableBox = this.table.getBoundingBox();
            node.canvasNode = self.cardsNode.createImage({
                src : this.textures.placeHolder.image.src,
                x: x,
                y: y,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH
            });
            node.canvasNode.connect('onclick', node.canvasNode, function (e){
                if (!self._isMouseDown) {
                    var nextCard = self.getNextCardObserver();

                    if (self._selectedNode && !self._selectedNode.card) {
                        self.drawNode(self._selectedNode);
                    }

                    var xy = self.getCenter(self._selectedNode && self._selectedNode.canvasNode ? self._selectedNode.canvasNode.getBoundingBox() : {
                        x : 0,
                        y : 0,
                        width : 0,
                        height : 0
                    });

                    //var x = self._selectedNode ? (self._selectedNode.l + CARCASSONNE.WIDTH / 2) * self.scene.scale + self.scene.x : CARCASSONNE.WIDTH / 2;
                    //var y = self._selectedNode ? (self._selectedNode.t + CARCASSONNE.WIDTH / 2) * self.scene.scale + self.scene.y : CARCASSONNE.WIDTH / 2;
                    //var scale = self._selectedNode ? self.scene.scale : 1;

                    if (!nextCard.isPlaceAvailableForCard(node, 0)) {
                        nextCard.rotate(node);
                    } else {
                        nextCard.oldShift = nextCard.shift;
                    }

                    self.swichCardTo(nextCard, node, xy.x, xy.y, 1);
                    self._selectedNode = node;

                    self.onNodeSelected(node);
                }
            })
        }
    },

    drawTempCard : function (node, card) {

    },

    getCenter : function (boundBox){
        return {
            x : boundBox.x + boundBox.width / 2,
            y : boundBox.y + boundBox.height / 2
        }
    },

    drawAvailablePlaces : function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.drawNode(nodes[i]);
        }
    },

    clearAvailablePlaces : function (nodes) {
        var self = this;
        for (var i = 0; i < nodes.length; i++) {

            var canvasNode = nodes[i].canvasNode;
            if (!canvasNode){
                continue;
            }
            /////canvasNode.removeEventListener('click', canvasNode.eventListeners.click.bubble[0]);
            self.cardsNode.remove(canvasNode);
        }
    },

    addCardHUD : function (node) {

    },

    nextSubstepObserver : function (node){},
    onNodeSelected : function () {},
    getBoxObserver : function (){},
    getNextCardObserver : function (){},
    getBoardBoxObserver : function (){}
})