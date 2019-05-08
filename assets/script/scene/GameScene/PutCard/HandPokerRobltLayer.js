var ObserverMgr = require('ObserverMgr');
var NetSocketMgr = require('NetSocketMgr');
var GameData = require('GameData');

var Observer = require("Observer");

cc.Class({
    extends: Observer,

    properties: {},
    _getMsgList(){
        return [
            GameNetMsg.recv.ReSendPoker.msg,
            GameLocalMsg.Play.OnGamePlay,
            GameLocalMsg.Game.OnWinShow,
            GameLocalMsg.Play.OnClickCancelRobot,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnGamePlay) {
            this._onNetCancelRobot();
        } else if (msg == GameNetMsg.recv.ReSendPoker.msg) {
            this._onNetCancelRobot();
        } else if (msg == GameLocalMsg.Game.OnWinShow) {
            // 要区分是手动robot还是自动robot，以此决定是否cancel robot
            if (GameData.isRobotByHide) {// 是隐藏界面导致的托管游戏
                this._onNetCancelRobot();
            } else {// 隐藏界面之前就是托管, 无需取消托管
                //console.log("[action] 隐藏界面之前就是托管, 无需取消托管");
            }

        } else if (msg == GameLocalMsg.Play.OnClickCancelRobot) {// 当恢复游戏的时候,默认取消托管状态
            this.node.destroy();
        }
    },
    onLoad: function () {
        this._initMsg();
    },
    _onNetCancelRobot(){
        var isRobot = GameData.roomData.selfPlayData.isRobot;
        if (isRobot) {
            this.onCancelRobot();
        }
    },
    // 取消托管
    onCancelRobot(){
        GameData.roomData.selfPlayData.isRobot = false;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        NetSocketMgr.send(GameNetMsg.send.EntrustPlay, 0);// 托管
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickCancelRobot, null);
    },
});


