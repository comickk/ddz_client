var GameData = require('GameData');
var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var Utils = require('Utils');

cc.Class({
    extends: Observer,

    properties: {
        role1: {default: null, displayName: "角色1", type: require('RoleShopItem')},
        role2: {default: null, displayName: "角色2", type: require('RoleShopItem')},
        role3: {default: null, displayName: "角色3", type: require('RoleShopItem')},
        role4: {default: null, displayName: "角色4", type: require('RoleShopItem')},
    },

    onLoad: function () {
        //this._initCfg();
        this._initMsg();
    },
    _getMsgList(){
        return [GameNetMsg.recv.SetHead.msg];
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.SetHead.msg) {
        }
    },

    _initCfg(){
        var cfgArr = [
            {id: 1, type: Poker.ShopBuyType.None, money: 100},
            {id: 2, type: Poker.ShopBuyType.None, money: 200},
            {id: 3, type: Poker.ShopBuyType.None, money: 300},
            {id: 4, type: Poker.ShopBuyType.None, money: 400},
        ];
        for (var k = 0; k < cfgArr.length; k++) {
            this._setRole(cfgArr[k]);
        }
    },
    _onError(msg, code, data){
        if (code == GameErrorMsg.BuyRoleNoMoney) {// 金币不足
            Utils.showOkCancelDlg("提示", "金豆不足, 无法购买, 是否前往充值?",
                function () {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, null);
                }.bind(this),
                function () {
                    console.log("取消了购买角色充值");
                }.bind(this));
        }
    },

    _setRole(data){
        var roleId = data.id;
        var arr = [this.role1, this.role2, this.role3, this.role4];
        for (var k = 0; k < arr.length; k++) {
            var item = arr[k];
            if (item.roleID == roleId) {
                item.initRole(data);
                break;
            }
        }
    },

});
