var CardMap = require('CardMap');

cc.Class({
    extends: cc.Component,

    properties: {
        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        curScoreLabel: {default: null, displayName: "当前积分", type: cc.Label},
        totalScoreLabel: {default: null, displayName: "总积分", type: cc.Label},
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
        this.curScoreLabel.string = data.curScore;
        this.totalScoreLabel.string = data.totalScore;
        this.node.setLocalZOrder(999999999999999 - data.totalScore);
    },
    setRewardNum(num){
        this.rewardNode.active = true;
        this.rewardNum.string = "X" + num.toString();
    },
});
