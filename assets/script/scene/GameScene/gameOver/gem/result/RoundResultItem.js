cc.Class({
    extends: cc.Component,

    properties: {
        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        curScoreLabel: {default: null, displayName: "当前积分", type: cc.Label},
        totalScoreLabel: {default: null, displayName: "总积分", type: cc.Label},
        landlordNode: {default: null, displayName: "地主节点", type: cc.Node},
    },

    onLoad: function () {

    },

    setData(data){
        this.node.zIndex =999999999999999 - data.totalScore;
        this.landlordNode.active = data.isLandlord;
        this.nameLabel.string = data.name;
        this.curScoreLabel.string = data.curScore;
        this.totalScoreLabel.string = data.totalScore;
    }
});
