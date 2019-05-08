var ToggleMarkUtil = require('ToggleMarkUtil');
var ObserverMgr = require("ObserverMgr");
var GameCfg = require('GameCfg');
var GameLocalStorage = require('GameLocalStorage');
var IconMgr = require('IconMgr');
var Observer = require('Observer');
var Utils = require('Utils');
var GameData = require('GameData');
var JsonFileCfg = require('JsonFileCfg');
var SceneShopModule = require('SceneShopModule');
var JsonFileMgr = require('JsonFileMgr');
var NetSocketMgr = require('NetSocketMgr');

cc.Class({
    extends: Observer,

    properties: {
        bg: {default: null, displayName: "背景", type: cc.Sprite},
        moneyIcon: {default: null, displayName: "金币icon", type: cc.Node},
        moneyLabel: {default: null, displayName: "价格label", type: cc.Label},
        buyBtn: {default: null, displayName: "购买按钮", type: cc.Node},
        usingBtn: {default: null, displayName: "使用中按钮", type: cc.Node},
        freeUseBtn: {default: null, displayName: "免费使用按钮", type: cc.Node},

        leftArrowBtn: {default: null, displayName: "左边按钮", type: cc.Node},
        rightArrowBtn: {default: null, displayName: "右边按钮", type: cc.Node},

        addNode: {default: null, displayName: "添加节点", type: cc.Node},
        itemPre: {default: null, displayName: "item预制体", type: cc.Prefab},

        itemScriptArr: {default: [], visible: false, displayName: "item脚本Arr", type: require("SceneShopItem")},
        _curSelectSceneID: 0,
        selectIndex: 0,

    },
    _getMsgList(){
        return [
            GameNetMsg.recv.SetGameScene.msg,
            SceneShopModule.OnSelectItem,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.SetGameScene.msg) {
            this._updateSelectItemInfo(this._curSelectSceneID);
            this._onChangeBg(data['scene']);

        } else if (msg == SceneShopModule.OnSelectItem) {// 更新价格
            this._curSelectSceneID = data;
            this._updateSelectItemInfo(data);
            this._onChangeBg(data);
            // 更新箭头
            this.selectIndex = this._getIndexInArrBySceneID(data);
            this._updateArrow();

        }
    },
    // 根据sceneID获取在arr里面的位置
    _getIndexInArrBySceneID(sceneID){
        for (var i = 0; i < this.itemScriptArr.length; i++) {
            var itemSceneID = this.itemScriptArr[i].getSceneID();
            if (itemSceneID == sceneID) {
                return i;
            }
        }
        return 0;
    },
    _updateSelectItemInfo(sceneId){
        var curIndex = GameData.getUseSceneId();
        var isUse = curIndex == sceneId;

        this.usingBtn.active = false;
        this.freeUseBtn.active = false;
        this.buyBtn.active = false;

        if (isUse) {
            this.usingBtn.active = true;
        } else {
            var curSceneData = JsonFileMgr.getSceneCfgDataBySceneId(sceneId);
            var moneyType = curSceneData['moneyType'];

            if (moneyType == Poker.ShopBuyType.Gem) {
                this.buyBtn.active = true;                // 设置u钻icon
                this.moneyLabel.string = curSceneData['moneyNum'].toString();
            } else if (moneyType == Poker.ShopBuyType.Gold) {
                this.buyBtn.active = true;                // 设置金豆icon
                this.moneyLabel.string = curSceneData['moneyNum'].toString();
            } else if (moneyType == Poker.ShopBuyType.None) {
                this.freeUseBtn.active = true;            // 免费使用
            }
        }
    },
    _onError(msg, code, data){
        if (code == GameErrorMsg.BuyRoleNoMoney) {// 金币不足
            Utils.showOkCancelDlg("提示", "金豆不足, 无法购买, 是否前往充值?",
                function () {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, {type:1});
                }.bind(this),
                function () {
                    //console.log("取消了购买场景充值");
                }.bind(this));
        }
    },
    onLoad: function () {
        this._initMsg();

        var sceneIndex = GameData.getUseSceneId();
        IconMgr.setGameBg(this.bg, sceneIndex);

        this._initItem();
    },

    //购买场景
    onClickBuy(){
        if (this._curSelectSceneID) {
            //console.log("购买场景信息: " + this._curSelectSceneID);
            //NetSocketMgr.send(GameNetMsg.send.SetGameScene, this._curSelectSceneID);
        }
    },
    //使用场景
    onUseBtn(){
        NetSocketMgr.send(GameNetMsg.send.SetGameScene, this._curSelectSceneID);
    },

    _updateArrow(){
        var max = this.itemScriptArr.length;
        if (this.selectIndex <= 0) {
            this.leftArrowBtn.active = false;
            this.rightArrowBtn.active = true;
            this.selectIndex = 0;
        } else if (this.selectIndex >= max - 1) {
            this.rightArrowBtn.active = false;
            this.leftArrowBtn.active = true;
            this.selectIndex = max - 1;
        } else {
            this.leftArrowBtn.active = true;
            this.rightArrowBtn.active = true;
        }
    },
    _onUpdateClickArrow(){
        var script = this.itemScriptArr[this.selectIndex];
        if (script) {
            script.onClickItem();
        }
    },
    onClickLeftArrow(touch){
        this.selectIndex--;
        this._updateArrow();
        this._onUpdateClickArrow();
    },
    onClickRightArrow(touch){
        this.selectIndex++;
        this._updateArrow();
        this._onUpdateClickArrow();
    },
    //预览背景
    _onChangeBg(sceneId){
        IconMgr.setGameBg(this.bg, sceneId);
    },

    onUseBtn(){
        NetSocketMgr.send(GameNetMsg.send.SetGameScene, this._curSelectSceneID);
    },
    _initItem(){
        this.itemScriptArr = [];
        Utils.destroyChildren(this.addNode);
        var data = JsonFileCfg.file.sceneCfg.data.json;
        //console.log(data);
        for (var k = 0; k < data.length; k++) {
            var item = data[k];
            var sceneId = item['sceneId'];
            this._createItem(sceneId);
        }
        var curSceneId = GameData.getUseSceneId();
        ObserverMgr.dispatchMsg(SceneShopModule.OnSelectItem, curSceneId);
    },
    _createItem(sceneId){
        var item = cc.instantiate(this.itemPre);
        this.addNode.addChild(item);

        var curSceneId = GameData.getUseSceneId();
        var script = item.getComponent("SceneShopItem");
        if (script) {
            this.itemScriptArr.push(script);
            script.setData(sceneId);
            var b = curSceneId == sceneId;
            script._setSelected(b);
            script._setUsing(b);
        }
    },

});
