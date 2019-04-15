var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var Observer = require('Observer');
cc.Class({
    extends: Observer,

    properties: {
        contentLabel: {default: null, displayName: "内容", type: cc.Label},
        bgNode:{default: null, displayName:"背景节点", type:cc.Node},
    },

    onLoad: function () {
        this._initMsg();
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Com.OnExclusionLayer) {
            this.onClickClose();
        } else if (msg == GameLocalMsg.Play.OnGameOver) {
            this.onClickClose();
        }
    },
    start(){
        this.bgNode._touchListener.setSwallowTouches(false);
    },
    _getMsgList(){
        return [GameLocalMsg.Com.OnExclusionLayer,
            GameLocalMsg.Play.OnGameOver,]
    },
    setContent(str){
        this.contentLabel.string = str;
    },
    onClickClose(){
        this.node.destroy();
    }
});
