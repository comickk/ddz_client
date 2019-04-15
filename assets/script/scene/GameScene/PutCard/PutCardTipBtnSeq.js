var GameCfg = require('GameCfg');
cc.Class({
    extends: cc.Component,

    properties: {
        tipBtn: {default: null, displayName: "提示按钮", type: cc.Node},
        noPutBtn: {default: null, displayName: "不出按钮", type: cc.Node},
        putBtn: {default: null, displayName: "出牌按钮", type: cc.Node},

    },

    onLoad: function () {
        // 设置中按钮排列类型  1:出牌按钮在左 2:出牌按钮在右
        var type = GameCfg.btnOrderType;
        if (type == 1) {
            this.putBtn.zIndex = 1;
            this.noPutBtn.zIndex = 2;
            this.tipBtn.zIndex = 3;
        } else if (type == 2) {
            this.noPutBtn.zIndex = 1;
            this.tipBtn.zIndex = 2;
            this.putBtn.zIndex = 3;
        }
    },
});
