var ObserverMgr = require("ObserverMgr");
var GameCfg = require("GameCfg");
var GameData = require('GameData');
var Utils = require('Utils');

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: {default: null, displayName: "滚动视图", type: cc.ScrollView},
        pre: {default: null, displayName: "item预制体", type: cc.Prefab},


    },

    onLoad: function () {
        GameCfg.isShowRaceLayer = false;
        // todo 暂时屏蔽引导
        //return;
        // 判断是否在引导阶段
        if (GameData.playData.guide == 0 || GameData.playData.guide == 1) {
            this.scrollView.vertical = false;// 禁止滑动
            var children = this.scrollView.content.getChildren();
            ObserverMgr.dispatchMsg(GameLocalMsg.Center.AddGuideMask, children[0]);
            ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowBeanAni, null);
        }
    },
    initData(roomCfg){
        Utils.destroyChildren(this.scrollView.content);
        for (var i = 0; i < roomCfg.length; i++) {
            var itemData = roomCfg[i];
            var clone = cc.instantiate(this.pre);
            var script = clone.getComponent("RaceModeItem");
            if (script) {
                script.initData(itemData);
            }
            this.scrollView.content.addChild(clone);
        }
    },
    onDisable(){
    },
});
