cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        var w = cc.view.getVisibleSize().width;
        var h = cc.view.getVisibleSize().height;
        this.node.width = w;
        this.node.height = h;
    },
    start(){

    },
});
