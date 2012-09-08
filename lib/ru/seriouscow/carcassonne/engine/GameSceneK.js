/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 *
 * Representatoin of game card
 */

dojo.provide('ru.seriouscow.carcassonne.engine.GameSceneK');

dojo.declare('ru.seriouscow.carcassonne.engine.GameSceneK', null, {

    context2D : null,
    scene : null,

    textures : {},
    _cX : null,
    _cY : null,

    colors : {
        connector : '#00FF00',
        subconnector : '#FF0000'
    },
    strokes : [
                    {
                        stroke : '#911717',
                        strokeWidth : 7
                    },
                    {
                        stroke : '#b22929',
                        strokeWidth : 5
                    },
                    {
                        stroke : '#911717',
                        strokeWidth : 2
                    }
    ],

    fills : [
        [0, '#f0b7a1', 0.5, '#8c3310', 0.51, '#752201', 1, '#72331a'],
        [0, '#c1db95', 0.5, '#658f11', 0.51, '#446b01', 1, '#477430'],
        [0, '#b19ed2', 0.5, '#41227e', 0.51, '#2c0f5d', 1, '#5a396b'],
        [0, '#f67a7d', 0.5, '#99070e', 0.51, '#690305', 1, '#98340c'],
        [0, 'rgba(0,0,0,0)', 0.85, 'rgba(0,0,0,0.6)', 0.90, 'rgba(109,109,109,0.42)', 0.93, 'rgba(255,255,255,0.36)', 1, 'rgba(255,255,255,0)'],
        [0, '#f0b7a1', 0.5, '#8c3310', 0.51, '#752201', 1, '#72331a']
    ],
    constructor : function (args) {
        this._cX = null;
        this._cY = null;
        dojo.safeMixin(this, args || {});
    },

    init : function (args) {
        var box = this.getBox(),
            w = box.w * 3, h = box.h * 3,
            self = this,
            bottomLayer = this.bottomLayer = new Kinetic.Layer({
                centerOffset : {
                    x : w / 2,
                    y : h / 2
                },
                width : w,
                height : h,
                x : box.w / 2,
                y : box.h / 2
            }),
            scene = this.scene = new Kinetic.Group({
                x : w / 2,
                y : h / 2
            }),
            topLayer = this.topLayer = new Kinetic.Layer({
                
            }),
            table = new Kinetic.Rect({
                width: w,
                height: h,
                fill : {
                    image : this.textures.table.image,
                    repeat : "repeat",
                    offset : [0, 0]
                }
                //fill: bottomLayer.getContext().createPattern(this.textures.table.image, "repeat")
            });

        bottomLayer.add(table);
        bottomLayer.add(scene);
        this.context2D.add(bottomLayer);
        this.context2D.add(topLayer);
        bottomLayer.setScale(0.6, 0.6);

        var doScale = function (e) {
            if (!self.bottomLayer.attrs.listening) {
                return;
            }

            var scale = bottomLayer.getScale(),
                newScale = scale.x + e.wheelDelta / Math.abs(e.wheelDelta) * 0.1;
            if (newScale >= 0.4 && newScale <= 0.6) {

                dojo.disconnect(self._onmousewheelHandler);

                bottomLayer.transitionTo({
                    duration : 0.2,
                    scale : {x : newScale, y : newScale},
                    callback : function () {
                        self._onmousewheelHandler = dojo.connect(window.document, 'onmousewheel', doScale);
                    }
                });

            }
        }

        this._onmousewheelHandler = dojo.connect(window.document, 'onmousewheel', doScale);

        bottomLayer.on('mousedown', function (e) {
            dojo.stopEvent(e);

            self._isMouseDown = e.button == 1;
        })

        bottomLayer.on('mouseup', function (e) {
            self._cX = null;
            self._cY = null;
            self._isMouseDown = false;
        });

        bottomLayer.on('mousemove', function (e) {
            var x, y, bounds;

            if (self._isMouseDown) {

                dojo.stopEvent(e);

                if (self._cX && self._cY) {
                    bounds = self.getBounds();
                    x = bottomLayer.getX() + e.clientX - self._cX || 0;
                    y = bottomLayer.getY() + e.clientY - self._cY || 0;
                    
                    bottomLayer.setPosition(x, y);
                    bottomLayer.draw();
                }

            }
            self._cX = e.clientX;
            self._cY = e.clientY;

        })

    },

    /**
     *Transition card from cards set to node location
     * @param card - card
     * @param nodeTo - container node
     * @param x - x of node relative screen
     * @param y - y of node relative screen
     * @scale scale
     */


    swichCardTo : function (card, nodeTo, x, y, scale) {
        var self = this,
            box = this.getBox(),
            scale = this.bottomLayer.getScale(),
            x2 = nodeTo.l * scale.x + this.bottomLayer.getX(),
            y2 = nodeTo.t * scale.y + this.bottomLayer.getY();
        
        this.bottomLayer.attrs.listening = false;
        var animated = new Kinetic.Image({
            x: x,
            y: y,
            image : card.image,
            rotation : Math.PI * 0.5 * card.oldShift,
            width: CARCASSONNE.WIDTH,
            height : CARCASSONNE.WIDTH,
            zIndex : 10000,
            strokes : this.strokes,
            centerOffset : { x : CARCASSONNE.WIDTH / 2, y : CARCASSONNE.WIDTH / 2},
            

            scale: scale,
            shadow : {
                    color : 'black',
                    blur : 10,
                    alpha : 0.6,
                    offset : [10, 10]
                }
        });

        this.topLayer.add(animated);
        this.topLayer.draw();
        
        animated.transitionTo({
                rotation : Math.PI * 0.5 * card.shift,
                x : x2,
                y : y2,
                scale : { x : scale.x, y : scale.y},
                duration : 0.5,//Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2)) * 0.5 / Math.sqrt(Math.pow(CARCASSONNE.WIDTH / 2 - x2, 2) + Math.pow(CARCASSONNE.HEIGHT / 2 - y2, 2)),

                callback : function () {
                    self.topLayer.remove(animated);
                    self.drawHUD(nodeTo, card);
                    self.bottomLayer.attrs.listening = true;
                }
            });
    },

    //Drawing card or card's holder to node
    drawNode : function (node) {
        var self = this, cardGroup;

        if (node.canvasNode) {
            node.canvasNode.off('click');
            node.canvasNode.removeChildren();
        } else {
            node.canvasNode = new Kinetic.Group({
                x: node.l,
                y: node.t
            });
            this.scene.add(node.canvasNode);
        }


        if (node.card) {
             //draw card in node
            cardGroup = new Kinetic.Group({
                rotation : Math.PI * 0.5 * node.card.shift || 0,
                zIndex: 1,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.HEIGHT,
                centerOffset : { x : CARCASSONNE.WIDTH / 2, y : CARCASSONNE.HEIGHT / 2}
            });

            cardGroup.add(new Kinetic.Image ({
                image : node.card.image,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.HEIGHT,
                shadow : {
                    color : 'black',
                    blur : 5,
                    alpha : 1
                }
            }));
            node.canvasNode.add(cardGroup);

            dojo.forEach(node.tokens, function (tokens) {
                var vertex = self.createTokenNode(node, tokens);
                cardGroup.add(vertex);
            })

        } else {
            //draw placeholder
            node.canvasNode.add(new Kinetic.Image({
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH,
                image : this.textures.placeHolder.image,
                zIndex: 1,
                centerOffset : { x : CARCASSONNE.WIDTH / 2, y : CARCASSONNE.WIDTH / 2}
            }));

            node.canvasNode.on('click', function (e) {

                if (e.button == 0) {
                    var nextCard = self.getNextCard(),
                        scale = self.bottomLayer.getScale();

		    self._selectedNode && self.rollback();
                    self._selectedNode && !self._selectedNode.card && self.drawNode(self._selectedNode);

                    //calc starting coord for animation
                    var x = self._selectedNode ? (self._selectedNode.l) * scale.x + self.bottomLayer.getX() : CARCASSONNE.WIDTH * scale.x / 2,
                        y = self._selectedNode ? (self._selectedNode.t) * scale.y + self.bottomLayer.getY() : CARCASSONNE.HEIGHT * scale.y / 2,
                        scale = self._selectedNode ? self.bottomLayer.scale : {x : 1, y :1 };


                    if (!nextCard.isPlaceAvailableForCard(node, 0)) {
                        nextCard.rotate(node);
                    } else {
                        nextCard.oldShift = nextCard.shift;
                    }

                    self.swichCardTo(nextCard, node, x, y, scale);
                    self._selectedNode = node;

                    self.onNodeSelected(node);
                }
            });

        }
        this.bottomLayer.draw();
    },

    drawHUD : function (node, card) {
        var selectedToken, self = this,
            mode = 'FirstMode',
            canRotate = card.canRotate(node),
            HUD = node.canvasNode,
            HUDCardGroup = new Kinetic.Group({
                rotation : Math.PI * 0.5 * card.shift || 0,
                centerOffset : { x : CARCASSONNE.WIDTH / 2, y : CARCASSONNE.HEIGHT / 2}
            }),
            tmpCard = new Kinetic.Image({
                image : card.image,
                zIndex: 1,
                strokes : this.strokes,
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH,
                shadow : {
                    color : 'black',
                    blur : 10,
                    alpha : 0.5
                }
            }),
	    tokens = [],
	    vertexs = [];

        HUD.moveToTop();
        HUD.off("click");
        HUD.removeChildren();
        HUDCardGroup.add(tmpCard);
        HUD.add(HUDCardGroup);


        if (canRotate) {

            var rotateArrow = new Kinetic.Image({
                width: CARCASSONNE.WIDTH,
                height : CARCASSONNE.WIDTH,
                image : this.textures.rotateArrow.image,
                zIndex: 2,
                alpha : 0.8,
                centerOffset : { x : CARCASSONNE.WIDTH / 2, y : CARCASSONNE.HEIGHT / 2}
            });

            HUD.add(rotateArrow);

        }
	
	tokens = self.getAvailableTokens(node, card) || [];
        for (var i = 0; i < tokens.length; i++) {
            (function (token) {
	    var vertex = self.createTokenNode(node, token, card);
	    vertexs.push(vertex);
            HUDCardGroup.add(vertex);
            })(tokens[i]);
        }

	self.bottomLayer.draw();
        HUD.on('click', function (e) {
            var scale = self.bottomLayer.getScale(),
                viewport = dijit.getViewport(),
                x2 = node.l * scale.x + self.bottomLayer.getX(),
                y2 = node.t * scale.y + self.bottomLayer.getY();

                if (mode == 'FirstMode' && e.button == 2) {

		    self.rollback();
		    dojo.forEach(vertexs || [], function (item) {
			HUDCardGroup.remove(item);
			delete item;
		    });
		    vertexs = [];

                    if (canRotate && card.rotate(node)) {
                        HUDCardGroup.transitionTo({
                            rotation : Math.PI * 0.5 * card.shift,
                            duration : 0.5,
			    callback : function () {
				tokens = self.getAvailableTokens(node, card) || [];
				for (var i = 0; i < tokens.length; i++) {
				    (function (token) {
					var vertex = self.createTokenNode(node, token, card);
					vertexs.push(vertex);
					HUDCardGroup.add(vertex);
				    })(tokens[i]);
				} 
				self.bottomLayer.draw();	
			    }
                        });
                    } else {
                        canRotate = false;
                    }
                } else if (e.button == 0) {
		    self.drawSelectTokenUI(node, tmpCard, rotateArrow, vertexs);
		/*
                    if (selectedToken != null) {
                        self._selectedNode.tokens.push(selectedToken);
                    }

		    HUD.off('click');

                    if(mode == 'FirstMode') {
                        mode = 'SecondMode'
                        self.onNextStep(self._selectedNode);
                        self.bottomLayer.attrs.listening = false;

                        self.topLayer.add(HUD);
                        HUD.setPosition(x2, y2);
                        HUD.setScale(scale);

                        HUD.transitionTo({
                            x : viewport.w / 2,
                            y : viewport.h / 2,
                            scale : {x : 1.7, y : 1.7},
                            duration : 0.3,
                            callback : function() {
                                tmpCard.setShadow({
                                    color : 'black',
                                    blur : 100,
                                    alpha : 1
                                })
                            }
                        });

                        if (rotateArrow) {
                            HUD.remove(rotateArrow);
                        }

                        self.bottomLayer.draw();
                        self.topLayer.draw();
                    } else {
                        HUD.transitionTo({
                            x : x2,
                            y : y2,
                            scale : scale,
                            duration : 0.2,
                            callback : function() {
                                tmpCard.setShadow(null);
                                HUD.setPosition(node.l,node.t);
                                HUD.setScale({x : 1, y : 1});
                                self.topLayer.remove(HUD);
                                node.canvasNode = null;
                                self.onNextStep(self._selectedNode);
                                self.bottomLayer.attrs.listening = true;
                            }
                        });

                        self.bottomLayer.draw();
                        self.topLayer.draw();
                    }*/
                }
            });
        this.bottomLayer.draw();
    },

    drawSelectTokenUI : function (node, cardImage, rotateArrow, vertexs) {
	var self = this,
	scale = this.bottomLayer.getScale(),
	viewport = dijit.getViewport(),
	x2 = node.l * scale.x + this.bottomLayer.getX(),
	y2 = node.t * scale.y + this.bottomLayer.getY(),
	HUD = node.canvasNode;

	HUD.off('click');
	this.bottomLayer.attrs.listening = false;
	this.topLayer.add(HUD);
	HUD.setPosition(x2, y2);
	HUD.setScale(scale);

	HUD.transitionTo({
	    x : viewport.w / 2,
	    y : viewport.h / 2,
	    scale : {x : 1.7, y : 1.7},
	    duration : 0.3,
	    callback : function() {
		cardImage.setShadow({
		    color : 'black',
		    blur : 80,
		    alpha : 1,
		    offset : [28, 28]
		});

		dojo.forEach(vertexs || [], function (item) {
		    item.setAlpha(0.9);
		});
	    }
	});

	if (rotateArrow) {
	    HUD.remove(rotateArrow);
	}

	this.bottomLayer.draw();
	this.topLayer.draw();	
    },

    drawAvailablePlaces : function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.drawNode(nodes[i]);
        }
    },

    createTokenNode : function (node, token, card) {
        var item =card.vertex[token];



        return new Kinetic.Circle({
            radius : 12,
            
            x : item.x * CARCASSONNE.WIDTH,
            y : item.y * CARCASSONNE.WIDTH,
            zIndex: 2,
            fill: {
                start : {
                    radius : 0,
                    x : 2,
                    y : 2
                },
                end : {
                    radius : 12,
                    x : 0,
                    y : 0
                },
                colorStops : this.fills[4]
            },
	    alpha : 0.6
        });
    },

    clearAvailablePlaces : function (nodes) {
        var self = this;
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].card) {
                var canvasNode = nodes[i].canvasNode;
                if (!canvasNode) {
                    continue;
                }
                canvasNode.off('click');
                self.scene.remove(canvasNode);
                nodes[i].canvasNode = null;
            }

        }
    },

    getBounds : function (update) {

    },

    addCardHUD : function (node) {

    },

    getAvailableTokens : function (card) {
    },

    onNextStep : function (node) {
    },
    onNodeSelected : function () {
    },
    getBox : function () {
    },
    getNextCard : function () {
    },
    getBoardBoxObserver : function () {
    },
    rollback : function () {
	
    }
})
