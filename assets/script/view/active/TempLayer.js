cc.Class({
    extends: cc.Component,

    properties: {
        titleLabel: {default: null, displayName: "标题", type: cc.Label},
        contentLabel: {default: null, displayName: "内容", type: cc.Label},

    },

    onLoad: function () {

    },
    setTempLayerData(data){
        var title = data['title'];
        if (title) {
            this.titleLabel.string = title;
        } else {
            this.titleLabel.string = "";
        }
        var content = data['content'];
        if (content) {
            this.contentLabel.string = content;
        } else {
            this.contentLabel.string = "";
        }
    }
});
