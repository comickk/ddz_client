cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: {default: null, displayName: "Mask节点", type: cc.Node},
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
    },
    ///////////////////////touch 事件//////////////////////////////////////
    _onTouchStart(touch){
        var rect = this.maskNode.getBoundingBox();
        var touchPos = touch.getLocation();
        touchPos = this.maskNode.parent.convertToNodeSpaceAR(touchPos);
        var b = rect.contains(touchPos);
        if (b) {// 如果点击到maskLayer,不吞噬事件
            console.log("in");
            this.node._touchListener.setSwallowTouches(false);
        } else {// 如果没有点击到maskLayer,吞噬事件
            console.log("out");
            this.node._touchListener.setSwallowTouches(true)
        }
        return true;
    },
    _onTouchEnd(){
        //console.log("GuideLayer touchEnd");

    },
    _onTouchMove(){
        //console.log("GuideLayer touchMove");

    },
    _onTouchCancel(){
        //console.log("GuideLayer touchCancel");
    },
    ///////////////////////////////////////////////////////////////////////
    initMask(node){
        if (node) {
            var wordPoint = node.convertToWorldSpaceAR(cc.Vec2.ZERO);// 先把坐标转换为世界坐标
            var localPoint = this.node.convertToNodeSpaceAR(wordPoint);// 把node的坐标转换为和mask在一个坐标系

            //var pos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            //var viewSize = cc.view.getVisibleSize();
            //var x = pos.x - viewSize.width / 2;
            //var y = pos.y - viewSize.height / 2;

            this.maskNode.x = localPoint.x;
            this.maskNode.y = localPoint.y;
            this.maskNode.width = node.width;
            this.maskNode.height = node.height;
        }
    },
});
