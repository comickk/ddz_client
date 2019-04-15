var GameCfg = require('GameCfg');
var GameData = require('GameData');
var NetSocketMgr = require('NetSocketMgr');

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function () {


    },
    onClickBeganGame(){
        var data = {vc: 0, room: GameData.roomData.roomID};
        NetSocketMgr.send(GameNetMsg.send.BeganGame, data);
        this.node.destroy();
    },
});
