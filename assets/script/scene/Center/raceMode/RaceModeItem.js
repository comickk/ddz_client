var ObserverMgr = require("ObserverMgr");
var NetSocketMgr = require('NetSocketMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        icons: {default: [], displayName: "IconArr", type: cc.Sprite},
        howMoney: {default: null, displayName: "钻场", type: cc.Label},
        applyMoney: {default: null, displayName: "报名费用", type: cc.Label},
        _homeData: null,
    },

    onLoad: function () {

    },
    initData(data){
        for (var i = 0; i < this.icons.length; i++) {
            var item = this.icons[i];
            item.node.active = false;
        }
        // 数据格式
        var gemAdvDataFormat = {
            "id": "15",//房间id
            "underPoint": "40",// 底分
            "initMul": "15",//倍率
            "gem": "44",//可赢钻石
            "ticket": "17000",//入场金币
            "gamePoint": "5000"//金币购买的积分数量
        };
        this._homeData = data;
        this.howMoney.string = "赢" + data['gem'] + "U钻场";// 可赢钻石
        this.applyMoney.string = data['ticket'];// 入场券
        // 设置icon
        var showIconArr = {
            11: this.icons[0],
            12: this.icons[1],
            13: this.icons[2],
            14: this.icons[2],
            15: this.icons[2],
            16: this.icons[2],
            17: this.icons[2],
            18: this.icons[2],
            19: this.icons[2],
        }
        var showIcon = showIconArr[data['id']];
        if (showIcon) {
            showIcon.node.active = true;
        } else {
            this.icons[2].node.active = true;
        }
    },

    // 报名
    onClickApply(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Race.Apply, this._homeData);
        //NetSocketMgr.send(GameNetMsg.send.EnterHome, {room: this._homeData.id})
    },
});
