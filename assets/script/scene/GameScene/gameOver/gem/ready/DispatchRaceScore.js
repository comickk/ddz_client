var ObserverMgr = require('ObserverMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        leftScore: {default: null, displayName: "左边", type: cc.Node},
        rightScore: {default: null, displayName: "右边", type: cc.Node},
        selfScore: {default: null, displayName: "自己", type: cc.Node},

    },

    onLoad: function () {

    },
    dispatchScore(leftNode, rightNode, selfNode){
        this._scoreMove(leftNode, this.leftScore, false);
        this._scoreMove(rightNode, this.rightScore, false);
        this._scoreMove(selfNode, this.selfScore, true);
    },
    _scoreMove(targetNode, moveNode, isDisMsg){
        var wordPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        var curPos = moveNode.parent.convertToNodeSpaceAR(wordPos);
        var moveTo = new cc.MoveTo(1.2, curPos.x, curPos.y);
        var fade = new cc.FadeOut(0.2);
        var callFunc = new cc.CallFunc(function () {
            if (isDisMsg) {// 派发移动完毕事件
                this.node.destroy();
                // 得到U钻场初始比赛积分
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGetRaceInitScore, null);
            }
        }, this);
        var seq = new cc.Sequence([moveTo, fade, callFunc]);
        moveNode.runAction(seq);
    },

});
