var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var JsonFileMgr = require('JsonFileMgr');
var GameData = require('GameData');

cc.Class({
    extends: Observer,

    properties: {
        scrollView: {default: null, displayName: "滚动视图", type: cc.ScrollView},
        chatItem: {default: null, displayName: "聊天item", type: cc.Prefab},
    },
    _getMsgList(){
        return [
            GameLocalMsg.Com.OnExclusionLayer,
            GameLocalMsg.GameScene.OnSelectChatWord,
            GameLocalMsg.Play.OnGameOver,

        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Com.OnExclusionLayer) {
            this.onClickBg();
        } else if (msg == GameLocalMsg.GameScene.OnSelectChatWord) {
            this.onClickBg();
        } else if (msg == GameLocalMsg.Play.OnGameOver) {
            this.onClickBg();
        }
    },

    onLoad: function () {
        this._initMsg();
        var roleID = GameData.playData.image;
        var sex = JsonFileMgr.getRoleSex(roleID);
        var wordArr = JsonFileMgr.getChatWordArrBySex(sex);

        // {id, chatId, sex, mp3, desc}
        for (var k = 0; k < wordArr.length; k++) {
            var chat = cc.instantiate(this.chatItem);
            var script = chat.getComponent("ChatSelectItem");
            if (script) {
                script.initData(wordArr[k]);
            }
            this.scrollView.content.addChild(chat);
        }
    },
    onClickBg(){
        //this.node.removeFromParent(true);
        this.node.destroy();
    },
});
