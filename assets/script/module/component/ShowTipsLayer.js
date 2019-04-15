cc.Class({
    extends: cc.Component,

    properties: {

        tipsLabel: {default: null, displayName: "提示文字", type: cc.Label},
        bgNode: {default: null, displayName: "背景节点", type: cc.Node},


    },

    onLoad: function () {

    },

    setTips(str){
        this.tipsLabel.string = str;
        var w = this.tipsLabel.node.width;
        var h = this.tipsLabel.node.height;
        this.bgNode.width = w + 140;

        this._runAction();
    },
    _runAction(){
        var moveBy = new cc.MoveBy(0.8, 0, 120);
        moveBy.easing(cc.easeQuadraticActionOut());
        var fadeout = new cc.FadeOut(0.2);
        var callFunc = new cc.CallFunc(function () {
            this.node.destroy();
        }.bind(this));
        var seq = new cc.Sequence([moveBy, fadeout, callFunc]);
        this.node.runAction(seq);
    }
});
