var NetSocketMgr = require('NetSocketMgr');
var ObserverMgr = require('ObserverMgr');
var Observer = require('Observer');
var GameStaticCfg = require("GameStaticCfg");
var GameData = require('GameData');

cc.Class({
    extends: Observer,

    properties: {
        context: {default: null, displayName: "提示label", type: cc.Label},
        _time: 5,
        _str1: "",
        _str2: "",
        _pointNum: 0,
    },
    _getMsgList(){
        return [
            GameLocalMsg.SOCKET.CLOSE,
            GameLocalMsg.Game.OnWinShow,
        ];
    },
    onLoad: function () {
        this._initMsg();
        GameData.isReConnectServer = true;
        NetSocketMgr.reConnect();
        this._onTimeCountDown();
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.SOCKET.CLOSE || GameLocalMsg.Game.OnWinShow) {// 重连失败
            if (this._time > 3) {
                NetSocketMgr.reConnect();
            }
        }
    },
    onClickClose(){
        this.node.destroy();
    },
    _onTimeCountDown(){
        this._time = GameStaticCfg.time.reconnect;
        this._setLabel();
        this.schedule(this._onUpdateLabel, 1, this._time);
        this.schedule(this._onUpdatePointNum, 1);
    },
    _onUpdatePointNum(){
        var arr = [".", "..", "..."];
        this._pointNum++;
        if (this._pointNum >= arr.length) {
            this._pointNum = 0;
        }
        this._str2 = arr[this._pointNum];
        this._setLabel();
    },
    _onUpdateLabel(){
        this._time--;
        console.log("网络重新连接倒计时: " + this._time);
        this._setLabel();
        if (this._time <= 0) {
            this.unschedule(this._onUpdateLabel);
            this.unschedule(this._onUpdatePointNum);
            ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnReconnectFailed, null);
        }
    },
    _setLabel(){
        //this._str1 = "网络不稳定,正在努力加载中(" + this._time + "s)";
        this._str1 = "正在连接移动网络";
        this.context.string = this._str1 + this._str2;
    },

    onDestroy(){
        GameData.isReConnectServer = false;
    }
});
