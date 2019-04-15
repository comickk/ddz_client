var ObserverMgr = require("ObserverMgr");
var Observer = require("Observer");
cc.Class({
    extends: Observer,

    properties: {
        payingLabel: {default: null, displayName: "支付状态", type: cc.Label},
        _tipLabel: "",
        _tipIndex: 0,
    },
    _getMsgList(){
        return [
            GameLocalMsg.Com.OnPayingUpdate,
            GameLocalMsg.Com.OnIAPFailed,
        ];

    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Com.OnPayingUpdate) {
            this._tipLabel = data.toString();
            this.updatePayingLabel();
        } else if (msg == GameLocalMsg.Com.OnIAPFailed) {
            this.node.destroy();
        }
    },
    updatePayingLabel(){
        if (this._tipLabel != "") {
            var tip = "";
            for (var i = 0; i < this._tipIndex; i++) {
                tip += ".";
            }
            this.payingLabel.string = this._tipLabel + tip;
            this._tipIndex++;
            this._tipIndex = this._tipIndex > 3 ? 0 : this._tipIndex;
        }
    },
    onLoad: function () {
        this._initMsg();
        this._tipLabel = "支付中";
        this.schedule(this.updatePayingLabel, 1);
    },

});
