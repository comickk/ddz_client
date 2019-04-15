var ObserverMgr = require('ObserverMgr');
var Observer = require('Observer');
var GameData = require('GameData');
var GameStaticCfg = require("GameStaticCfg");
cc.Class({
    extends: Observer,

    properties: {
        tipsLabel: {default: null, displayName: "提示文字", type: cc.Label},
        titleLabel: {default: null, displayName: "标题文字", type: cc.Label},

        leftPlayer: {default: null, displayName: "左边玩家", type: require('RoundResultItem')},
        rightPlayer: {default: null, displayName: "右边玩家", type: require('RoundResultItem')},
        selfPlayer: {default: null, displayName: "玩家自己", type: require('RoundResultItem')},
        _time: 3,
        _isTriggerExtractPokerFlag: false,// 是否触发抽牌
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.TriggerExtractPoker.msg,
            GameLocalMsg.Game.OnWinHide,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.TriggerExtractPoker.msg) {// 触发了抽牌
            this._isTriggerExtractPokerFlag = true;
            this._setTipLabel();
        } else if (msg == GameLocalMsg.Game.OnWinHide) {// 正在牌局结算挂起了游戏,直接停止倒计时
            console.log("正在结算界面,挂起了游戏");
            this._onTimerOver();
        }
    },
    onLoad: function () {
        this._initMsg();
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResult, Poker.GameOverResult.Deuce);
    },
    setData(data){
        this.titleLabel.string = "第" + GameData.roomData.gemPlayNum + '局比赛结束';
        this._setMatchResult(data);
        this._initResultSound(data);

        if (data['next'] && data['next'] == 1) {// 打牌
            this._isTriggerExtractPokerFlag = false;
        } else if (data['next'] && data['next'] == 2) {// 抽牌
            this._isTriggerExtractPokerFlag = true;
        } else {
            console.log("[error] 抽牌结算数据出现错误!, 没有next数据,或者next数据不对");
            this._isTriggerExtractPokerFlag = false;
        }

        var isShowGame = require('GameReady').isShowGame;
        if (isShowGame) {// 游戏打开,等待倒计时结束
            // 5秒后自动消失
            var time = GameStaticCfg.time.gameOver;
            this._time = time;
            //todo 目前为5s,后期要做任务队列
            this.schedule(this._updateToNextMatch, 1, time - 1);
            this._setTipLabel();

        } else {// 游戏隐藏,直接处理逻辑
            this._time = 2;
            setTimeout(this._onTimerOver.bind(this), 2000);
            this._setTipLabel();
        }
    },

    _initResultSound(data){
        var isWin = GameData.judgeGameIsWin(data.win);
        if (isWin) {
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResult, Poker.GameOverResult.Win);
        } else {
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResult, Poker.GameOverResult.Lose);
        }
    },
    _setMatchResult(data){
        // 自己玩家信息
        var selfData = {
            name: GameData.playData.name,
            curScore: data.reward.u3,
            totalScore: data.u3,
            card: data.s3,
            isLandlord: GameData.roomData.selfPlayData.isLandlord,
        };
        this.selfPlayer.setData(selfData);
        // 左边玩家信息
        var leftData = {
            name: GameData.roomData.leftPlayData.name,
            curScore: data.reward.u1,
            totalScore: data.u1,
            card: data.s1,
            isLandlord: GameData.roomData.leftPlayData.isLandlord,
        };
        this.leftPlayer.setData(leftData);
        // 右边玩家信息
        var rightData = {
            name: GameData.roomData.rightPlayData.name,
            curScore: data.reward.u2,
            totalScore: data.u2,
            isLandlord: GameData.roomData.rightPlayData.isLandlord,
        };
        this.rightPlayer.setData(rightData);
    },
    _updateToNextMatch(time){
        this._time--;
        if (this._time <= 0) {
            this._onTimerOver();
        } else {
            this._setTipLabel();
        }
    },
    _onTimerOver(){
        // 也有可能第二局有人输光积分,然后就结束了牌局
        var num1 = GameData.roomData.gemPlayNum;
        if (num1 == 3 || this._isTriggerExtractPokerFlag) {
            // 抽卡
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowRaceResultOverWithLuckyCard, null);
        } else {
            // 重新发牌
            var data = require('GameNextRaceReadyData').getSendPokerCacheData();// 缓存的数据
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGamePlay, data);
        }
        this.node.destroy();
    },

    _setTipLabel(){
        var num = GameData.roomData.gemPlayNum;
        if (num == 3 || this._isTriggerExtractPokerFlag) {// 如果是第三局,肯定是抽卡决定胜负
            this.tipsLabel.string = this._time + "s后开始抽卡决定胜负";
        } else {
            this.tipsLabel.string = this._time + "s后开始下一局比赛";
        }
    },
});
