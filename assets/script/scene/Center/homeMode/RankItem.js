var ObserverMgr = require("ObserverMgr");
var IconMgr = require('IconMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        userName: {default: null, displayName: "用户名", type: cc.Label},
        winLabel: {default: null, displayName: "胜局", type: cc.Label},
        continueWinLabel: {default: null, displayName: "连胜", type: cc.Label},
        rankLabel: {default: null, displayName: "排名", type: cc.Label},
        icon: {default: null, displayName: "用户头像", type: cc.Sprite},
        rankIcon: {default: null, displayName: "排行Icon", type: cc.Sprite},

        _rankData: null,
    },

    // use this for initialization
    onLoad: function () {

    },
    initData(data){
        this._rankData = data;
        var dataArr = data.split('|');
        //   名字 |  胜局  | 连胜  |  3   |  4  | 头像
        // 名字
        var name = decodeURI(dataArr[0])
        if (name.length > 6) {
            name = name.substr(0, 6) + "...";
        }
        this.userName.string = name;

        // 胜局
        var win = dataArr[1].toString();
        this.winLabel.string = "胜局" + win;

        // 连胜
        var continueWin = dataArr[2].toString();
        this.continueWinLabel.string = continueWin + "连胜";

        // 头像
        var roleHeadId = decodeURI(dataArr[5]).toString();
        IconMgr.setRoleHead(this.icon, roleHeadId);
    },
    // 排名
    setRank(i){
        if (i < 3) {
            IconMgr.setRankIcon(this.rankIcon, i);
            this.rankLabel.node.active = false;
        } else {
            this.rankLabel.string = i + 1;
            this.rankIcon.node.active = false;
        }
    },
    onClickRankHead(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Rank.ShowPlayerInfo, this._rankData);
    }


});
