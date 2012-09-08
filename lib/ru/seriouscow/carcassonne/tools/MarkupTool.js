/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 11.02.12
 * Time: 0:01
 * To change this template use File | Settings | File Templates.
 */

dojo.provide('ru.seriouscow.carcassonne.tools.MarkupTool');
dojo.require('ru.seriouscow.carcassonne.engine.ResourceLoader');
dojo.require('dijit._Widget');
dojo.require('dijit._TemplatedMixin');
dojo.require('dijit.form.Button');
dojo.declare('ru.seriouscow.carcassonne.tools.MarkupTool', [dijit._Widget, dijit._TemplatedMixin], {
    widgetsInTemplate : true,
    _earlyTemplatedStartup : true,
    templateString : '<div style="width:400px; height: 500px;"><div style="width:400px; height: 400px; position: relative;" data-dojo-attach-point="field"></div><div data-dojo-attach-point="_buttonContainer"></div></div>',
    resourceLoader : new ru.seriouscow.carcassonne.engine.ResourceLoader(),
    images : ["/resources/images/cards/card_01.png", "/resources/images/cards/card_02.png", "/resources/images/cards/card_04.png", "/resources/images/cards/card_05.png", "/resources/images/cards/card_06.png", "/resources/images/cards/card_08.png", "/resources/images/cards/card_09.png", "/resources/images/cards/card_10.png", "/resources/images/cards/card_11.png", "/resources/images/cards/card_13.png", "/resources/images/cards/card_14.png", "/resources/images/cards/card_15.png", "/resources/images/cards/card_16.png", "/resources/images/cards/card_17.png", "/resources/images/cards/card_20.png", "/resources/images/cards/card_21.png", "/resources/images/cards/card_22.png", "/resources/images/cards/card_23.png", "/resources/images/cards/card_25.png", "/resources/images/cards/card_27.png", "/resources/images/cards/card_28.png", "/resources/images/cards/card_101.png", "/resources/images/cards/card_111.png", "/resources/images/cards/card_116.png", "/resources/images/cards/card_121.png", "/resources/images/cards/card_122.png", "/resources/images/cards/card_123.png", "/resources/images/cards/card_124.png"],
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
    postCreate : function (e) {
        var self = this;

        this.context2D = new Canvas(this.field, 400, 400);

        for (var i = 0; i < this.images.length; i++) {
            this.images[i] = {src : this.images[i]}
        }
        this.curIndex = 0;
        this.resourceLoader.getNewImageLoader().push(this.images).load().then(function (e) {
            var img = self.images[0].image;
            self.init(img);
        });

        dojo.place((new dijit.form.Button({
            label : 'Дальше',
            onClick : function (){
                if (self.curIndex < self.images.length - 1) {
                    self.curIndex++;
                    var img = self.images[self.curIndex].image;
                    self.init(img);
                }
            }
        })).domNode, this._buttonContainer, 'last');

        dojo.place((new dijit.form.Button({
            label : 'Назад',
            onClick : function (){
                if (self.curIndex > 0) {
                    self.curIndex--;
                    var img = self.images[self.curIndex].image;
                    self.init(img);
                }
            }
        })).domNode, this._buttonContainer, 'last');
        dojo.place((new dijit.form.Button({
            label : 'Дамп',
            onClick : function (){
                console.log(self.dump());
            }
        })).domNode, this._buttonContainer, 'last');
        dojo.place((new dijit.form.Button({
            label : 'Сброс',
            onClick : function (){
                self.curImg.edges = null;
                self.curImg.vertex = null;
                self.init(self.curImg);
            }
        })).domNode, this._buttonContainer, 'last');
    },

    init : function (img) {
        var self = this;
        this.curImg = img;
        this.context2D.removeAllChildren();
        this.imageNode = new ImageNode(img, {
            x: 200,
            y: 200,
            centered : true,
            zIndex: 1
        });

        this.context2D.append(self.imageNode);
        this.curImg.edges = img.edges || [];

        this.curImg.vertex = img.vertex || [
            {x : 0, y : 0.5, type : 1, role : 'connector'},
            {x : 0.5, y : 1, type : 1, role : 'connector'},
            {x : 1, y : 0.5, type : 1, role : 'connector'},
            {x : 0.5, y : 0, type : 1, role : 'connector'},
            {x : 0, y : 0.25, type : 1, role : 'subconnector'},
            {x : 0, y : 0.75, type : 1, role : 'subconnector'},
            {x : 1, y : 0.25, type : 1, role : 'subconnector'},
            {x : 1, y : 0.75, type : 1, role : 'subconnector'},
            {x : 0.25, y : 1, type : 1, role : 'subconnector'},
            {x : 0.75, y : 1, type : 1, role : 'subconnector'},
            {x : 0.25, y : 0, type : 1, role : 'subconnector'},
            {x : 0.75, y : 0, type : 1, role : 'subconnector'}
        ]

        dojo.forEach(this.curImg.vertex, function (item) {
            var xy = self.getXY(self.curImg, item);
            self.createVertex(xy.x, xy.y, item);
        });

        this.imageNode.when('click', function (e) {
            var v = {
                x : (e.x - 200 + img.width / 2) / img.width,
                y : (e.y - 200 + img.height / 2) / img.height
            };

            self.curImg.vertex.push(v);
            self.createVertex(e.x, e.y, v);
        });

        this.drawEdges(this.curImg);
    },

    createVertex : function (x, y, v) {
        var self = this;
        v.role = 'normal';
        v.type = v.type == null ? 1 : v.type;
        var node = new Circle(5, {
            x : x,
            y : y,
            centered : true,
            zIndex: 2,
            fill: this.colors[v.role] || '#000000',
            vertex : v,
            stroke : this.stroke[v.type]
        })

        node.when('click', function (e) {
            if (e.ctrlKey && (node.role != 'connector' || node.role != 'subconnector')) {
                self.removeVertex(node);
            } else if (e.altKey) {
                v.type = v.type >= self.stroke.length - 1 ? 0 : v.type + 1;
                node.stroke = self.stroke[v.type];
            } else {
                self.drawEdge(node);
            }
        })

        this.context2D.append(node);
    },

    removeVertex : function (node) {
        var i = this.curImg.vertex.indexOf(node.vertex);
        this.curImg.vertex = this.curImg.vertex.slice(0, i).concat(this.curImg.vertex.slice(i + 1));
        this.context2D.remove(node);
    },

    getXY : function (img, item){
        var x = 200 - img.width / 2 + img.width * item.x;
        var y = 200 - img.height / 2 + img.height * item.y;
        return {x : x, y : y}
    },

    drawEdge : function (node) {

        if (this._firstNode == node){
            this._firstNode = null;
            return false;
        }

        if (!this._firstNode) {
            this._firstNode = node;
        } else {
            this.context2D.append(new Line(this._firstNode.x, this._firstNode.y, node.x, node.y, {zIndex : 3}));
            this.curImg.edges.push(this.curImg.vertex.indexOf(this._firstNode.vertex));
            this.curImg.edges.push(this.curImg.vertex.indexOf(node.vertex));
            this._firstNode = null;
        }
    },

    drawEdges : function (v){
        for (var i = 0; i < v.edges.length; i += 2) {
            var fXY = this.getXY(this.curImg, v.vertex[v.edges[i]]);
            var sXY = this.getXY(this.curImg,v.vertex[v.edges[i + 1]]);

            this.context2D.append(new Line(fXY.x, fXY.y, sXY.x, sXY.y, {zIndex : 3}));
        }
    },

    dump : function () {
        var result = [];
        dojo.forEach(this.images, function (item, index) {
            var d = {};
            d.src = item.src;
            d.vertex = item.image.vertex;
            d.edges = item.image.edges;
            result.push(d);
        });


        return dojo.toJson(result);
    }
})