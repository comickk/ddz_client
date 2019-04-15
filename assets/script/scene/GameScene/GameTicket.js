var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var Utils = require('Utils');
var Observer = require("Observer");
var ObserverMgr = require('ObserverMgr');

cc.Class({
    extends: Observer,

    properties: {
        ticketLabel: {default: null, displayName: "门票", type: cc.Label},
        maxLabel: {default: null, displayName: "输赢封顶", type: cc.Label},

    },
    _getMsgList(){
        return [
            GameLocalMsg.Game.OnUpdateTicketVisible,
            GameNetMsg.recv.BeganGame.msg,
            GameNetMsg.recv.ChangeDesk.msg,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Game.OnUpdateTicketVisible) {
            this._updateVisible(data);
        } else if (msg == GameNetMsg.recv.BeganGame.msg) {
            this._updateVisible(true);
        } else if (msg == GameNetMsg.recv.ChangeDesk.msg) {
            this._updateVisible(true);
        }
    },
    onLoad: function () {
        this._initMsg();
    },
    onUpdate(){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场
            this.node.active = false;
        } else if (roomType == Poker.GameRoomType.Gold) {// 金币/金豆
            //this.node.active = true;
            if (roomData.roomInfo) {
                var max = roomData.roomInfo['maxEarn'];
                var ticket = roomData.roomInfo['ticket'];
                this.ticketLabel.string = Utils.formatNum(ticket);
                this.maxLabel.string = Utils.formatNum(max);
            } else {

            }
        }
    },
    _updateVisible(b){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场
            this.node.active = false;
        } else if (roomType == Poker.GameRoomType.Gold) {// 金币/金豆
            this.node.active = b;
        }
    },
});
