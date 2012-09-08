/*some shit*/

/*
 Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
 Available via Academic Free License >= 2.1 OR the modified BSD license.
 see: http://dojotoolkit.org/license for details
 */
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.ContentPane");

dojo.ready(function () {


    dojo.require("ru.vtsft.tes.engine.Engine");

    ru.vtsft.tes.engine.Engine(window, dojo).then (function(){
        pageManager.reload();
    });





/*
    dojo.require("ru.seriouscow.carcassonne.engine.Field");
    window.$ = dojo

    var f = new ru.seriouscow.carcassonne.engine.Field();

    var n1 = f._createNode({type:[1,2,1,1], center : 1});
    var n2 = f._createNode(n1, 1, {type:[2,2,1,2], center : 2});
    var n3 = f._createNode(n2, 1, {type:[1,1,1,2], center : 1});
    var n4 = f._createNode(n2, 0, {type:[1,2,2,1], center : 2});
    var n5 = f._createNode(n4, 1, {type:[1,2,1,2], center : 2});
    var n6 = f._createNode(n5, 1, {type:[1,1,1,2], center : 1});

    f._checkCastle(n6);
    console.log(f._castleParts, "6");

    var f = new ru.seriouscow.carcassonne.engine.Field();

    n1 = f._createNode({type:[1,2,1,1], center : 1});
    n2 = f._createNode(n1, 1, {type:[2,2,1,2], center : 1});
    n3 = f._createNode(n2, 1, {type:[1,2,1,2], center : 2});
    n4 = f._createNode(n3, 1, {type:[1,1,1,2], center : 1});
    n5 = f._createNode(n2, 0, {type:[1,1,2,1], center : 1});
    
    f._checkCastle(n2);
    console.log(f._castleParts, "2 3 2");

    var f = new ru.seriouscow.carcassonne.engine.Field();

    n1 = f._createNode({type:[1,2,1,1], center : 1});
    n2 = f._createNode(n1, 1, {type:[1,1,2,2], center : 2});
    n3 = f._createNode(n2, 2, {type:[2,1,1,2], center : 1});
    n4 = f._createNode(n3, 3, {type:[1,2,1,1], center : 1});

    f._checkCastle(n3);
    console.log(f._castleParts, "3 2");

    var f = new ru.seriouscow.carcassonne.engine.Field();

    n1 = f._createNode({type:[1,2,1,2], center : 1});
    n2 = f._createNode(n1, 1, {type:[1,2,1,2], center : 1});

    f._checkCastle(n1);
    console.log(f._castleParts, "2");

    var f = new ru.seriouscow.carcassonne.engine.Field();

    n1 = f._createNode({type:[2,2,1,1], center : 2});
    n2 = f._createNode(n1, 0, {type:[1,1,2,1], center : 1});
    n3 = f._createNode(n1, 1, {type:[1,1,1,2], center : 1});

    f._checkCastle(n1);
    console.log(f._castleParts, "3");

*/
})
