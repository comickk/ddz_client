cc.Class({
    extends: cc.Component,

    properties: {

        contentLabel: {default: null, displayName: "内容", type: cc.Label},
        _okCB: null,
    },

    onLoad: function () {

    },
    setContent(content, okCB){
        this.contentLabel.string = content;
        this._okCB = okCB;
    },
    onClickOk(){
        if (this._okCB) {
            this._okCB();
        }
        this.onClose();
    },
    onClose(){
        this.node.destroy();
    },
});
