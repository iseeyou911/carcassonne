/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 05.01.12
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 *
 * Representatoin of game card
 */

dojo.provide('ru.seriouscow.carcassonne.engine.GameScene');

dojo.declare('ru.seriouscow.carcassonne.engine.GameScene', null, {

    context2D : null,
    scene : null,

    textures : {},
    _cX : null,
    _cY : null,

    colors : {
        connector : '#00FF00',
        subconnector : '#FF0000'
    },
    stroke : [
        '#00FF00',
        '#000000',
        '#FF00FF',
        '#FF0000',
        '#0000FF',
        '#00FFFF'
    ],
    constructor : function (args) {
        this._cX = null;
        this._cY = null;
        dojo.safeMixin(this, args || {});
    },

    init : function (args) {
        var box = this.getBox();
        var self = this;

        this.scene = new Rectangle(box.w, box.h, {
            centered : true,
            x : box.w / 2 - CARCASSONNE.WIDTH / 2,
            y :  box.h / 2 - CARCASSONNE.WIDTH / 2,
            scale : 0.8
        });

        this.table = new Rectangle(box.w * 6, box.h * 6, {
            x: 0,
            y: 0,
            zIndex: 0,
            centered : true,
            fill : new Pattern(this.textures.table.image, 'repeat')
        })

        this.scene.append(this.table);
        this.context2D.append(this.scene);

        var boardBox;
        var doScale = function (e) {
            var newScale = self.scene.scale + e.wheelDelta / Math.abs(e.wheelDelta) * 0.2;
            if (newScale >= 0.4 && newScale <= 0.8) {
                self.scene.removeEventListener('mousewheel', self.scene.eventListeners.mousewheel.bubble[0]);
                self.scene.animateTo('scale', newScale, 200);
                self.scene.after(200, function() {
                    self.scene.when('mousewheel', doScale);
                })
            }
        }
        this.scene.when('mousewheel', doScale);

        this.scene.when('mousedown', function (e) {
            e.stopImmediatePropagation();
            boardBox = self.getBoardBoxObserver();
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

    swichCardTo : function (card, nodeTo, x, y, scale) {
        var self = this;
        var box = this.getBox();
        self.scene.catchMouse = false;
        var animated = new ImageNode(card.image, {
            x: x,
            y: y,
            rotation : 89.9999 * Math.PI / 180 * card.oldShift,
            dWidth: CARCASSONNE.WIDTH,
            dHeight : CARCASSONNE.WIDTH,
            zIndex : 10000,
            centered : true,
            shadowBlur : 4,
            shadowColor : '#000000',
            stroke : '#b22929',
            strokeWidth : 5,
            scale: scale
        });

        this.context2D.append(animated);
        animated.animateTo('rotation', 89.9999 * Math.PI / 180 * card.shift, 300);
        animated.animateTo('scale', self.scene.scale + 0.1, 250);

        animated.after(250, function() {
            animated.animateTo('scale', self.scene.scale, 250);
        })

        animated.animateTo('x', (nodeTo.l + CARCASSONNE.WIDTH / 2) * this.scene.scale + this.scene.x, 500);
        animated.animateTo('y', (nodeTo.t + CARCASSONNE.WIDTH / 2) * this.scene.scale + this.scene.y, 500);

        animated.after(499, function () {
            self.context2D.remove(animated);
            self.scene.catchMouse = true;
            self.drawHUD(nodeTo, card);
        });
    },

    drawNode : function (node) {
        var self = this;

        if (node.canvasNode) {
            self.scene.remove(node.canvasNode);
        }

        if (node.card) {

            node.canvasNode = new ImageNode(node.card.image, {
                rotation : 89.9999 * Math.PI / 180 * node.card.shift || 0,
                x: node.l + CARCASSONNE.WIDTH / 2,
                y: node.t + CARCASSONNE.WIDTH / 2,
                dWidth: CARCASSONNE.WIDTH,
                dHeight : CARCASSONNE.WIDTH,
                centered : true,
                zIndex: 1,
                shadowBlur : 10,
                shadowColor : '#000000'
            });

            dojo.forEach(node.tokens, function (tokens) {
                var vertex = self.createTokenNode(node, tokens);
                node.canvasNode.append(vertex);
            })

        } else {

            node.canvasNode = new ImageNode(this.textures.placeHolder.image, {
                dX: node.l + CARCASSONNE.WIDTH / 2,
                dY: node.t + CARCASSONNE.WIDTH / 2,
                dWidth: CARCASSONNE.WIDTH,
                dHeight : CARCASSONNE.WIDTH,
                centered : true,
                zIndex: 1,
                cursor : 'pointer'
            });

            var a = node.canvasNode.when('click', function () {

                if (!self._isMouseDown) {
                    var nextCard = self.getNextCard();

                    if (self._selectedNode && !self._selectedNode.card) {
                        self.drawNode(self._selectedNode);
                    }

                    var x = self._selectedNode ? (self._selectedNode.l + CARCASSONNE.WIDTH / 2) * self.scene.scale + self.scene.x : CARCASSONNE.WIDTH / 2;
                    var y = self._selectedNode ? (self._selectedNode.t + CARCASSONNE.WIDTH / 2) * self.scene.scale + self.scene.y : CARCASSONNE.WIDTH / 2;
                    var scale = self._selectedNode ? self.scene.scale : 1;

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

        this.scene.append(node.canvasNode);
    },

    drawHUD : function (node, card) {
        var self = this;
        var canRotate = card.canRotate(node);
        this.scene.remove(node.canvasNode);

        var HUD = node.canvasNode = new Rectangle(CARCASSONNE.WIDTH, CARCASSONNE.WIDTH, {
            x: node.l + CARCASSONNE.WIDTH / 2,
            y: node.t + CARCASSONNE.WIDTH / 2,
            centered : true,
            zIndex: 1,

            opacity : 1
        })
        this.scene.append(HUD);

        var tmpCard = new ImageNode(card.image, {
            rotation : 89.9999 * Math.PI / 180 * card.shift,
            x: 0,
            y: 0,
            centered : true,
            zIndex: 1,
            shadowBlur : 4,
            shadowColor : '#000000',
            stroke : '#b22929',
            strokeWidth : 5,
            cursor : 'pointer'
        });

        HUD.append(tmpCard);

        var nextButton = new ImageNode(this.textures.nextButton.image, {
            dX : 0,
            dY : CARCASSONNE.WIDTH / 2,
            centered : true,
            zIndex: 3,
            cursor : 'pointer'
        });

        HUD.append(nextButton);
        var selectedToken;
        nextButton.when('click', function () {
            if (!self._isMouseDown) {
                if (selectedToken != null) {
                    self._selectedNode.tokens.push(selectedToken);
                }

                if(!self.onNextStep(self._selectedNode)) {
                    return;
                } else {
                    if (rotateArrow) {
                        HUD.remove(rotateArrow);
                        tmpCard.removeEventListener('click', tmpCard.eventListeners.click.bubble[0]);
                    }

                    tmpCard.cursor = 'default';

                    var tokens = self.getAvailableTokens(card) || [];
                    for (var i = 0; i < tokens.length; i++) {
                        (function (token) {
                            var vertex = self.createTokenNode(node, token);
                            tmpCard.append(vertex);
                            vertex.when('click', function (e) {
                                selectedToken = token;
                            })
                        })(tokens[i]);

                    }
                }
            }
        });

        if (canRotate) {

            var rotateArrow = new ImageNode(this.textures.rotateArrow.image, {
                x: 0,
                y: 0,
                dWidth: CARCASSONNE.WIDTH,
                dHeight : CARCASSONNE.WIDTH,
                centered : true,
                zIndex: 2,
                opacity : 0.6,
                shadowBlur : 0,
                shadowColor : '#000000',
                stroke : false,
                strokeWidth : 0,
                cursor : 'pointer',
                catchMouse : false
            });

            HUD.append(rotateArrow);

            tmpCard.when('click', function () {
                if (!self._isMouseDown) {
                    if (canRotate && card.rotate(node)) {
                        tmpCard.animateTo('rotation', 89.9999 * Math.PI / 180 * card.shift, 500);
                    } else {
                        canRotate = false;
                    }
                }
            });
        } else {

        }
    },

    drawAvailablePlaces : function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.drawNode(nodes[i]);
        }
    },

    createTokenNode : function (node, token) {
        var item = node.card.vertex[token];
        return new Circle(10, {
            x : item.x * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2,
            y : item.y * CARCASSONNE.WIDTH - CARCASSONNE.WIDTH / 2,
            zIndex: 2,
            fill: this.stroke[item.type],
            stroke : this.stroke[item.type]
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
                /////canvasNode.removeEventListener('click', canvasNode.eventListeners.click.bubble[0]);
                self.scene.remove(canvasNode);
            }

        }
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
    }
})