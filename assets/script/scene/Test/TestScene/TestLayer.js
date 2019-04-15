var Observer = require('Observer');

cc.Class({
    extends: Observer,

    properties: {},
    _getMsgList(){
        return [
            "testLayer1",
            "testLayer1",
        ];
    },
    _onMsg(){

    },
    onLoad: function () {
        this._initMsg();
    },

});
