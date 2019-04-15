var ObserverMgr = require("ObserverMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        winLabel: {default: null, displayName: "赢取Label", type: cc.Label},
        _data: null,

    },

    onLoad: function () {

    },
    initData(data){
        this._data = data;
        var stoneNum = data['gem'];
        this.winLabel.string = "赢" + stoneNum + "U钻场";
    },
    onClick(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Race.ChallengeHeightMatch, this._data);
    }
});
