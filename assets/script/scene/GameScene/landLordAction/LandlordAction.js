var ObserverMgr = require('ObserverMgr');
var AudioPlayer = require('AudioPlayer');

cc.Class({
    extends: cc.Component,

    properties: {
        landlordSound: {default: null, displayName: '地主声音', type: cc.AudioClip},
        _movePosition: null,
    },

    onLoad: function () {
        AudioPlayer.playEffect(this.landlordSound, false);
    },
    setMovePosition(x, y){
        this._movePosition = new cc.p(x, y);
    },
    _onNodeBeganMove(){
        if (this._movePosition) {
            var x = this._movePosition.x;
            var y = this._movePosition.y;
            var moveTo = new cc.MoveTo(0.5, x, y);
            var callBack = new cc.CallFunc(function () {
                //console.log("move over");
            }, this);
            var seq = new cc.Sequence([moveTo, callBack]);
            this.node.runAction(seq);
        }
    },
    _onActionEnd(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowIdentity, null);
        this.node.destroy();
    },
    onDestroy(){
        //console.log("节点销毁");
    }
});
