var AudioPlayer = require('AudioPlayer');

cc.Class({
    extends: cc.Component,

    properties: {
        animation: {default: null, displayName: "动画", type: cc.Animation},
        planSound: {default: null, displayName: '飞机声音', type: cc.AudioClip},

    },

    onLoad: function () {
        // fixme 飞机给的声音不对
        AudioPlayer.playEffect(this.planSound, false);
    },
    onPlane(dir){
        var ani = this.animation.play("plane");
        var delayTime = new cc.DelayTime(ani.duration);
        var callFunc = new cc.CallFunc(function (actionNode) {
            actionNode.destroy();
        });
        var seq = new cc.Sequence([delayTime, callFunc]);
        this.node.runAction(seq);
    },

});
