var ObserverMgr = require("ObserverMgr");
var Observer = require("Observer");
var NetSocketMgr = require('NetSocketMgr');
var GameDataUtils = require('GameDataUtils');
cc.Class({
    extends: Observer,

    properties: {
        room1Script: {default: null, displayName: "新手场", type: require("ClassicModeItem")},
        room2Script: {default: null, displayName: "初级场", type: require("ClassicModeItem")},
        room3Script: {default: null, displayName: "中级场", type: require("ClassicModeItem")},
        room4Script: {default: null, displayName: "高级场", type: require("ClassicModeItem")},
        enterRoomLabel: {default: null, displayName: "快速进入房间Label", type: cc.Label},
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.GetSysCfg.msg) {
            // 获取到系统配置文件
        } else if (msg == GameLocalMsg.Com.UpdateMoney) {
            this._updateEnterRoom();
        }
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.GetSysCfg.msg,
            GameLocalMsg.Com.UpdateMoney,
        ];
    },
    onLoad: function () {
        this._initMsg();
        // 索取人数
        NetSocketMgr.send(GameNetMsg.send.UpdateDeskPeople, {});
        this._updateEnterRoom();
    },
    _updateEnterRoom(){
        var enterRoom = GameDataUtils.getCanEnterMaxGoldRoom();
        if (enterRoom) {
            var roomName = GameDataUtils.getGoldRoomName(enterRoom.id);
            this.enterRoomLabel.string = roomName;
        } else {
            this.enterRoomLabel.string = "";
        }
    },
    initData(data){
        // 金币场的数据
        for (var k = 0; k < data.length; k++) {
            var itemData = data[k];
            var roomID = itemData['id'];
            if (roomID == "1") {
                this.room1Script.initData(itemData);
            } else if (roomID == "2") {
                this.room2Script.initData(itemData);
            } else if (roomID == "3") {
                this.room3Script.initData(itemData);
            } else if (roomID == "4") {
                this.room4Script.initData(itemData);
            }
        }
    },


    // 快速开始
    onQuickBegan(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Classic.QuickBegan, null);
    },

});
