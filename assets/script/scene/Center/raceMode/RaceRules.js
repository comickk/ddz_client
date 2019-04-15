var GameStaticCfg = require('GameStaticCfg');

cc.Class({
    extends: cc.Component,

    properties: {
        ruleLabel: {default: null, displayName: "规则", type: cc.Label},


    },

    onLoad: function () {
        if (this.ruleLabel) {
            this.ruleLabel.string = GameStaticCfg.gemRule;
        }
    },

    onClose(){
        this.node.destroy();
    },


});
