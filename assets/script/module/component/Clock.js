var ObserverMgr = require("ObserverMgr");
var Observer = require('Observer');

cc.Class({
    extends: Observer,

    properties: {
        timeLabel: {default: null, displayName: "时间", type: cc.Label},
        _curTime: 0,
        _dispatchMsg: null,//时间到派发的事件
        _dispatchData: null,// 派发数据
    },

    _getMsgList(){
        return [
            GameLocalMsg.Play.OnClickRobot,
            GameLocalMsg.Play.OnTriggerHideEventWithLuckCard,
            GameLocalMsg.Play.OnTriggerSlidePutCard,
            GameLocalMsg.Game.OnWinHide,
            GameNetMsg.send.EntrustPlay.msg,// 发送托管消息
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnClickRobot) {// 正在倒计时,触发了托管
            this._onTimerComplete();
        } else if (msg == GameNetMsg.send.EntrustPlay.msg) {// 发送托管消息
            this._onTimerComplete();
        } else if (msg == GameLocalMsg.Play.OnTriggerHideEventWithLuckCard) {// 抽卡界面,自己倒计时抽卡
            this._onTimerComplete();
        } else if (msg == GameLocalMsg.Play.OnTriggerSlidePutCard) {// 滑动出牌的时候仅仅派发定时器身上的事件
            if (this._dispatchMsg) {
                ObserverMgr.dispatchMsg(this._dispatchMsg, this._dispatchData);
            }
        } else if (msg == GameLocalMsg.Game.OnWinHide) {// 进入了后台
            if (this._dispatchMsg) {
                ObserverMgr.dispatchMsg(this._dispatchMsg, this._dispatchData);
            }
        }
    },
    onLoad: function () {
        this._initMsg();
    },
    setTimer(time, msg, data){
        this._dispatchMsg = msg;
        this._dispatchData = data;
        this._curTime = time;
        this.timeLabel.string = this._curTime.toString();

        var isShowGame = require('GameReady').isShowGame;
        if (isShowGame) {
            this.schedule(this._onTimer, 1, time);
        } else {
            if (this._dispatchMsg) {
                ObserverMgr.dispatchMsg(this._dispatchMsg, this._dispatchData);
            }
        }
    },
    _onTimer(){
        this._curTime--;
        this.timeLabel.string = this._curTime.toString();

        //console.log("msg: " + this._dispatchMsg + ", time:" + this._curTime);
        if (this._curTime == 0) {
            // 定时器完毕
            this.unschedule(this._onTimer);
            this._onTimerComplete();
        }
    },
    // 定时器结束
    _onTimerComplete(){
        this.unschedule(this._onTimer);
        // 定时器结束,把自身的事件全部注销掉
        // fixbug 定时器结束=>超时2次=>托管(OnClickRobot事件会触发再次这个函数,造成重连的bug)=>托管逻辑
        ObserverMgr.removeEventListenerWithObject(this);

        // 定时器完毕
        ObserverMgr.dispatchMsg(Poker.Event.TimerComplete, this._dispatchMsg);
        // 派发定时器身上的消息
        if (this._dispatchMsg) {
            ObserverMgr.dispatchMsg(this._dispatchMsg, this._dispatchData);
        }
        this.node.destroy();
    },
});
