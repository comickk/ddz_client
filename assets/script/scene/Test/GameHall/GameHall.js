var ObserverMgr = require("ObserverMgr");
var Observer = require("Observer");
var Utils = require("Utils");
var HallNet = require('HallNet');
var GameHallStorage = require('GameHallStorage');

cc.Class({
    extends: Observer,

    properties: {
        loginLayer: {default: null, displayName: "登录界面", type: cc.Prefab},
        chatLayer: {default: null, displayName: "聊天界面", type: cc.Prefab},
        addNode: {default: null, displayName: "添加界面", type: cc.Node},

    },

    onLoad: function () {
        this._initMsg();
        this._initNet();
        GameHallStorage.initStorage();
    },
    _initNet(){
        HallNet.init();
    },
    _onMsg(msg, data){
        if (msg == GameHallNetMsg.recv.Login.msg) {
            this._addChatLayer();
        } else if (msg == GameLocalMsg.SOCKET.OPEN) {
            this._addLoginLayer();
        }
    },
    _getMsgList(){
        return [
            GameHallLocalMsg.OnClickLogin,
            GameHallNetMsg.recv.Login.msg,
            GameLocalMsg.SOCKET.OPEN,
            GameLocalMsg.SOCKET.RECV,
            GameLocalMsg.SOCKET.SEND,
            GameLocalMsg.SOCKET.CLOSE,
        ];
    },
    _addLoginLayer(){
        Utils.destroyChildren(this.addNode);
        var node = cc.instantiate(this.loginLayer);
        this.addNode.addChild(node);
    },
    _addChatLayer(){
        Utils.destroyChildren(this.addNode);
        var node = cc.instantiate(this.chatLayer);
        this.addNode.addChild(node);
    },

});
