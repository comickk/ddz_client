cc.Class({
    extends: cc.Component,

    properties: {
        actionEnable: {default: true, displayName: "是否生效"},
    },

    onLoad: function () {
        var fps;
        if (cc.sys.isBrowser) {
            fps = cc.game.getFrameRate();
        } else {
            fps = 1 / cc.director.getDeltaTime();
        }
        var minFps = 20;
        if (fps >= minFps) {
            //console.log("当前fps: " + fps);
            if (this.actionEnable) {
                var curScale = this.node.scale;
                this.node.scale = curScale - 0.1;
                var scaleBig = cc.scaleTo(0.1, curScale + 0.02);
                scaleBig.easing(cc.easeQuadraticActionOut());
                //var easeScaleBig =  cc.easeQuadraticActionOut(scaleBig);
                                          
                var scaleNormal =  cc.scaleTo(0.1, curScale);
                scaleNormal.easing(cc.easeQuadraticActionOut());
                //var easeScaleNormal =  cc.easeQuadraticActionOut(scaleNormal);

                //var seq = cc.Sequence([easeScaleBig, easeScaleNormal]);
                var seq = cc.sequence(scaleBig, scaleNormal);
                this.node.runAction(seq);
            }
        } else {
            console.log("帧率过低:" + fps + ", 不执行action: ");
        }
    },   
});
