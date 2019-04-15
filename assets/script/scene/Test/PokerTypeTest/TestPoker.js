var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var CardMap = require("CardMap");
var TestData = require("TestData");
var TestModule = require('TestModule');
var GamePokerType = require('GamePokerType');

cc.Class({
    extends: Observer,

    properties: {


        point: {default: null, displayName: "点数", type: cc.Label},
        suit: {default: null, displayName: "花色", type: cc.Sprite},
        imgSuitArr: {default: [], displayName: "花色图片", type: cc.SpriteFrame},
        _itemData: null,
        _isInDesk: true,// 放在哪里

        norCardNode: {default: null, displayName: "普通牌节点", type: cc.Node},
        bigJokerNode: {default: null, displayName: "大王节点", type: cc.Node},
        smallJokerNode: {default: null, displayName: "小王节点", type: cc.Node},

    },

    onLoad: function () {


    },
    initTestPokerData(data){
        this._isInDesk = true;
        this.norCardNode.active = false;
        this.bigJokerNode.active = false;
        this.smallJokerNode.active = false;

        this._itemData = data;
        var suit = data['suit'];
        var point = data['point'];


        if (suit == GamePokerType.PokerSuit.BigJoker) {
            this.bigJokerNode.active = true;
        } else if (suit == GamePokerType.PokerSuit.SmallJoker) {
            this.smallJokerNode.active = true;
        } else {
            this.norCardNode.active = true;
            this.point.string = point.toString();
            this.suit.spriteFrame = this.imgSuitArr[suit - 1];
        }
    },
    getSuit(){
        if (this._itemData) {
            return this._itemData['suit'];
        }
        return -1;
    },
    getPoint(){
        if (this._itemData) {
            return this._itemData['point'];
        }
        return -1;
    },
    getLocalID(){
        if (this._itemData) {
            return this._itemData['localID'];
        }
        return -1;
    },

    onClickPoker(){
        if (this._isInDesk) {
            this._isInDesk = false;
            ObserverMgr.dispatchMsg(TestModule.TestAddGame, this);
        } else {
            this._isInDesk = true;
            ObserverMgr.dispatchMsg(TestModule.TestAddDesk, this);
        }
    },
    // 提示
    onTip(){
        this.node.y = 10;
        this.node.color = new cc.Color(0x70, 0x69, 0x69);
    },
    unTip(){
        this.node.y = 0;
        this.node.color = new cc.Color(0xFF, 0xFF, 0xFF);
    }
});
