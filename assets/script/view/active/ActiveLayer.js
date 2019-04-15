var ToggleMarkUtil = require('ToggleMarkUtil');
var Utils = require('Utils');
var ObserverMgr = require('ObserverMgr');
var GameStaticCfg = require("GameStaticCfg");
var Observer = require("Observer");

cc.Class({
    extends: Observer,

    properties: {
        activeMenuLayer: {default: null, displayName: "精彩活动", type: cc.Node},
        noticeMenuLayer: {default: null, displayName: "游戏公告", type: cc.Node},

        contentNode: {default: null, displayName: "内容节点", type: cc.Node},

        itemTmp: {default: null, displayName: "item模版", type: cc.Prefab},
        noticeTmp: {default: null, displayName: "公告模版", type: cc.Prefab},
        activeTmp: {default: null, displayName: "活动模版", type: cc.Prefab},
        activeContent: {default: null, displayName: "活动Content", type: cc.Node},
        noticeContent: {default: null, displayName: "公告Content", type: cc.Node},
        _activeScriptArr: [],
        _noticeScriptArr: [],

    },
    _getMsgList(){
        return [
            GameLocalMsg.Play.OnUpdateActivityContent,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnUpdateActivityContent) {
            Utils.destroyChildren(this.contentNode);
            var node = cc.instantiate(this.noticeTmp);
            this.contentNode.addChild(node);

            var script = node.getComponent("TempLayer");
            if (script) {
                script.setTempLayerData(data);
            }
        }
    },
    onLoad: function () {
        this._initMsg();
        var url = GameStaticCfg.activityUrl;
        var xhr = cc.loader.getXMLHttpRequest();
        //var xhr =new XMLHttpRequest();
        console.log("load url: " + url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 && xhr.status <= 207)) {
                var text = xhr.responseText;
                console.log("load text: " + text);
                this._initItem(JSON.parse(text));
            }
        }.bind(this);

        xhr.open("GET", url);
        xhr.send();
    },
    _initItem(data){
        var activity = data['activity'];
        this._activeScriptArr = [];
        Utils.destroyChildren(this.activeContent);
        if (activity) {

            for (var i = 0; i < activity.length; i++) {
                var itemActivityIndex = cc.instantiate(this.itemTmp);
                this.activeContent.addChild(itemActivityIndex);
                var itemActivityScript = itemActivityIndex.getComponent("TempIndexItem");
                if (itemActivityScript) {
                    itemActivityScript.setTmpIndexData(activity[i]);
                    this._activeScriptArr.push(itemActivityScript);
                }
            }
        }

        var notice = data['notice'];
        this._noticeScriptArr = [];
        Utils.destroyChildren(this.noticeContent);
        if (notice) {

            for (var j = 0; j < notice.length; j++) {
                var itemNoticeIndex = cc.instantiate(this.itemTmp);
                this.noticeContent.addChild(itemNoticeIndex);
                var itemNoticeScript = itemNoticeIndex.getComponent("TempIndexItem");
                if (itemNoticeScript) {
                    itemNoticeScript.setTmpIndexData(notice[j]);
                    this._noticeScriptArr.push(itemNoticeScript);
                }
            }
        }
        this._onSelectTopMenu(1);
    },
    _onSelectTopMenu(index){
        if (index.toString() == "1") {
            this.activeMenuLayer.active = true;
            this.noticeMenuLayer.active = false;
            if (this._activeScriptArr.length > 0) {
                this._activeScriptArr[0].onClick();
            }
        } else if (index.toString() == "2") {
            this.activeMenuLayer.active = false;
            this.noticeMenuLayer.active = true;
            if (this._noticeScriptArr.length > 0) {
                this._noticeScriptArr[0].onClick();
            }
        }
    },
    onToggle(toggle, data){
        this._onSelectTopMenu(data);
        ToggleMarkUtil.onToggle(toggle);
    },
    onClickClose(){
        this.node.destroy();
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.OnClickCloseHomeItemLayer, null);
    }
});
