var NetSocketMgr = require('NetSocketMgr');
var Observer = require("Observer");

cc.Class({
    extends: Observer,

    properties: {},
    _getMsgList(){
        return [
            //GameLocalMsg.Game.OnInitiativeOutLine,
        ];
    },
    _onMsg(msg, data){
        //if (msg == GameLocalMsg.Game.OnInitiativeOutLine) {
        //    cc.director.loadScene('Login');
        //}
    },
    onLoad: function () {
        this._initMsg();
    },
    onOkClick(){
        NetSocketMgr.disConnect();
    },

    onCancelClick(){
        this.node.destroy();
    },
});
