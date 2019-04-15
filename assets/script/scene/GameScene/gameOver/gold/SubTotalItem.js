cc.Class({
    extends: cc.Component,

    properties: {
        landlordIcon: {default: null, displayName: "地主icon", type: cc.Node},
        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        scoreLabel: {default: null, displayName: "底分", type: cc.Label},
        mulLabel: {default: null, displayName: "倍数", type: cc.Label},
        goldLabel: {default: null, displayName: "金豆", type: cc.Label},
    },

    onLoad: function () {
        this.landlordIcon.active = false;
    },
    setData(isLandlord, name, underPoint, mul, gold){
        this.node.setLocalZOrder(999999999999999 - gold);
        this.landlordIcon.active = isLandlord;
        this.nameLabel.string = name;
        this.scoreLabel.string = underPoint;
        this.mulLabel.string = mul;
        this.goldLabel.string = gold;
    },
});
