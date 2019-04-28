var ObserverMgr = require('ObserverMgr');
var Observer = require('Observer');
var NetSocketMgr = require('NetSocketMgr');
var GameData = require('GameData');
var GameCardMgr = require('GameCardMgr');
var DECK_TYPE = require('Enum').DECK_TYPE;
var CardAlgorithm = require('CardAlgorithm');
var AudioMgr = require('AudioMgr');

cc.Class({
    extends: Observer,

    properties: {
        putCardNode: {default: null, displayName: "接着出牌按钮", type: cc.Node},
        putCardBeganNode: {default: null, displayName: "开头出牌按钮", type: cc.Node},

        noBigNode: {default: null, displayName: "要不起", type: cc.Node},
        showCardNode: {default: null, displayName: "明牌", type: cc.Node},
        doubleNode: {default: null, displayName: "加倍", type: cc.Node},
        robLandlordNode: {default: null, displayName: "抢地主", type: cc.Node},
        shoutLandlordNode: {default: null, displayName: "叫地主", type: cc.Node},

        landlordBeganNode: {default: null, displayName: "地主开始出牌", type: cc.Node},
        landlordShowCardNode: {default: null, displayName: "地主明牌按钮", type: cc.Node},


        clockPrefab: {default: null, displayName: "倒计时闹钟", type: cc.Prefab},
        clockNode: {default: null, displayName: "倒计时闹钟节点", type: cc.Node},

        showCardLabel: {default: null, displayName: "明牌Label", type: cc.Label},
        _showCardMul: 4,
    },

    onLoad: function () {
        this._initMsg();
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnThinkTimeOverSelf) {
            console.log("时间到!");
            this._destroySelf();
        } else if (msg == GameLocalMsg.Play.OnTimeOverRobLand) {
            // 自己抢地主时间到之后默认选择不抢地主
            this.onClickNoRobLandlord();
        } else if (msg == GameLocalMsg.Play.OnTimeOverShoutLand) {
            // 自己叫地主时间到之后默认选择不叫地主
            this.onClickNotShoutLandlord();
        } else if (msg == GameLocalMsg.Play.OnTimeOverDouble) {
            // 自己加倍时间到之后默认选择不加倍
            this.onClickNoDouble();
        } else if (msg == GameLocalMsg.Play.OnTimeOverPutCardWithAfter) {
            // 自己出牌思考时间到,随机选择可以出的牌
            var ret = CardAlgorithm.getTipCard();
            if (ret.length > 0) {
                this.onClickTip();
                this.onClickPutCardAfter();
            } else {
                // 不要
                this._onNoPutCardAction();
            }
        } else if (msg == GameLocalMsg.Play.OnTimeOverPutCardWithBegan) {
            // 2种做法,目前选择第一种
            if (true) {
                // 思考时间到,直接出最小的牌
                GameCardMgr.setAllHandPokerUnSelect();
                GameCardMgr.randomSelectHandPoker();
                //this.onClickPutCardBegan();
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
            } else {
                // 地主开始出牌,思考时间到 选择的牌如果符合牌型就出,否则随机选择一张单子
                var putCardData = GameCardMgr.getSelectHandPokerData();
                var putCardTypeResult = CardAlgorithm.getPokerType(putCardData);
                var putCardType = putCardTypeResult.type;
                if (putCardType == DECK_TYPE.ERROR) {
                    GameCardMgr.setAllHandPokerUnSelect();
                    GameCardMgr.randomSelectHandPoker();
                    //this.onClickPutCardBegan();
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                } else {
                    //this.onClickPutCardBegan();
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                }
            }
        } else if (msg == GameLocalMsg.Play.OnTimeOverPutCardWithNoBig) {
            // 要不起思考时间到
            this._onNoBigAction();
        }

    },
    _getMsgList(){
        return [GameLocalMsg.Play.OnThinkTimeOverSelf,
            GameLocalMsg.Play.OnTimeOverRobLand,
            GameLocalMsg.Play.OnTimeOverShoutLand,
            GameLocalMsg.Play.OnTimeOverDouble,
            GameLocalMsg.Play.OnTimeOverPutCardWithAfter,
            GameLocalMsg.Play.OnTimeOverPutCardWithBegan,
            GameLocalMsg.Play.OnTimeOverPutCardWithNoBig,
        ];
    },
    _initClock(time, msg){
        var node = cc.instantiate(this.clockPrefab);
        this.clockNode.addChild(node);

        var script = node.getComponent('Clock');
        if (script) {
            script.setTimer(time, msg);
        }
    },
    setBtnByState(state, time, msg){
        this._initClock(time, msg);
        this.putCardNode.active = false;
        this.putCardBeganNode.active = false;
        this.noBigNode.active = false;
        this.showCardNode.active = false;
        this.doubleNode.active = false;
        this.robLandlordNode.active = false;
        this.shoutLandlordNode.active = false;
        this.landlordBeganNode.active = false;

        if (state == Poker.GamePlayState.RobLandlord) {
            this.robLandlordNode.active = true;
        } else if (state == Poker.GamePlayState.DoubleStage) {
            this.doubleNode.active = true;
        } else if (state == Poker.GamePlayState.PutPokerWithAfter) {
            this.putCardNode.active = true;
        } else if (state == Poker.GamePlayState.PutPokerWithNoBig) {
            this.noBigNode.active = true;
        } else if (state == Poker.GamePlayState.SelectShowCard) {
            this.showCardNode.active = true;
        } else if (state == Poker.GamePlayState.ShoutLandLord) {
            this.shoutLandlordNode.active = true;
        } else if (state == Poker.GamePlayState.PutPokerWithBegan) {
            this.putCardBeganNode.active = true;
        } else if (state == Poker.GamePlayState.PutPokerWithLandlordBegan) {
            // 这里还要判断明牌
            this.landlordBeganNode.active = true;

            // 如果地主第一次出牌,自己已经明牌了就不需要显示明牌按钮
            if (GameData.roomData.selfPlayData.isShowCard) {
                this.landlordShowCardNode.active = false;
            } else {
                this.landlordShowCardNode.active = true;
            }
        }
    },
    _updateMul(){
        this._showCardMul--;
        this.showCardLabel.string = "明牌x" + this._showCardMul;

        if (this._showCardMul <= 2) {
            // 结束倒计时
            this.unschedule(this._updateMul);
            this.showCardLabel.string = "";
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTimeOverWithShowCard, null);
            this._destroySelf();
        }
    },
    showSelectShowCardBtn(){
        this.putCardNode.active = false;
        this.noBigNode.active = false;
        this.showCardNode.active = true;
        this.doubleNode.active = false;
        this.robLandlordNode.active = false;
        this.shoutLandlordNode.active = false;
        this.landlordBeganNode.active = false;

        // 明牌开始倍率变化
        this._showCardMul = 4;
        this.showCardLabel.string = "明牌x" + this._showCardMul;
        this.schedule(this._updateMul, 1.3, 2, 0);
    },
    _destroySelf(){
        this.node.destroy();
    },
    // 接着上家的牌出
    onClickPutCardAfter(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardAfter);
        // 这里没有destroy的原因是: 如果牌出出去了,会再次destroy, 因为可能选择的牌不符合任何牌型
        //this._destroySelf();
    },
    // 地主开始出牌
    onClickPutCardBegan(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
        // 这里没有destroy的原因是: 如果牌出出去了,会再次destroy, 因为可能选择的牌不符合任何牌型
        //this._destroySelf();
    },
    // 提示
    onClickTip(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickTipPutCard);
    },
    // 不出
    onClickNoPutCard(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        this._onNoPutCardAction();
    },
    _onNoPutCardAction(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.NoPut);

        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickNotPutCard);
        GameCardMgr.setAllHandPokerUnSelect();// 手牌降下去
        NetSocketMgr.send(GameNetMsg.send.PutPoker, []);
        this._destroySelf();
    },
    // 要不起
    onClickNoBig(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);
        this._onNoBigAction();
    },
    _onNoBigAction(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.NoBig);

        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickNoBig);
        GameCardMgr.setAllHandPokerUnSelect();// 手牌降下去
        NetSocketMgr.send(GameNetMsg.send.PutPoker, []);
        this._destroySelf();

    },
    // 明牌:发牌阶段按钮
    onClickShowCard(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);

        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.ShowCard);


        GameData.roomData.selfPlayData.isShowCard = true;
        NetSocketMgr.send(GameNetMsg.send.DisplayPoker, {"mul": this._showCardMul});
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShowCard);
        
        this._destroySelf();
    },
    // 地主先出牌,明牌按钮
    onClickShowCardLandlordBegan(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResetTimeOutCount, null);

        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.ShowCard);

        this.landlordShowCardNode.active = false;
        GameData.roomData.selfPlayData.isShowCard = true;
        NetSocketMgr.send(GameNetMsg.send.DisplayPoker, {"mul": 2});
    },
    // 不加倍
    onClickNoDouble(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.NoDouble);

        NetSocketMgr.send(GameNetMsg.send.ShoutDouble, 0);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickDouble, Poker.DoubleType.No);////1 不加倍 2 加倍 4 超级加倍
        this._destroySelf();
    },
    // 加倍
    onClickDouble(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.Double);

        NetSocketMgr.send(GameNetMsg.send.ShoutDouble, 1);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickDouble, Poker.DoubleType.Double);////1 不加倍 2 加倍 4 超级加倍
        this._destroySelf();
    },
    // 超级加倍
    onClickSuperDouble(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.SuperDouble);

        NetSocketMgr.send(GameNetMsg.send.ShoutDouble, 2);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickDouble, Poker.DoubleType.Super);////1 不加倍 2 加倍 4 超级加倍
        this._destroySelf();
    },
    // 抢地主
    onClickRobLandlord(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.RobLandlord);

        NetSocketMgr.send(GameNetMsg.send.RobLandlord, 1);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRobLandlord, true);
        this._destroySelf();
    },
    // 不抢地主
    onClickNoRobLandlord(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.NoRobLandlord);

        NetSocketMgr.send(GameNetMsg.send.RobLandlord, 0);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRobLandlord, false);
        this._destroySelf();
    },
    // 叫地主
    onClickShoutLandlord(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.ShoutLandlord);


        NetSocketMgr.send(GameNetMsg.send.ShoutLandlord, 1);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShoutLandlord, true);

        this._destroySelf();
    },
    // 不叫地主
    onClickNotShoutLandlord(){
        var roleID = GameData.playData.image;
        AudioMgr.playActionSound(roleID, Poker.Json.NoShoutLandlord);

        NetSocketMgr.send(GameNetMsg.send.ShoutLandlord, 0);
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShoutLandlord, false);
        this._destroySelf();
    },
});
