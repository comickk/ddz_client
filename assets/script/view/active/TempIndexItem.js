var ObserverMgr = require('ObserverMgr');
var Observer = require("Observer");

cc.Class({
    extends: Observer,

    properties: {
        _data: null,
        toggle: {default: null, displayName: "toggle", type: cc.Toggle},
        label: {default: null, displayName: "标题", type: cc.Label},

        selectNode: {default: null, displayName: "选择节点", type: cc.Node},
        unSelectNode: {default: null, displayName: "未选择节点", type: cc.Node},

        activeTag: {default: null, displayName: "活动标签", type: cc.Sprite},
        activeTagFrameArr: {default: [], displayName: "活动标签图片Arr", type: cc.SpriteFrame},
        activeIcon: {default: null, displayName: "活动icon", type: cc.Sprite},
        activeIconFrameArr: {default: [], displayName: "活动icon图片Arr", type: cc.SpriteFrame},
    },

    onLoad: function () {
        this._initMsg();
    },
    _getMsgList(){
        return [GameLocalMsg.Play.OnUpdateActivityContent];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnUpdateActivityContent) {
            this._setIsCheck(false);
        }
    },
    _setIsCheck(b){
        this.selectNode.active = b;
        this.unSelectNode.active = !b;

    },


    setTmpIndexData(data){
        var testData = {
            "title": "",   //标题
            "img": "",     //图片地址
            "act": "",     //行为，客户端可自定义事件,也可以为空什么都不做，只作展示用
            "content": "", //文本内容
            "type": 1,     //1 表示是张图片， 2表示是文本,
            "tag": 1,      //活动标签 1 最新  2 最热  3 限时，
            "icon": 1,     //活动标题上的图标 1 礼包图标  2 星星图标
        };
        this._data = data;
        this.label.string = data['title'];
        var icon = data['icon'];
        if (icon) {
            if (icon == 1) {// 礼包
                this.activeIcon.spriteFrame = this.activeIconFrameArr[0];

            } else if (icon == 2) {// 星星
                this.activeIcon.spriteFrame = this.activeIconFrameArr[1];

            } else {
                this.activeIcon.spriteFrame = null;
                this.activeIcon.node.active = false;
            }
        } else {
            this.activeIcon.spriteFrame = null;
            this.activeIcon.node.active = false;
        }

        var tag = data['tag'];
        if (tag) {
            if (tag == 1) {
                this.activeTag.spriteFrame = this.activeTagFrameArr[0];
            } else if (tag == 2) {
                this.activeTag.spriteFrame = this.activeTagFrameArr[1];
            } else if (tag == 3) {
                this.activeTag.spriteFrame = this.activeTagFrameArr[2];
            } else {
                this.activeTag.spriteFrame = null;
            }
        } else {
            this.activeTag.spriteFrame = null;
        }
    },
    onClick(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnUpdateActivityContent, this._data);
        this._setIsCheck(true);
    },
});
