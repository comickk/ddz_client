var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var Utils = require("Utils");
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var IconMgr = require('IconMgr');

cc.Class({
    extends: Observer,

    properties: {
        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        beanLabel: {default: null, displayName: "金豆", type: cc.Label},
        uStoneLabel: {default: null, displayName: "U钻", type: cc.Label},
        scoreLabel: {default: null, displayName: "积分", type: cc.Label},
        scoreIcon: {default: null, displayName: "积分Icon", type: cc.Sprite},// 分发积分的时候用到了
        scoreNode: {default: null, displayName: "积分Node", type: cc.Node},
        uStoneNode: {default: null, displayName: "U钻Node", type: cc.Node},

        mulLabel: {default: null, displayName: "倍数", type: cc.Label},

        headIcon: {default: null, displayName: "头像", type: cc.Sprite},

        chatSelectLayer: {default: null, displayName: "聊天选择界面", type: cc.Prefab},
        chatNode: {default: null, displayName: "聊天节点", type: cc.Node},

        mulInfoLayer: {default: null, displayName: "倍数信息界面", type: cc.Prefab},
        mulNode: {default: null, displayName: "倍数节点", type: cc.Node},

        scoreDescLayer: {default: null, displayName: "分数说明界面", type: cc.Prefab},

        uuStoneDescLayer: {default: null, displayName: "U钻说明界面", type: cc.Prefab},
        uuStoneNode: {default: null, displayName: "U钻节点", type: cc.Node},
    },
    _getMsgList(){
        return [
            GameLocalMsg.Com.UpdateMoney,
            GameLocalMsg.Play.OnUpdateMul,
            GameNetMsg.recv.ResumeEnterHome.msg,
            GameNetMsg.recv.BeganGame.msg,
            GameLocalMsg.Play.OnGamePlay,
            GameLocalMsg.Play.OnGameOverContinuePlay,
        ]
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Com.UpdateMoney) {
            this._updateMoney();
        } else if (msg == GameNetMsg.recv.ResumeEnterHome.msg) {
            this._updateMoneyIcon();
            this._updateMoney();
            this._updateMul();
        } else if (msg == GameLocalMsg.Play.OnUpdateMul) {
            this._updateMul();
        } else if (msg == GameNetMsg.recv.BeganGame.msg) {
            this._updateMul();// U钻场需要清零倍数
        } else if (msg == GameLocalMsg.Play.OnGamePlay) {
            this._updateMul();
            this._updateMoney();
        } else if (msg == GameLocalMsg.Play.OnGameOverContinuePlay) {// 继续游戏
            this._updateMul();
        }
    },
    // 更新倍数
    _updateMul(){
        var gamePlayState = GameData.roomData.playState;
        if (gamePlayState == Poker.GamePlayState.None ||
            gamePlayState == Poker.GamePlayState.WaitPlayerJoin) {
            this.mulLabel.string = "0";
        } else {
            var mul = GameDataUtils.getSelfMul();
            this.mulLabel.string = mul.toString();
        }
    },
    _updateMoney(){
        var playerData = GameData.playData;
        console.log("更新金币: " + playerData.gold);
        this.beanLabel.string = Utils.formatNum(playerData.gold);// 金豆

        this.uStoneLabel.string = playerData.gem;// U钻
        this.scoreLabel.string = GameData.roomData.selfPlayData.raceScore;// 积分
    },
    onLoad: function () {
        this._initMsg();
        this._initUI();
    },

    _initUI(){
        var playerData = GameData.playData;
        this.nameLabel.string = playerData.name;

        var head = playerData.image;
        IconMgr.setRoleHead(this.headIcon, head);

        this._updateMoneyIcon();
        this._updateMoney();
        this._updateMul();
    },
    _updateMoneyIcon(){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场
            this.scoreNode.active = true;
        } else if (roomType == Poker.GameRoomType.Gold) {// 金币/金豆
            this.scoreNode.active = false;
            this.uStoneNode.active = false;
        }
    },
    // 点击聊天
    onClickChat(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnExclusionLayer, null);
        var chat = cc.instantiate(this.chatSelectLayer);
        this.chatNode.addChild(chat);
    },
    // 点击倍率信息界面
    onClickMulBtn(touch){
        var node = touch.currentTarget;
        node._touchListener.setSwallowTouches(false);
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnExclusionLayer, null);
        var chat = cc.instantiate(this.mulInfoLayer);
        this.mulNode.addChild(chat);
    },
    // 点击金豆
    onClickGold(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnExclusionLayer, null);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShop, null);
    },
    // 点击积分
    onClickScore(touch){
        var node = touch.currentTarget;
        node._touchListener.setSwallowTouches(false);
        //ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRules, null);
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnExclusionLayer, null);
        var chat = cc.instantiate(this.scoreDescLayer);
        this.scoreNode.addChild(chat);
        var script = chat.getComponent("ShowInfoDlg");
        if (script) {
            script.setContent("U钻比赛场的通用筹码，用于比赛结束判定U钻归属。");
        }

    },
    // 点击U钻
    onClickUStone(touch){
        var node = touch.currentTarget;
        node._touchListener.setSwallowTouches(false);
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnExclusionLayer, null);
        var chat = cc.instantiate(this.uuStoneDescLayer);
        this.uuStoneNode.addChild(chat);
        var script = chat.getComponent("ShowInfoDlg");
        if (script) {
            script.setContent("与UU898网站U钻互通，可95折兑换UU898全站任意商品。");
        }
    },
});
