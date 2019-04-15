var JsonFileMgr = require('JsonFileMgr');
var GameData = require('GameData');
var NetSocketMgr = require('NetSocketMgr');
var Observer = require('Observer');


cc.Class({
    extends: Observer,

    properties: {
        buyTypeIcon: {default: null, displayName: "购买类型icon", type: cc.Sprite},
        moneyLabel: {default: null, displayName: "价格Label", type: cc.Label},

        buyBtn: {default: null, displayName: "购买按钮", type: cc.Node},
        usingBtn: {default: null, displayName: "使用中", type: cc.Node},
        switchBtn: {default: null, displayName: "切换按钮", type: cc.Node},

        roleID: {default: 0, displayName: "角色ID"},

        lightNode: {default: null, displayName: "光圈", type: cc.Node},

        beanIcon: {default: null, displayName: "金豆icon", type: cc.SpriteFrame},
        stoneIcon: {default: null, displayName: "钻石icon", type: cc.SpriteFrame},


    },

    onLoad: function () {
        this._initMsg();
        this.initRole();
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.SetHead.msg,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.SetHead.msg) {
            // var nowHead = data['img'];
            // var ownHeadArr = data['imgs'];
            // var up = data['up'];
            // var costUp = data['costup'];
            GameData.playData.image = data['img'];
            this._onSwitchSuccess();
        }
    },
    _onSwitchSuccess(){
        this.initRole();

        // todo 如果排行榜数据中有自己,需要强制刷新排行榜数据, 或者从排行榜的本地数据中更新数据
        //console.log("切换头像强制刷新排行榜数据...");
        //GameDataRank.sendGetRankNetMsg();
    },
    _onError(msg, code, data){

    },
    _hideNode(){
        this.buyBtn.active = false;
        this.usingBtn.active = false;
        this.switchBtn.active = false;
        this.lightNode.active = false;
    },
    initRole(){
        this._hideNode();

        var curRoleID = GameData.playData.image;
        if (curRoleID == this.roleID) {// 已经获取
            this.usingBtn.active = true;
            this.lightNode.active = true;
        } else {// 未获取角色
            var roleCfgData = JsonFileMgr.getRoleDataByRoleId(this.roleID);
            if (roleCfgData) {
                var moneyType = roleCfgData['moneyType'];
                var moneyNum = roleCfgData['moneyNum'];
                if (moneyType == Poker.ShopBuyType.Gem) {
                    this.buyBtn.active = true;
                    this.moneyLabel.string = moneyNum.toString();
                    this.buyTypeIcon.spriteFrame = this.stoneIcon;
                    //IconMgr.setImg(this.buyTypeIcon, this.stoneIcon);
                } else if (moneyType == Poker.ShopBuyType.Gold) {
                    this.buyBtn.active = true;
                    this.moneyLabel.string = moneyNum.toString();
                    this.buyTypeIcon.spriteFrame = this.beanIcon;
                    //IconMgr.setImg(this.buyTypeIcon, this.beanIcon);
                } else if (moneyType == Poker.ShopBuyType.None) {// 无需购买
                    this.switchBtn.active = true;
                }
            } else {
                console.log("角色配置数据有问题");
            }
        }
    },

    //切换角色
    onClickSwitch(){
        NetSocketMgr.send(GameNetMsg.send.SetHead, this.roleID);
    },


    // 金币购买
    onClickBuyWithGold(){

    },
    onClickBuyWithGem(){

    },
    onClickGet(){

    },


});
