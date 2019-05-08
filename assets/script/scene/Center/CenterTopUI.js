var GameData = require('GameData');
var Observer = require("Observer");
var Utils = require('Utils');
var ObserverMgr = require("ObserverMgr");
var NetSocketMgr = require('NetSocketMgr');
var IconMgr = require('IconMgr');

cc.Class({
    extends: Observer,

    properties: {
        headIcon: {default: null, displayName: "头像", type: cc.Sprite},
        userNameBg: {default: null, displayName: "用户名背景", type: cc.Node},
        userName: {default: null, displayName: "用户名Label", type: cc.Label},
        stoneLabel: {default: null, displayName: "钻石", type: cc.Label},
        beanLabel: {default: null, displayName: "豆", type: cc.Label},
        beanAni: {default: null, displayName: "金豆图标", type: cc.Animation},

        btnHomeBtn: {default: null, displayName: "主页返回按钮", type: cc.Node},
        btnSubBtn: {default: null, displayName: "子页面返回按钮", type: cc.Node},
    },
    _getMsgList(){
        return [
            GameLocalMsg.Com.UpdateMoney,
            GameNetMsg.recv.GetUserInfo.msg,// 获取用户信息
            GameLocalMsg.Center.ShowBeanAni,
            GameLocalMsg.Center.EnterSubLayer,// 进入子页面
            GameNetMsg.recv.SetHead.msg,
        ];
    },
    _onMsg(msg, data){
        switch(msg){
        case GameLocalMsg.Com.UpdateMoney:
            this._updateMoney();
            break;
        case GameNetMsg.recv.GetUserInfo.msg:
            this._updateHeadAndName();
            this._updateMoney();
            break;
        case GameLocalMsg.Center.ShowBeanAni:
            this._runBeanAni();
            break;
        case GameLocalMsg.Center.EnterSubLayer:
            if (data) {
                this.btnHomeBtn.active = false;
                this.btnSubBtn.active = true;
            } else {
                this.btnHomeBtn.active = true;
                this.btnSubBtn.active = false;
            }
            break;
        case GameNetMsg.recv.SetHead.msg:
            this._updateHead();
            break;
        }
    },
    onLoad: function () {
        this._initMsg();
        this._updateMoney();
        this._updateHeadAndName();
    },
    // 金豆的动画
    _runBeanAni(){
        this.beanAni.play("BeanScale");
    },
    _updateHeadAndName(){
        this._updateHead();
        // 名字
        var name = GameData.playData.name;
        if (name && name.length > 6) {
            name = name.substr(0, 6) + '...';
        }
        this.userName.string = name;
        var width = this.userName.node.width;
        this.userNameBg.width = width + 50;
    },
    _updateHead(){
        // 头像
        var head = GameData.playData.image;
        this.headIcon.node.active = true;
        IconMgr.setRoleHead(this.headIcon, head);
    },
    // 更新货币
    _updateMoney(){
        // 豆
        var goldNum = Utils.formatNum(GameData.playData.gold);
        this.beanLabel.string = goldNum;
        // 钻石
        var gemNum = Utils.formatNum(GameData.playData.gem);
        this.stoneLabel.string = gemNum;
    },
    onLogOut(){

    },
    // 点豆去商城
    onClickBean(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, {type:1});
    },
    onClickStone(){
        //刷新钻石
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, {type:2});
        //NetSocketMgr.send(GameNetMsg.send.GetUserInfo, {});
    },
});
