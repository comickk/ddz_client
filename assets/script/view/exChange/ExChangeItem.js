cc.Class({
    extends: cc.Component,

    properties: {

        _itemData: null,

        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        icon: {default: null, displayName: "礼品图标", type: cc.Sprite},

    },

    onLoad: function () {

    },
    initData(data){
        this._itemData = data;
        this.nameLabel.string = data.name.toString();

    },
    onClickBuy(){
        console.log('buy');

    }
});
