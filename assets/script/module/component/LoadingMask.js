cc.Class({
    extends: cc.Component,

    properties: {
        ring: {default: null, displayName: "圆环", type: cc.Sprite},
        _add: true,
    },

    scheduleFunc: function (dt) {
        if (this._add) {
            this.ring.fillRange += 0.05;
            if (this.ring.fillRange >= 0.75) {
                this._add = false;
            }
        } else {
            this.ring.fillRange -= 0.05;
            if (this.ring.fillRange <= 0.2) {
                this._add = true;
            }
        }
    },

    onLoad(){
        this.ring.fillStart = 0;
        this.ring.fillRange = 0.2;
        var repeat = cc.repeatForever(cc.rotateBy(1.0, 360));
        this.ring.node.runAction(repeat);
        this.schedule(this.scheduleFunc, 0.1);
    },

    onDisable(){
        this.unschedule(this.scheduleFunc);
        this.ring.node.stopAllActions();
    },
});
