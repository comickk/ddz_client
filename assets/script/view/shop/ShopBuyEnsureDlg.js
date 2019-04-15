cc.Class({
    extends: cc.Component,

    properties: {
        contentLabel: {default: null, displayName: "内容", type: cc.Label},

        _callbackOK: null,
        _callbackCancel: null,
    },

    onLoad: function () {

    },

    showBuyDlg(content, callbackOK, callbackCancel, _this){
        this.contentLabel.string = content;

        if (typeof callbackOK == "function") {
            this._callbackOK = _this ? callbackOK.bind(_this) : callbackOK;
        }
        if (typeof  callbackCancel == "function") {
            this._callbackCancel = _this ? callbackCancel.bind(_this) : callbackCancel;
        }
    },

    onClickOk(){
        if (this._callbackOK) {
            this._callbackOK();
        }
        this.node.destroy();
    },
    onClickCancel(){
        if (this._callbackCancel) {
            this._callbackCancel();
        }
        this.node.destroy();
    },
});
