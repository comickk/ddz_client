var CardMap = require('CardMap');
var GamePokerType = require("GamePokerType");
var ImgMgr = require('ImgMgr');
var JsonFileMgr = require('JsonFileMgr');


cc.Class({
    extends: cc.Component,

    properties: {
        landlordIcon: {default: null, displayName: "地主标识", type: cc.Node},

        cardNum: {default: null, displayName: "数字", type: cc.Sprite},
        suitIcon: {default: null, displayName: "花色", type: cc.Sprite},

        normalNode: {default: null, displayName: "正常牌型", type: cc.Node},
        bigJokerNode: {default: null, displayName: "大王", type: cc.Node},
        smallJokerNode: {default: null, displayName: "小王", type: cc.Node},

        cardData: {default: null, visible: false},
    },

    onLoad: function () {
        //this.normalNode.active = false;
        //this.bigJokerNode.active = false;
        //this.smallJokerNode.active = false;
    },
    setServerCardID(serverID){
        var data = CardMap.getDataByServerID(serverID);
        this.cardData = data;
        if (!data) {
            console.log("出错的卡牌ID: " + serverID);
        }
        // 设置localIndex,方便自动排序, 明牌的时候是从大到小排序
        this.node.setLocalZOrder(100 - data.localID);

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
        this.landlordIcon.active = false;
    },
    setCardIsLandlord(isLandlord){
        this.landlordIcon.active = isLandlord;
    }
});
