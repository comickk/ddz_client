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
        //-----------------------测试用
        // this._initItem('');
        //--------------------

        xhr.open("GET", url);
        xhr.send();
    },
    _initItem(data){
        //-----------------------------测试用----------
        // var testData ={ activity: [{
        //     "title": "111111",   //标题
        //     "img": "",     //图片地址
        //     "act": "1",     //行为，客户端可自定义事件,也可以为空什么都不做，只作展示用
        //     "content": "1111111", //文本内容
        //     "type": 1,     //1 表示是张图片， 2表示是文本,
        //     "tag": 1,      //活动标签 1 最新  2 最热  3 限时，
        //     "icon": 1,     //活动标题上的图标 1 礼包图标  2 星星图标
        // }],notice:[{
        //     "title": "22222",   //标题
        //     "img": "",     //图片地址
        //     "act": "2",     //行为，客户端可自定义事件,也可以为空什么都不做，只作展示用
        //     "content": "2222222", //文本内容
        //     "type": 2,     //1 表示是张图片， 2表示是文本,
        //     "tag": 2,      //活动标签 1 最新  2 最热  3 限时，
        //     "icon": 2,     //活动标题上的图标 1 礼包图标  2 星星图标
        // }]};
        // data = testData;

        //-------
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
