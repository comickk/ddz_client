var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var Utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {
        hot: {default: null, displayName: "热卖", type: cc.Node},
        goodsIcon: {default: null, displayName: "商品图标", type: cc.Sprite},
        gold: {default: null, displayName: "金豆", type: cc.Label},
        presentLabel: {default: null, displayName: "多送Label", type: cc.Label},
        presentNode: {default: null, displayName: "多送Node", type: cc.Node},
        moneyLabel: {default: null, displayName: "人民币", type: cc.Label},
        _data: null,
        iconList: {default: [], displayName: "图标", type: cc.SpriteFrame},
    },

    onLoad: function () {

    },
    initData(data){
        this._data = data;
        //商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
        // 商品icon
        var id = data[0];
        var spriteFrame = this.iconList[5];
        if (id == 10 || id == 50)spriteFrame = this.iconList[0];
        if (id == 11 || id == 51)spriteFrame = this.iconList[1];
        if (id == 12 || id == 52)spriteFrame = this.iconList[2];
        if (id == 13 || id == 53)spriteFrame = this.iconList[3];
        if (id == 14 || id == 54)spriteFrame = this.iconList[4];
        if (id == 15 || id == 55)spriteFrame = this.iconList[5];
        if (id == 16 || id == 56)spriteFrame = this.iconList[5];

        this.goodsIcon.spriteFrame = spriteFrame;
        // 人民币(单位分)
        var money = data[2] / 100;
        this.moneyLabel.string = money.toString();
        // 是否热卖
        var isHot = data[3];
        this.hot.active = isHot == 1 ? true : false;
        // 金豆
        var gold = data[1];
        var formatGold = Utils.formatNum(gold);
        this.gold.string = gold + "金豆";
        // 多送
        var present = data[4];
        this.presentNode.active = present > 0 ? true : false;
        this.presentLabel.string = '多送' + present + '%';
    },
    onClick(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.ClickShopItem, this._data);
    },


});
