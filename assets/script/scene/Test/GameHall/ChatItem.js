cc.Class({
    extends: cc.Component,

    properties: {
        word: {default: null, displayName: "聊天内容", type: cc.Label},

    },

    onLoad: function () {

    },
    setWord(user, word){
        this.word.string = user.toString() + ": " + word.toString();
    }


});
