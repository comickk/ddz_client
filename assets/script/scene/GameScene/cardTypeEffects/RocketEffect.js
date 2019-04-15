var AudioPlayer = require('AudioPlayer');

cc.Class({
    extends: cc.Component,

    properties: {
        animation: {default: null, displayName: "动画", type: cc.Animation},
        rocketBeganSound: {default: null, displayName: '火箭起飞声音', type: cc.AudioClip},

    },

    onLoad: function () {
        // fixme 火箭给的声音不对
        AudioPlayer.playEffect(this.rocketBeganSound, false);
    },
    onRocket(dir){
        var ani = this.animation.play("rocketNew");
        var delayTime = new cc.DelayTime(ani.duration);
        var callFunc = new cc.CallFunc(function (actionNode) {
            actionNode.destroy();
        });
        var seq = new cc.Sequence([delayTime, callFunc]);
        this.node.runAction(seq);
    },


});
