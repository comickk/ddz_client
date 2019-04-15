var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var NetSocketMgr = require('NetSocketMgr');
cc.Class({
    extends: cc.Component,

    properties: {
        textLabel: {default: null, displayName: "聊天文字", type: cc.Label},
        _data: 0,
    },

    onLoad: function () {

    },

    // {id, chatId, sex, mp3, desc}
    initData(data){
        this._data = data;
        this.textLabel.string = data['desc'];
    },
    onClickItem(){
        var chatId = this._data['chatId'];
        ObserverMgr.dispatchMsg(GameLocalMsg.GameScene.OnSelectChatWord, chatId);
        NetSocketMgr.send(GameNetMsg.send.Chat, {id: chatId});
    },
});
