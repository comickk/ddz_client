var GamePokerType = require("GamePokerType");
var CardMap = require('CardMap');
var GameData = require("GameData");

var ImgMgr = require('ImgMgr');
var JsonFileMgr = require('JsonFileMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        // 因为要做插入牌组动画的原因,所以做了个root根节点
        rootNode: {default: null, displayName: "根节点", type: cc.Node},

        landlordIcon: {default: null, displayName: "地主标识", type: cc.Node},
        showCardIcon: {default: null, displayName: "明牌标识", type: cc.Node},

        upNum: {default: null, displayName: "上边", type: cc.Sprite},
        downNum: {default: null, displayName: "下边", type: cc.Sprite},
        upSuit: {default: null, displayName: "上边花色", type: cc.Sprite},
        downSuit: {default: null, displayName: "下边花色", type: cc.Sprite},

        normalNode: {default: null, displayName: "正常牌型", type: cc.Node},
        bigJokerNode: {default: null, displayName: "大王", type: cc.Node},
        smallJokerNode: {default: null, displayName: "小王", type: cc.Node},

        cardData: {default: null, displayName: "卡牌数据", visible: false},

        suitArr: {default: [], displayName: "花色图片", type: cc.SpriteFrame},

        selectColor: cc.Color.GRAY,//选中颜色
        unSelectColor: cc.Color.WHITE,// 未被选中的颜色

        _isSelected: false,// 是否被选中
        _isTouchedFlag: false,// 是否被摸过,为选牌做标记
        changeColorNodeArr: {default: [], displayName: "改变颜色的牌组", type: cc.Node},
    },

    onLoad: function () {
        return;
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

    },
    _onTouchBegan(event){
    },
    _onTouchMove(event){
    },
    _onTouchEnd(event){

    },
    _onTouchCancel(event){

    },
    getIsSelected(){
        return this._isSelected;
    },
    getIsTouchFlag(){
        return this._isTouchedFlag;
    },
    setIsTouchFlag(b){
        this._isTouchedFlag = b;
    },
    changeSelect(){
        if (this._isSelected) {
            this.unSelect();
        } else {
            this.select();
        }
    },
    initData(data){
        // data 和CardMap中的map对应
        this.cardData = data;

        if (data.suit == GamePokerType.PokerSuit.SmallJoker) {// 小王
            this.normalNode.active = false;
            this.bigJokerNode.active = false;
            this.smallJokerNode.active = true;
        } else if (data.suit == GamePokerType.PokerSuit.BigJoker) {// 大王
            this.normalNode.active = false;
            this.bigJokerNode.active = true;
            this.smallJokerNode.active = false;
        } else {// 其他牌
            this.normalNode.active = true;
            this.bigJokerNode.active = false;
            this.smallJokerNode.active = false;

            // 上下数字
            this.upNum.spriteFrame = null;
            this.downNum.spriteFrame = null;
            var color = GamePokerType.getPokerSuitColor(data.suit);
            var cardPointImg = JsonFileMgr.getCardPointImg(3, color, data.point);
            if (cardPointImg) {
                ImgMgr.setImg(this.upNum, cardPointImg);
                ImgMgr.setImg(this.downNum, cardPointImg);
            }

            // 上下花色
            this.upSuit.spriteFrame = null;
            this.downSuit.spriteFrame = null;
            var suitImg = JsonFileMgr.getCardSuitImg(3, data.suit);
            if (suitImg) {
                ImgMgr.setImg(this.upSuit, suitImg);
                ImgMgr.setImg(this.downSuit, suitImg);
            }
        }

        // 地主
        var isLandlord = GameData.roomData.selfPlayData.isLandlord;
        this.landlordIcon.active = isLandlord;

        // 明牌
        //var isShowCard = GameData.roomData.selfPlayData.isShowCard;
        this.showCardIcon.active = false;

    },
    // 变为明牌
    onTurnShowCard(b){
        this.showCardIcon.active = b;
    },
    // 变为地主牌
    onTurnLandlordCard(b){
        this.landlordIcon.active = b;
    },
    runInsertAction(){
        if (this.rootNode) {
            var y = this.rootNode.y;
            var x = this.rootNode.x;
            this.rootNode.y = 35;

            var move = new cc.MoveTo(0.5, x, y);
            this.rootNode.runAction(move);
        }
    },
    // x方向上的action
    runMovePositionXAction(x){
        this.node.stopAllActions();
        if (true) {// 后来不需要这个移动的动画了,所以就不做了
            this.node.x = x;
        } else {
            var y = this.node.y;
            var move = new cc.MoveTo(0.15, x, y);
            this.node.runAction(move);
        }
    },
    // 卡牌被选择
    select(){
        //this.node.color = this.unSelectColor;
        this._changeColor(this.unSelectColor);
        if (this._isSelected == false) {
            this._isSelected = true;
            this.node.y += 20;
        }
    },
    // 滑动选中
    onSlideSelect(){
        //this.node.color = this.selectColor;
        this._changeColor(this.selectColor);
    },
    onSlideUnSelect(){
        //this.node.color = this.unSelectColor;
        this._changeColor(this.unSelectColor);
    },
    _changeColor(color){
        for (var i = 0; i < this.changeColorNodeArr.length; i++) {
            var item = this.changeColorNodeArr[i];
            if (item) {
                item.color = color;
            }
        }
    },
    unSelect(){
        //this.node.color = this.unSelectColor;
        this._changeColor(this.unSelectColor);
        if (this._isSelected == true) {
            this._isSelected = false;
            this.node.y -= 20;
        }
    },
    // 牌被打出去
    putOut(){
        this.node.stopAllActions();
        var x = this.node.x;
        var y = this.node.y;
        var moveTo = new cc.MoveTo(0.2, x, y + 10);
        var fadeOut = new cc.FadeOut(0.2);
        var callBack = new cc.CallFunc(function () {
            this.node.destroy();
        }, this);
        var spawn = new cc.Spawn([moveTo, fadeOut, callBack])
        this.node.runAction(spawn);
    },
});
