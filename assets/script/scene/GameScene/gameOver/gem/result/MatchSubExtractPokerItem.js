var CardMap = require('CardMap');

cc.Class({
    extends: cc.Component,

    properties: {

        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        cardPointLabel: {default: null, displayName: "抽牌大小", type: cc.Label},
        landlordNode: {default: null, displayName: "地主节点", type: cc.Node},
        rewardNode: {default: null, displayName: "奖励节点", type: cc.Node},
        rewardNum: {default: null, displayName: "奖励数量", type: cc.Label},
    },

    onLoad: function () {
        this.rewardNode.active = false;

    },
    setData(data){
        this.landlordNode.active = data.isLandlord;
        this.nameLabel.string = data.name;
        this.landlordNode.active = false;// 不显示地主

        if (data.card.toString().length > 0) {
            var cardData = CardMap.getDataByServerID(data.card);
            if (cardData) {
                this.cardPointLabel.string = CardMap.getPointString(cardData.point);
                this.node.zIndex =999999999 - cardData.localID;
            } else {
                this.cardPointLabel.string = "";
                this.node.zIndex=999999999;
            }
        } else {
            this.cardPointLabel.string = "";
            this.node.zIndex=999999999;
        }
    },
    setRewardNum(num){
        this.rewardNode.active = true;
        this.rewardNum.string = "X" + num.toString();
    },

});
