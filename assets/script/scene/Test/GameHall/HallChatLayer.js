var NetHall = require('HallNet');
var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');

cc.Class({
    extends: Observer,

    properties: {
        word: {default: null, displayName: "输入框", type: cc.EditBox},
        contentNode: {default: null, displayName: "添加节点", type: cc.Node},
        talkItemPrefab: {default: null, displayName: "聊天item", type: cc.Prefab},
    },

    onLoad: function () {
        this._initMsg();
    },
    _getMsgList(){
        return [GameHallNetMsg.recv.Chat.msg]
    },
    _onMsg(msg, data){
        if (msg == GameHallNetMsg.recv.Chat.msg) {
            var node = cc.instantiate(this.talkItemPrefab);
            this.contentNode.addChild(node);

            var script = node.getComponent("ChatItem");
            if (script) {
                var word = data['word'];
                var user = data['user'];
                script.setWord(user, word);
            }
        }
    },
    onClickSay(){
        var word = this.word.string;
        NetHall.send(GameHallNetMsg.send.Chat, {word: word});
    }

});
