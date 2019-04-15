var NetSocketMgr = require('NetSocketMgr');
var Observer = require('Observer');
var TestCase = require('GameSceneTestCase');
var GameData = require('GameData');
var ObserverMgr = require('ObserverMgr');
var GameStaticCfg = require("GameStaticCfg");
var IconMgr = require('IconMgr');
var Utils = require('Utils');
var AudioPlayer = require('AudioPlayer');

cc.Class({
    extends: Observer,

    properties: {
        bgSprite: {default: null, displayName: "背景", type: cc.Sprite},
        role1: {default: null, displayName: "角色1", type: require('LuckyPlayer')},
        role2: {default: null, displayName: "角色2", type: require('LuckyPlayer')},
        role3: {default: null, displayName: "角色3", type: require('LuckyPlayer')},
        vsNode2: {default: null, displayName: "第二个vs", type: cc.Node},
        _roleArr: [],
        cardArr: {default: [], displayName: "可抽的牌", visible: false, type: cc.Node},
        _curExtractUser: 0,// 当前抽卡的人

        cardMaskNode: {default: null, displayName: "卡牌遮罩", type: cc.Node},
        extractCard: {default: null, displayName: "抽牌", type: cc.Prefab},
        cardNode: {default: null, displayName: "卡牌添加节点", type: cc.Node},
    },

    onLoad: function () {
        this._initMsg();
        this._createExtractCard();
        // 如果抽卡的时候有人离线, 需要恢复数据
        this._resumeData();
        this._initBg();
        // 也可能收到结束
    },
    _createExtractCard(){
        Utils.destroyChildren(this.cardNode);
        this.cardArr = [];

        for (var i = 1; i <= 13; i++) {
            var card = cc.instantiate(this.extractCard);
            this.cardNode.addChild(card);

            var script = card.getComponent("ExtractCard");
            if (script) {
                script.setIndex(i);
                this.cardArr.push(script);
            }
        }
    },
    _initBg(){
        var sceneIndex = GameData.getUseSceneId();
        IconMgr.setGameBg(this.bgSprite, sceneIndex);
    },
    _resumeData(){
        var extractData = GameData.roomData.extractData;
        this._setUserData(extractData.userArr);
        // 设置抽过牌的人的数据
        for (var k = 0; k < extractData.data.length; k++) {
            var player = extractData.data[k];
            this._showExtractCard(player.pos, player.card);// 抽到的牌销毁
            this._setExtractCardData(player.user, player.card);
        }
        // todo[dataCache] 这块客户端框架已经满足不了需求,需要重新设计缓冲池的概念
        if (extractData.nextUser == 0) {
            var data = require("LuckyCardCacheData").data;
            if (data) {
                ObserverMgr.dispatchMsg(GameNetMsg.recv.GameOver_CompeteMatch.msg, data);
            }
            require("LuckyCardCacheData").data = null;
        } else {
            this._setReadyExtractUser(extractData.nextUser);
        }
    },
    _getMsgList(){
        return [
            GameLocalMsg.Play.OnTimeOverExtractPoker,
            GameNetMsg.recv.ExtractPoker.msg,
            GameNetMsg.recv.TriggerExtractPoker.msg,
            GameLocalMsg.Game.OnWinHide,
            GameLocalMsg.Play.OnClickExtractCard,
            GameNetMsg.recv.GameOver_CompeteMatch.msg
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnTimeOverExtractPoker) {
            if (data == 3) {// 自己抽卡时间到
                var delIndex = 0;
                // 获取第一种可以抽取的牌
                for (var k = 0; k < this.cardArr.length; k++) {
                    var itemCard = this.cardArr[k];
                    if (itemCard) {
                        delIndex = itemCard.cardIndex;
                        break;
                    }
                }
                this._onClickCard(delIndex.toString());
            }
        } else if (msg == GameNetMsg.recv.ExtractPoker.msg) {// 玩家抽牌
            var pos = data.pos;
            var card = data.card;
            var user = data.user;
            var nextUser = data.nt;

            this._showExtractCard(pos, card);// 抽到的牌销毁
            this._setExtractCardData(user, card);
            if (nextUser == 0) {// 抽卡结束

            } else {
                this._setReadyExtractUser(nextUser);
            }
        } else if (msg == GameNetMsg.recv.TriggerExtractPoker.msg) {// 触发抽牌
            this.setData(data);
        } else if (msg == GameLocalMsg.Game.OnWinHide) {// 如果轮到自己随机抽一张牌
            if (this._curExtractUser == 3) {
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerHideEventWithLuckCard, null);
            }
        } else if (msg == GameLocalMsg.Play.OnClickExtractCard) {
            this._onClickCard(data);
        } else if (msg == GameNetMsg.recv.GameOver_CompeteMatch.msg) {// 抽牌结束, 显示结果, 3秒后跳转
            var winner = data['win'];
            for (var k = 0; k < this._roleArr.length; k++) {
                var role = this._roleArr[k];
                var roleID = role._roleID;
                if (winner == roleID) {
                    role.setResult(true);
                } else {
                    role.setResult(false);
                }
            }
            var audioUrl = cc.url.raw("resources/audio/gaizhang.mp3");
            cc.loader.loadRes(audioUrl, function (err, clip) {
                AudioPlayer.playEffect(clip, false);        
            });             
            this.timeOutID = setTimeout(function () {
                console.log("over");
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverShowResultWithExtractPoker, data);
            }, 3000);
        }
    },
    onDestroy(){
        this._super();
        clearTimeout(this.timeOutID);
    },

    _onClickCard(data){
        console.log("选择了第" + data + "张牌...");
        this._stopExtractSelf();
        this.cardMaskNode.active = true;
        var pos = parseInt(data);
        NetSocketMgr.send(GameNetMsg.send.ExtractPoker, {pos: pos});
    },
    setData(data){
        var userArr = data.users.toString().split(',');
        this._setUserData(userArr);

        this._setReadyExtractUser(data.nt);// 要抽牌的人
    },
    // 设置抽牌人的个数
    _setUserData(userArr){
        if (userArr.length == 2) {// 2个人
            this.role3.node.active = false;
            this.vsNode2.active = false;

            this.role1.setData(userArr[0]);
            this.role2.setData(userArr[1]);
            this._roleArr = [this.role1, this.role2];

        } else if (userArr.length == 3) {// 3个人
            this.role1.setData(userArr[0]);
            this.role2.setData(userArr[1]);
            this.role3.setData(userArr[2]);
            this._roleArr = [this.role1, this.role2, this.role3];
        }
    },
    // 设置准备抽卡的人
    _setReadyExtractUser(user){
        this._curExtractUser = user;
        for (var k = 0; k < this._roleArr.length; k++) {
            var role = this._roleArr[k];
            var roleID = role._roleID;
            if (user == roleID) {// 自己抽牌
                role.extractClock();
            } else {
                role.stopExtractClock();
            }
        }

        // 如果抽卡的人是自己,关闭遮罩
        if (user == 3) {
            this.cardMaskNode.active = false;
        } else {
            this.cardMaskNode.active = true;
        }
    },
    _stopExtractSelf(){
        for (var k = 0; k < this._roleArr.length; k++) {
            var role = this._roleArr[k];
            var roleID = role._roleID;
            if (3 == roleID) {// 自己抽牌
                role.stopExtractClock();
            }
        }
    },
    // 抽到位置的牌销毁
    _showExtractCard(pos, card){
        var delCard = this.cardArr[pos - 1];
        if (delCard) {
            delCard.setExtractCardID(card);
            this.cardArr[pos - 1] = null;
            //this.cardArr.splice(pos - 1, 1);
        } else {
            console.log(pos + '位置的牌已经抽过了');
        }
    },
    _setExtractCardData(user, cardID){
        for (var k = 0; k < this._roleArr.length; k++) {
            var role = this._roleArr[k];
            var roleID = role._roleID;
            if (user == roleID) {// 自己抽牌
                role.setCard(cardID);
            }
        }
    },
});
