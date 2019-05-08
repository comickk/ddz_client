var ObserverMgr = require('ObserverMgr');
var CardMap = require('CardMap');
var JsonFileMgr = require('JsonFileMgr');
var ImgMgr = require('ImgMgr');
var GamePokerType = require('GamePokerType');

cc.Class({
    extends: cc.Component,

    properties: {
        cardNum: {default: null, displayName: "数字", type: cc.Sprite},
        suitIcon: {default: null, displayName: "花色", type: cc.Sprite},

        normalNode: {default: null, displayName: "正常牌型", type: cc.Node},
        bigJokerNode: {default: null, displayName: "大王", type: cc.Node},
        smallJokerNode: {default: null, displayName: "小王", type: cc.Node},
        cardMask: {default: null, displayName: "卡牌遮罩", type: cc.Node},
        cardNode: {default: null, displayName: "卡牌节点", type: cc.Node},

        cardData: {default: null, visible: false},
        cardIndex: 0,
    },

    onLoad: function () {
        this.cardNode.active = false;
        this.cardMask.active = true;
    },
    setIndex(index){
        this.cardIndex = index;
    },
    onClick(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickExtractCard, this.cardIndex);
    },
    setExtractCardID(serverID){
        this.cardNode.active = true;
        this.cardMask.active = false;
        var data = CardMap.getDataByServerID(serverID);
        this.cardData = data;
        if (!data) {
            //console.log("抽到的牌ID有问题: " + serverID);
            return;
        }
        // 设置view
        if (data.suit == GamePokerType.PokerSuit.SmallJoker) {// 小王
            this.normalNode.active = false;
            this.bigJokerNode.active = false;
            this.smallJokerNode.active = true;
        } else if (data.suit == GamePokerType.PokerSuit.BigJoker) {// 大王
            this.normalNode.active = false;
            this.bigJokerNode.active = true;
            this.smallJokerNode.active = false;
        } else {
            this.normalNode.active = true;
            this.bigJokerNode.active = false;
            this.smallJokerNode.active = false;

            // 花色
            this.suitIcon.spriteFrame = null;
            var suitImg = JsonFileMgr.getCardSuitImg(2, data.suit);
            if (suitImg) {
                ImgMgr.setImg(this.suitIcon, suitImg);
            }
            // 数字
            this.cardNum.spriteFrame = null;
            var color = GamePokerType.getPokerSuitColor(data.suit);
            var cardPointImg = JsonFileMgr.getCardPointImg(2, color, data.point);
            if (cardPointImg) {
                ImgMgr.setImg(this.cardNum, cardPointImg);
            }
        }
    },

});
