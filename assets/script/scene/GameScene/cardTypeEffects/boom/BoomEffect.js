var AudioPlayer = require('AudioPlayer');

cc.Class({
    extends: cc.Component,

    properties: {

        animation: {default: null, displayName: "炸弹动画节点", type: cc.Animation},
        boomSound: {default: null, displayName: '炸弹声音', type: cc.AudioClip},
        boomPre: {default: null, displayName: "爆炸特效", type: cc.Prefab},
    },

    onLoad: function () {

    },
    onPlayBoomSound(){
        //console.log("PlayBoomSound");
        AudioPlayer.playEffect(this.boomSound, false);
    },
    // 1 左边 2 右边 3 中间
    onBoomWithDirection(dir){
        var aniStr = null;
        if (dir == 1) {
            aniStr = "bombLeftNew";
        } else if (dir == 2) {
            aniStr = "bombRightNew";
        } else if (dir == 3) {
            aniStr = "bombSelfNew";
        }
        if (aniStr) {
            var ani = this.animation.play(aniStr);
            var delayTime = new cc.DelayTime(ani.duration);
            var callFunc = new cc.CallFunc(function (actionNode) {
                //actionNode.destroy();
                this._addBoom();
            }.bind(this));
            var seq = new cc.Sequence([delayTime, callFunc]);
            this.node.runAction(seq);
        }
    },
    _addBoom(){
        var boom = cc.instantiate(this.boomPre);
        this.node.addChild(boom);

        var animation = boom.getComponent(cc.Animation);
        if (animation) {
            var ani = animation.play("boom");
            var delayTime = new cc.DelayTime(ani.duration / ani.speed);
            var callFunc = new cc.CallFunc(function () {
                this.node.destroy();
            }.bind(this));
            var seq = new cc.Sequence([delayTime, callFunc]);
            boom.runAction(seq);
        }
    },
    onDestroy(){
        //console.log("牌型说明销毁*****");
    }
});
