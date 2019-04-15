var SDK = require("SDK");
var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var Utils = require("Utils");
var NetSocketMgr = require('NetSocketMgr');
var NetHttpMgr = require('NetHttpMgr');
var GamePay = require('GamePay');
var GameStaticCfg = require('GameStaticCfg');

cc.Class({
    extends: Observer,

    properties: {
        pbGoods: {default: null, displayName: "商品Item", type: cc.Prefab},
        pbTipMsg: {default: null, displayName: "提示消息", type: cc.Prefab},
        ensureBuyDlgPre: {default: null, displayName: "确认购买商品Dlg", type: cc.Prefab},
        payingDlgPre: {default: null, displayName: "支付中界面", type: cc.Prefab},

        itemsNode: {default: null, displayName: "物品节点", type: cc.Node},

        tipsNode: {default: null, displayName: "提示节点", type: cc.Node},
        _itemShopData: null,
        _curShopNo: null,
    },
    _getMsgList(){
        return [
            GameLocalMsg.Center.ClickShopItem,
            GameNetMsg.recv.GetShopListInfo.msg,
            GameNetMsg.recv.PayShop.msg,// 支付返回
            GameNetMsg.recv.PaySuccess.msg,// 支付成功
            GameLocalMsg.Com.OnIAPSuccess,// 内购成功
        ]
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Center.ClickShopItem) {
            // 购买商品
            this._onShowBuyDlg(data);
        } else if (msg == GameNetMsg.recv.GetShopListInfo.msg) {
            // 获取到了商品列表信息
            this.initShopItem(data);
        } else if (msg == GameNetMsg.recv.PayShop.msg) {// 返回支付订单号
            //Utils.destroyChildren(this.tipsNode);
            var shopNo = data.no;
            var shopId = data.id;
            this._curShopNo = shopNo;
            // ["10","100000","1000","1","0"]
            // 商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
            GamePay.pay(this._itemShopData, shopNo.toString());
        } else if (msg == GameNetMsg.recv.PaySuccess.msg) {
            //return;
            // todo removePayingMask
            Utils.destroyChildren(this.tipsNode);
            // 支付成功
            var gold = data['getup'];
            //gold = Utils.formatNum(gold);
            var msgNode = cc.instantiate(this.pbTipMsg);
            var script = msgNode.getComponent('TipMsg');
            script.showMsgWithIKnow("提示", "成功充值 " + gold + " 金豆!");
            this.tipsNode.addChild(msgNode);
        } else if (msg == GameLocalMsg.Com.OnIAPSuccess) {
            // 一次只能购买一个商品
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnPayingUpdate, "正在验证支付结果");
            if (this._curShopNo != null) {
                NetSocketMgr.send(GameNetMsg.send.IAPSuccess, {no: this._curShopNo, token: data});
            } else {
                console.log("内购成功，但是没有发现订单号");
            }
        }
    },
    _onNetOpen(){
        var len = this.itemsNode.children.length;
        if (len <= 0) {
            NetSocketMgr.send(GameNetMsg.send.GetShopListInfo, {});
        }
    },
    onLoad: function () {
        this._initMsg();
        // 发送获取商品列表消息
        var platform = GameStaticCfg.getGamePlatform();
        NetSocketMgr.send(GameNetMsg.send.GetShopListInfo, platform);
        //NetHttpMgr.HttpReq('goodslist',GameNetMsg.recv.GetShopListInfo.msg);
    },

    initShopItem: function (data) {
        Utils.destroyChildren(this.itemsNode);
        if (data.list) {
            // 商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
            for (var i = 0; i < data.list.length; i++) {
                var item = cc.instantiate(this.pbGoods);
                var script = item.getComponent("ShopItem");
                if (script) {
                    var itemData = data.list[i].split('|');
                    script.initData(itemData);
                }
                this.itemsNode.addChild(item);
            }
        } else {
            console.log("获取商品列表有误...");
        }
    },

    _onShowBuyDlg(data){
        Utils.destroyChildren(this.tipsNode);
        this._itemShopData = data;
        // 商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
        var gold = data[1];
        var money = data[2] / 100;//人民币单位为分

        var msgNode = cc.instantiate(this.ensureBuyDlgPre);
        var script = msgNode.getComponent('ShopBuyEnsureDlg');
        script.showBuyDlg(
            '确定花费 ' + money + ' 元 购买' + gold + '金豆吗?',
            this._onPayShopItem,
            null,
            this);
        this.tipsNode.addChild(msgNode);
    },
    onClickClose(){
        this.node.destroy();
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.OnClickCloseHomeItemLayer, null);
    },
    // 购买商品
    _onPayShopItem(){
        console.log("购买的商品信息:" + JSON.stringify(this._itemShopData));
        var shopID = this._itemShopData[0];
        var p = GameStaticCfg.getGamePlatform();
        NetSocketMgr.send(GameNetMsg.send.PayShop, {id: shopID, platform: p});
        // todo addPayingMask 只有苹果手机iap支付才添加遮罩
        if (Utils.isApplePlatform()) {
            var layer = cc.instantiate(this.payingDlgPre);
            this.tipsNode.addChild(layer);
        }
    },
});
