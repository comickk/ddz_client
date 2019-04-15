var Utils = require('Utils');
var GameData = require('GameData');
var IconMgr = require('IconMgr');
var JsonFileMgr = require('JsonFileMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        goldLabel: {default: null, displayName: "金豆", type: cc.Label},
        topWin: {default: null, displayName: "最高连胜", type: cc.Label},
        totalPlayLabel: {default: null, displayName: "总对局数", type: cc.Label},
        winRateLabel: {default: null, displayName: "胜率", type: cc.Label},
        headIcon: {default: null, displayName: "头像", type: cc.Sprite},
        spineRoleNode: {default: null, displayName: "角色放置节点", type: cc.Node},

        changeName: {default: null, displayName: "改变名字", type: cc.Node},
        roleNameLabel: {default: null, displayName: "角色类型名字", type: cc.Label},
    },

    onLoad: function () {
    },

    onClickCloseBtn(){
        this.node.destroy();
    },
    // 显示自己的信息
    initSelfInfo(){
        var playData = GameData.playData;
        var name = playData.name;
        var winNum = playData.winNum;
        var continueNum = playData.continueWinNum;
        var totalNum = playData.totalPlayNum;
        var img = playData.image;
        var gold = playData.gold;
        var winRate = this._getWinRate(winNum, totalNum);
        this._initUI(name, winRate, continueNum, totalNum, img, gold);
    },

    //   --  名字 + | + 胜利局数 + | + 连胜局数 + | + 对局总数 + | + 头像 + | + 形象 + | + 金币
    initUserInfo: function (data) {
        let list = data.split('|');
        var name = decodeURI(list[0]);
        var winNum = list[1];
        var continueNum = list[2];
        var totalNum = list[3];
        var img = list[5];
        var gold = list[6];
        var winRate = this._getWinRate(winNum, totalNum);
        this._initUI(name, winRate, continueNum, totalNum, img, gold);
    },
    _getWinRate(winNum, totalNum){
        var winRate = 0;
        if (totalNum != "0") {
            winRate = winNum / totalNum * 100;
        }
        return winRate;
    },
    _initUI(name, winRate, continueNum, totalNum, head, gold){
        var roleCfgData = JsonFileMgr.getRoleDataByRoleId(head);
        if (roleCfgData && roleCfgData['name']) {
            this.roleNameLabel.string = roleCfgData['name'];
        } else {
            this.roleNameLabel.string = "";
        }
        this.nameLabel.string = name;
        this.goldLabel.string = Utils.formatNum(gold);
        this.topWin.string = continueNum;
        this.totalPlayLabel.string = totalNum;

        // 胜率
        this.winRateLabel.string = winRate.toFixed(1) + '%';

        this.playRoleAnimate(parseInt(head));

        IconMgr.setRoleHead(this.headIcon, head);

        var selfName = GameData.playData.name;
        if (selfName == name) {
            this.changeName.active = true;
        } else {
            this.changeName.active = false;
        }

        this.changeName.active = false;
    },

    playRoleAnimate: function (roleId) {
        var roleData = JsonFileMgr.getRoleDataByRoleId(roleId);
        if (roleData && roleData['spine']) {
            var spine = roleData['spine'];
            cc.loader.loadRes(spine, function (err, prefab) {
                if (!err) {
                    var animate = cc.instantiate(prefab);
                    Utils.destroyChildren(this.spineRoleNode);
                    this.spineRoleNode.addChild(animate);
                    animate.getComponent(sp.Skeleton).setAnimation(0, 'xiuxian', true);
                }
            }.bind(this));
        }
    },
});
