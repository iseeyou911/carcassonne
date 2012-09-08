/**
 * Created by JetBrains WebStorm.
 * User: admin
 * Date: 19.03.12
 * Time: 20:57
 * To change this template use File | Settings | File Templates.
 */

dojo.provide('ru.seriouscow.pure.SceneNode');

ru.seriouscow.pure.SceneNode = (function () {

    var root = null;
    var counter = 0;

    var SceneNode = function (params) {
        params = params || {
            x : 0,
            y : 0,
            z : 0,
            value : null
        };

        dojo.mixin(this, params);

        this.nodes = this.nodes || {0 : []};
    };

    SceneNode.prototype.insert = function (node, parent) {
        parent = parent || this;

        var zIndex = node.z || 0;

        if (parent[zIndex]) {
            parent[zIndex].push(node);
        } else {
            parent[zIndex] = [node];
        }
    };

    SceneNode.prototype.search = function () {

    };

    SceneNode.prototype.getRoot = function () {
        return root;
    };

    SceneNode.prototype.getX = function () {
        return this.x;
    };

    SceneNode.prototype.getY = function () {
        return this.y;
    };

    SceneNode.prototype.getZ = function () {
        return this.z;
    };

    return SceneNode;
})();
