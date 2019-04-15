var DECK_TYPE = require('Enum').DECK_TYPE;
var ObserverMgr = require('ObserverMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        animation: {default: null, displayName: "动画", type: cc.Animation},
    },

    onLoad: function () {

    },
    playCardEffect(type, userID){
        var aniStr = null;
        if (type == DECK_TYPE.CONTINUE) {// 顺子
            aniStr = "continue";
        } else if (type == DECK_TYPE.DB_CONTINUE) {// 双顺
            aniStr = "doubleCt";
        } else if (type == DECK_TYPE.TB_CONTINUE) {// 三顺(三顺就是飞机,腾讯是这么定义)
            aniStr = "tbCt";
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerPlane, userID);
        } else if (type == DECK_TYPE.FOUR_TWO || type == DECK_TYPE.FOUR_TWO4) {// 四带二
            aniStr = "fourTwo";
        } else if (type == DECK_TYPE.AIRPLANE_1 ||// 飞机带翅膀 = 三顺 + 翅膀
            type == DECK_TYPE.AIRPLANE_2 ||
            type == DECK_TYPE.AIRPLANE_3 ||
            type == DECK_TYPE.AIRPLANE_4 ||
            type == DECK_TYPE.AIRPLANE_5 ||
            type == DECK_TYPE.AIRPLANE_6 ||
            type == DECK_TYPE.AIRPLANE_7) {
            //飞机
            aniStr = "planeText";
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerPlane, userID);
        }

        if (aniStr) {
            var ani = this.animation.play(aniStr);
            var delayTime = new cc.DelayTime(ani.duration);
            var callFunc = new cc.CallFunc(function (actionNode) {
                actionNode.destroy();
            });
            var seq = new cc.Sequence([delayTime, callFunc]);
            this.node.runAction(seq);
        }
    },
    onDestroy(){
        //console.log("牌型说明销毁");
    }
});
