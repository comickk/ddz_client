var CardAlgorithm = require("CardAlgorithm");
var DECK_TYPE = require('Enum').DECK_TYPE;
var Observer = require('Observer');
var Util = require("Utils");
var TestData = require("TestData");
var JsonFileMgr = require('JsonFileMgr');
var JsonFileCfg = require('JsonFileCfg');
var AudioMgr = require('AudioMgr');
var CardMap = require('CardMap');
var TestModule = require('TestModule');
var CowCardAlgorithm = require('CowCardAlgorithm');
var CowCardMap = require('CowCardMap');

cc.Class({
    extends: Observer,

    properties: {
        deskNode: {default: null, displayName: "桌子节点", type: cc.Node},

        handGroup: {default: null, displayName: "手牌节点", type: cc.Node},
        _handPokerScriptArr: [],
        gameGroup: {default: null, displayName: "游戏牌节点", type: cc.Node},
        _gamePokerScriptArr: [],

        pokerPrefab: {default: null, displayName: "扑克预制体", type: cc.Prefab},
        msgLabel: {default: null, displayName: "消息", type: cc.Label},
        tipsBtnLabel: {default: null, displayName: "提示按钮label", type: cc.Label},

        _tipsResultArr: null,// 提示结果
        _tipsIndex: 0,// 提示的顺序

        _selectPlace: TestModule.PlaceBase,
    },

    onSelectPlaceHand(){
        this._selectPlace = TestModule.PlaceHand;
    },
    onSelectPlaceBase(){
        this._selectPlace = TestModule.PlaceBase;
    },
    _getMsgList(){
        return [
            TestModule.TestAddGame,
            TestModule.TestAddDesk,
        ];
    },
    _onMsg(msg, data){
        this.msgLabel.string = "";
        if (msg == TestModule.TestAddGame) {
            if (this._selectPlace == TestModule.PlaceBase) {
                this.addGame(data);
            } else if (this._selectPlace == TestModule.PlaceHand) {
                this.addToHand(data);
            }
        } else if (msg == TestModule.TestAddDesk) {
            this.addDesk(data);
        }
    },
    onLoad: function () {
        this._initMsg();
        this.initAllPoker();
        JsonFileCfg.init();
    },
    initAllPoker(){
        //var CardArr = CardMap.map;
        var CardArr = CowCardMap.map;
        for (var i = 0; i < CardArr.length; i++) {
            var itemCard = CardArr[i];
            var point = itemCard['point'];
            var suit = itemCard['suit'];
            var localID = itemCard['localID'];

            var clone = cc.instantiate(this.pokerPrefab);
            this.deskNode.addChild(clone);
            clone.zIndex = localID;
            var script = clone.getComponent("TestPoker");
            if (script) {
                script.initTestPokerData(itemCard);
            }
        }
    },

    addGame(pokerScript){
        var len = this._gamePokerScriptArr.length;
        if (len >= 20) {
            this.msgLabel.string = "不能添加牌了, 最多有20张牌...";
        } else {
            pokerScript.node.x = pokerScript.node.y = 0;
            pokerScript.node.parent = this.gameGroup;
            this._gamePokerScriptArr.push(pokerScript);
        }
    },

    addToHand(pokerScript){
        var len = this._handPokerScriptArr.length;
        if (len >= 20) {
            this.msgLabel.string = "不能添加牌了, 最多有20张牌...";
        } else {
            pokerScript.node.x = pokerScript.node.y = 0;
            pokerScript.node.parent = this.handGroup;
            this._handPokerScriptArr.push(pokerScript);
        }
    },
    addDesk(pokerScript){
        pokerScript.node.parent = this.deskNode;
        Util.removeElementsFromArray(this._handPokerScriptArr, pokerScript);
        Util.removeElementsFromArray(this._gamePokerScriptArr, pokerScript);
    },
    cleanHandPoker(){
        while (this._handPokerScriptArr.length > 0) {
            var len = this._handPokerScriptArr.length;
            this._handPokerScriptArr[len - 1].onClickPoker();
        }
        this.msgLabel.string = "";
    },
    cleanGamePoker(){
        while (this._gamePokerScriptArr.length > 0) {
            var len = this._gamePokerScriptArr.length;
            this._gamePokerScriptArr[len - 1].onClickPoker();
        }
    },

    // 计算牌型
    onTest(){
        var list = [];
        for (var k = 0; k < this._gamePokerScriptArr.length; k++) {
            var itemScript = this._gamePokerScriptArr[k];
            var point = itemScript.getPoint();
            var suit = itemScript.getSuit();
            var localID = itemScript.getLocalID();
            var data = {point: point, localID: localID, suit: suit};
            list.push(data);
        }

        var cardStr = "";
        for (var k = 0; k < list.length; k++) {
            cardStr += list[k].point + ",";
        }
        //console.log("手牌为: " + cardStr);

        if (list.length == 0) {
            this.msgLabel.string = "没有选择牌";
            return;
        }

        var ret = CardAlgorithm.getPokerType(list);
        this._setResult(ret);

        this._onCardSound(ret.type, ret.p);
    },
    _onCardSound(type, point){
        var url = AudioMgr._getAudioUrl(0, type, point);
        if (url) {
            cc.audioEngine.playEffect(url);
        } else {
            //console.log("没找到声音文件" + type);
        }
    },
    _getPokerTypeChinese(type){
        var str = "";
        if (type == DECK_TYPE.ERROR) {
            str += "无效牌";
        } else if (type == DECK_TYPE.SINGL) {
            str += "单张";
        } else if (type == DECK_TYPE.DOUBLE) {
            str += "一对";
        } else if (type == DECK_TYPE.TREBLE) {
            str += "三张";
        } else if (type == DECK_TYPE.TREBLE_ONE) {
            str += "三带一";
        } else if (type == DECK_TYPE.TREBLE_TWO) {
            str += "三带二";
        } else if (type == DECK_TYPE.CONTINUE) {
            str += "顺子";
        } else if (type == DECK_TYPE.DB_CONTINUE) {
            str += "双顺";
        } else if (type == DECK_TYPE.TB_CONTINUE) {
            str += "三顺";
        } else if (type == DECK_TYPE.AIRPLANE_1) {
            str += "二连飞机带翅膀";
        } else if (type == DECK_TYPE.AIRPLANE_2) {
            str += "二连飞机带二对";
        } else if (type == DECK_TYPE.AIRPLANE_3) {
            str += "三连飞机带翅膀";
        } else if (type == DECK_TYPE.AIRPLANE_4) {
            str += "三连飞机带三对";
        } else if (type == DECK_TYPE.AIRPLANE_5) {
            str += "四连飞机带翅膀";
        } else if (type == DECK_TYPE.AIRPLANE_6) {
            str += "四连飞机带四对";
        } else if (type == DECK_TYPE.AIRPLANE_7) {
            str += "五连飞机带翅膀";
        } else if (type == DECK_TYPE.FOUR_TWO) {
            str += "四带二张";
        } else if (type == DECK_TYPE.FOUR_TWO4) {
            str += "四带二对";
        } else if (type == DECK_TYPE.BOMB) {
            str += "炸弹";
        } else if (type == DECK_TYPE.ROCKET) {
            str += "火箭";
        } else {
            str = "严重错误!";
        }
        return str;
    },
    _setResult(tidys){
        this.msgLabel.string = "牌型:" + this._getPokerTypeChinese(tidys.type) + ", 比较值:" + tidys.p;
        //+            "\npeter==> " + this._getPokerTypeChinese(peter);
    },

    onClickCalc(){
        var gameListPoker = [];
        for (var k = 0; k < this._gamePokerScriptArr.length; k++) {
            var itemScript = this._gamePokerScriptArr[k];
            gameListPoker.push(itemScript._itemData);
        }
        if (gameListPoker.length == 5) {
            var result = CowCardAlgorithm.getCow(gameListPoker);
            var cowName = CowCardAlgorithm.getCowTypeName(result.type);
            this.msgLabel.string = cowName;
            this._showTipGamePoker(result.main);
        } else {
            this.msgLabel.string = "不是5张牌,无法判断!";
        }
    },
    _showTipGamePoker(showList){
        for (var script = 0; script < this._gamePokerScriptArr.length; script++) {
            this._gamePokerScriptArr[script].unTip();
        }

        for (var i = 0; i < showList.length; i++) {
            var itemPoker = showList[i];// 每一个牌
            var itemPoint = itemPoker.point;
            var itemSuit = itemPoker.suit;
            // 找到那张牌提示一下
            for (var k = 0; k < this._gamePokerScriptArr.length; k++) {
                var itemScript = this._gamePokerScriptArr[k];
                var point = itemScript.getPoint();
                var suit = itemScript.getSuit();
                if (itemPoint == point && itemSuit == suit) {
                    itemScript.onTip();
                }
            }
        }
    },
    // 提示
    onTips(){

        this.onTest();

        // 先计算提示结果
        if (this._tipsResultArr == null) {
        }
        // 游戏出的牌
        var gameListPoker = [];
        for (var k = 0; k < this._gamePokerScriptArr.length; k++) {
            var itemScript = this._gamePokerScriptArr[k];
            //var point = itemScript.getPoint();
            //var suit = itemScript.getSuit();
            gameListPoker.push(itemScript._itemData);
        }

        // 自己的手牌
        var selfListPoker = [];
        for (var k = 0; k < this._handPokerScriptArr.length; k++) {
            var itemScript = this._handPokerScriptArr[k];
            //var point = itemScript.getPoint();
            //var suit = itemScript.getSuit();
            selfListPoker.push(itemScript._itemData);
        }

        // resultArr [[],[]]// 每一条结果都是一个arr,比如[[3,3,3,4],[6,6,6,4]]
        this._tipsResultArr = CardAlgorithm.calcPutPoker(gameListPoker, selfListPoker);

        if (this._tipsResultArr && this._tipsResultArr.length > 0) {
            this.tipsBtnLabel.string = "提示(" + (this._tipsIndex + 1) + "/" + this._tipsResultArr.length + ")";
            // 计算提示哪一条
            var tipArr = this._tipsResultArr[this._tipsIndex];
            this._showTipsPoker(tipArr);
            this._tipsIndex++;
            if (this._tipsIndex >= this._tipsResultArr.length) {
                this._tipsIndex = 0;
            }
        } else {
            this.tipsBtnLabel.string = "提示(0/0)";
        }
    },
    unAllTips(){
        for (var script = 0; script < this._handPokerScriptArr.length; script++) {
            this._handPokerScriptArr[script].unTip();
        }
    },
    // 提示poker
    _showTipsPoker(showList){
        this.unAllTips();

        for (var i = 0; i < showList.length; i++) {
            var itemPoker = showList[i];// 每一个牌
            var itemPoint = itemPoker.point;
            var itemSuit = itemPoker.suit;
            // 找到那张牌提示一下
            for (var k = 0; k < this._handPokerScriptArr.length; k++) {
                var itemScript = this._handPokerScriptArr[k];
                var point = itemScript.getPoint();
                var suit = itemScript.getSuit();
                if (itemPoint == point && itemSuit == suit) {
                    itemScript.onTip();
                }
            }
        }
    },
});
