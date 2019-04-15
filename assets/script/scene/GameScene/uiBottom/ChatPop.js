var JsonFileMgr = require('JsonFileMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        chatBg: {default: null, displayName: "聊天背景", type: cc.Node},
        chatWord: {default: null, displayName: "聊天语句", type: cc.Label},

    },

    onLoad: function () {

    },
    setChatWord(people, chatId, sex){

        if (people == 2) {
            this.chatBg.scaleX = -1;//当是右边的人说话的时候, 翻转一下
            this.chatWord.node.setAnchorPoint(1, 0.5);
            var posX = this.chatWord.node.x;
            this.chatWord.node.x = -posX;
        } else {
            this.chatBg.scaleX = 1;
        }
        var word = JsonFileMgr.getChatDesc(chatId, sex);
        if (word) {
            this.chatWord.string = word.toString();
            var w = this.chatWord.node.width;
            this.chatBg.width = w + 80;

            var left = 28;
            var anchorX = left / this.chatBg.width;
            this.chatBg.setAnchorPoint(anchorX, 0.5);
        }
    }
});
