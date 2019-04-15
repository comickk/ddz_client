cc.Class({
    extends: cc.Component,

    properties: {
        ani: {default: null, displayName: "动画", type: cc.Animation},

    },

    onLoad: function () {

    },

    setRaceNum(num){
        var aniStr = null;
        if (num == 1) {
            aniStr = "gameStart1";
        } else if (num == 2) {
            aniStr = "gameStart2";
        } else if (num == 3) {
            aniStr = "gameStart3";
        }
        if (aniStr) {
            this.ani.play(aniStr);
        }
    },
});
