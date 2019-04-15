var GameDataUtils = require("GameDataUtils");
var GameData = require('GameData');
var Utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {
        itemsNode: {default: null, displayName: "挑战item节点", type: cc.Node},
        itemPre: {default: null, displayName: "item", type: cc.Prefab},
    },

    onLoad: function () {
        Utils.destroyChildren(this.itemsNode);
        var roomArr = GameDataUtils.getHeightGemMatchArr(GameData.roomData.roomID);

        if (roomArr.length > 0) {
            for (var k = 0; k < roomArr.length; k++) {
                var clone = cc.instantiate(this.itemPre);
                var script = clone.getComponent("ChallengeHeightMatchItem");
                if (script) {
                    script.initData(roomArr[k]);
                }
                this.itemsNode.addChild(clone);
            }
        } else {
            console.log("没有找到合适的推荐场次");
        }
    },
});
