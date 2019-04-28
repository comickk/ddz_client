var ObserverMgr = require('ObserverMgr');
var Observer = require('Observer');
var NetSocketMgr = require('NetSocketMgr');
var GameData = require('GameData');
var Utils = require('Utils');
var ImgMgr = require('ImgMgr');
var NativeSdk = require('NativeSdk');

cc.Class({
    extends: Observer,

    properties: {
        robotBtn: {default: null, displayName: "托管按钮", type: cc.Node},
        rulesBtn: {default: null, displayName: "规则按钮", type: cc.Node},

        timeLabel: {default: null, displayName: "时间", type: cc.Label},
        signalIcon: {default: null, displayName: "信号icon", type: cc.Sprite},
        wifiSignalArr: [],
        simSignalArr: [],
    },
    _getMsgList(){
        return [
            GameLocalMsg.Play.OnClickCancelRobot,
            GameNetMsg.recv.BeganGame.msg,
            GameNetMsg.recv.ShoutPoker.msg,
            GameLocalMsg.Play.OnGameOver,
            GameLocalMsg.Play.OnTriggerTimeOutPutCard,
            GameNetMsg.recv.ResumeEnterHome.msg,
            GameLocalMsg.Game.OnWinHide,
            GameLocalMsg.SOCKET.Change,

            GameLocalMsg.Play.onPlayerEscape,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnClickCancelRobot) {
            this._showRobotBtn();
        } else if (msg == GameNetMsg.recv.BeganGame.msg) {// 开始游戏,不能托管
            this.robotBtn.active = false;
        } else if (msg == GameNetMsg.recv.ShoutPoker.msg) {// 叫牌才算游戏正式开始,可以托管
            this._showRobotBtn();
        } else if (msg == GameLocalMsg.Play.OnGameOver) {
            this.robotBtn.active = false;
        } else if (msg == GameLocalMsg.Play.OnTriggerTimeOutPutCard) {// 出牌超时处理
            this._onDealTimeOutWithPutCard(data);
        } else if (msg == GameNetMsg.recv.ResumeEnterHome.msg) {// 断线恢复重连
            this._showRobotBtn();
        } else if (msg == GameLocalMsg.Game.OnWinHide) {// 隐藏窗口就托管
            var playState = GameData.roomData.playState;
            if (playState == Poker.GamePlayState.None ||
                playState == Poker.GamePlayState.WaitPlayerJoin ||
                playState == Poker.GamePlayState.SendPoker ||
                playState == Poker.GamePlayState.GameOver ||
                playState == Poker.GamePlayState.ExtractPoker) {
                // 以上阶段不托管
            } else {
                var isRobot = GameData.roomData.selfPlayData.isRobot;
                if (isRobot == false) {
                    this.onClickRobot();
                    GameData.isRobotByHide = true;
                } else {
                    GameData.isRobotByHide = false;
                }
            }
        } else if (msg == GameLocalMsg.Play.onPlayerEscape) { //玩家逃跑
            this.robotBtn.active = false;
        } else if (msg == GameLocalMsg.SOCKET.Change) {
            if (data) {
                this._initSignal();
            }
        }
    },
    _getSignalIcon(type, strength){
        var url = null;
        var wifiArr = {
            "1": "phoneSignal/wifi1",
            "2": "phoneSignal/wifi2",
            "3": "phoneSignal/wifi3",
            "4": "phoneSignal/wifi4",
        };
        var mobileArr = {
            "1": "phoneSignal/4G1",
            "2": "phoneSignal/4G2",
            "3": "phoneSignal/4G3",
            "4": "phoneSignal/4G4",
        };
        if (type == Poker.PhoneSignalType.WiFi) {
            url = wifiArr[strength.toString];
        } else if (type == Poker.PhoneSignalType.Mobile) {
            url = mobileArr[strength.toString()];
        }
        console.log("网络信号图片:" + url.toString());
        return url;
    },
    _initSignal(){

        var netType = NativeSdk.getNetWorkType();
        if (netType == Poker.PhoneSignalType.WiFi || netType == Poker.PhoneSignalType.Mobile) {
            var url = this._getSignalIcon(Poker.PhoneSignalType.Mobile, 4);
            if (url) {
                ImgMgr.setImg(this.signalIcon, url);
            } else {
                console.log("未获取到网络信号图片URL");
            }
        } else {
            console.log("未知的网络类型...");
        }
    },
    _showRobotBtn(){
        this.robotBtn.active = true;
        this.robotBtn.stopAllActions();
        this.robotBtn.scale = 1;
        this.robotBtn.opacity = 255;
    },
    _onDealTimeOutWithPutCard(data){
        //console.log("GameSceneTopUI__onDealTimeOutWithPutCard: " + data);
        if (data >= 2) {// 2次超时,直接托管
            var isRobot = GameData.roomData.selfPlayData.isRobot;
            if (isRobot == false) {
                this.onClickRobot();
            }
        }
    },
    onLoad: function () {
        this._initMsg();
        this._initUI();
        this._setTime();
        this.schedule(this._setTime, 1);
        this._initSignal();
    },
    _setTime(){
        var date = new Date();
        var hour = date.getHours();
        hour = Utils.prefix(hour, 2);
        var min = date.getMinutes();
        min = Utils.prefix(min, 2);
        var sec = date.getSeconds();
        this.timeLabel.string = hour + ":" + min;// + "." + sec;
    },
    _initUI(){
        this.robotBtn.active = false;// 托管按钮默认不显示

        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻
            this.rulesBtn.active = true;
        } else if (roomType == Poker.GameRoomType.Gold) {// 金豆
            this.rulesBtn.active = false;
        }
    },
    onClickShop(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShop, null);
    },
    onClickSet(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickSet, null);
    },
    onClickRules(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRules, null);
    },
    // 托管
    onClickRobot(){
        this.robotBtn.active = false;
        GameData.roomData.selfPlayData.isRobot = true;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        NetSocketMgr.send(GameNetMsg.send.EntrustPlay, 1);// 托管
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRobot, null);
    },
    // 退出房间, 正在游戏的话要托管
    onClickExit(){
        var b = GameData.roomData.selfPlayData.isRobot;
        var isPlaying = false;// 是否正在游戏
        var state = GameData.roomData.playState;
        if (state == Poker.GamePlayState.None ||
            state == Poker.GamePlayState.WaitPlayerJoin) {
            isPlaying = false;
        } else {
            isPlaying = true;
        }
        if (b == false && isPlaying == true) {
            NetSocketMgr.send(GameNetMsg.send.EntrustPlay, 1);// 托管
        }
        NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
    },
});
