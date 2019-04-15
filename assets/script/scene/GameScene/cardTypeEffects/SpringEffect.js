cc.Class({
    extends: cc.Component,

    properties: {
        animation: {default: null, displayName: "动画", type: cc.Animation},

    },

    onLoad: function () {

    },
    onSpring(dir){
        var ani = this.animation.play("spring");
        var delayTime = new cc.DelayTime(ani.duration);
        var callFunc = new cc.CallFunc(function (actionNode) {
            actionNode.destroy();
        });
        var seq = new cc.Sequence([delayTime, callFunc]);
        this.node.runAction(seq);
    },
});
