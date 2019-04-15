var BgNode = cc.Class({
    extends: cc.Component,

    properties: {
        isEnableOpacity: {default: true, displayName: "是否处理透明度"},
    },

    onLoad: function () {
        var w = cc.view.getVisibleSize().width;
        var h = cc.view.getVisibleSize().height;
        this.node.width = w;
        this.node.height = h;

        if (this.isEnableOpacity) {
            var v = 170 - BgNode.count * 60;
            v = v <= 0 ? 0 : v;
            this.node.opacity = v;

            BgNode.count++;
            //console.log("BgOpacity onLoad:" + BgNode.count);
        }
    },
    onDestroy(){
        if (this.isEnableOpacity) {
            BgNode.count--;
            if (BgNode.count <= 0) {
                BgNode.count = 0;
            }
            //console.log("BgOpacity onDestroy: " + BgNode.count);
        }
    },
    statics: {
        count: 0
    }
});
