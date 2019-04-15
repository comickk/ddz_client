var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var Observer = require('Observer');

cc.Class({
    extends: Observer,

    properties: {
        mul1RichText: {default: null, displayName: "初始", type: cc.RichText},
        mul2RichText: {default: null, displayName: "明牌", type: cc.RichText},
        mul3RichText: {default: null, displayName: "抢地主", type: cc.RichText},
        mul4RichText: {default: null, displayName: "底牌", type: cc.RichText},
        mul5RichText: {default: null, displayName: "炸弹", type: cc.RichText},
        mul6RichText: {default: null, displayName: "春天", type: cc.RichText},

        label1: {default: null, displayName: "公共倍数", type: cc.Label},
        label2: {default: null, displayName: "地主倍数", type: cc.Label},
        label3: {default: null, displayName: "农民倍数", type: cc.Label},
        label4: {default: null, displayName: "总倍数", type: cc.Label},
        nameLabel: {default: null, displayName: "名字", type: cc.Label},

        landlordNode: {default: null, displayName: "地主Icon节点", type: cc.Node},
        frameNode: {default: null, displayName: "农民Icon节点", type: cc.Node},

        color1: cc.Color,
        color2: cc.Color,
    },

    onLoad: function () {
        this._initMsg();
        this._updateMul();
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnUpdateMul) {
            this._updateMul();
        } else if (msg == GameLocalMsg.Com.OnExclusionLayer) {
            this.onClickClose();
        } else if (msg == GameNetMsg.recv.EnsureLandlord.msg) {// 地主身份更新
            this._updateLandlord();
        } else if (msg == GameLocalMsg.Play.OnGameOver) {
            this.onClickClose();
        }
    },
    _getMsgList(){
        return [GameLocalMsg.Play.OnUpdateMul,
            GameLocalMsg.Com.OnExclusionLayer,
            GameLocalMsg.Play.OnGameOver,
        ];
    },

    _updateLandlord(){
        var isLandlord = GameData.roomData.selfPlayData.isLandlord;
        if (isLandlord == true) {
            this.landlordNode.active = true;
            this.frameNode.active = false;
        } else if (isLandlord == false) {
            this.landlordNode.active = false;
            //this.frameNode.active = true;
            this.frameNode.active = false;// todo 农民身份不显示
        } else {
            this.landlordNode.active = false;
            this.frameNode.active = false;
        }
    },
    _updateMul(){
        var name = GameData.playData.name;
        this.nameLabel.string = name;

        this._updateLandlord();

        var gamePlayState = GameData.roomData.playState;
        if (gamePlayState == Poker.GamePlayState.None ||
            gamePlayState == Poker.GamePlayState.WaitPlayerJoin) {
            // 游戏没有开始
            this._updateMulWithGameNoBegan();
        } else {
            // 游戏开始了
            this._updateMulWithGameBegan();
        }
    },
    // 游戏未开始时的倍数情况
    _updateMulWithGameNoBegan(){
        this.mul1RichText.string = this._getTmpStr("初始", '--');
        this.mul2RichText.string = this._getTmpStr("明牌", '--');
        this.mul3RichText.string = this._getTmpStr("抢地主", '--');
        this.mul4RichText.string = this._getTmpStr("底牌", '--');
        this.mul5RichText.string = this._getTmpStr("炸弹", '--');
        this.mul6RichText.string = this._getTmpStr("春   天", '--');

        this.label1.string = 'x0';
        this.label2.string = 'x0';
        this.label3.string = 'x0';
        this.label4.string = 'x0';
    },
    // 游戏开始是的状态
    _updateMulWithGameBegan(){
        var mul = GameData.roomData.mul;
        this.mul1RichText.string = this._getTmpStr("初始", this._dealMul(mul.init));
        this.mul2RichText.string = this._getTmpStr("明牌", this._dealMul(mul.vc));
        this.mul3RichText.string = this._getTmpStr("抢地主", this._dealMul(mul.grab));
        this.mul4RichText.string = this._getTmpStr("底牌", this._dealMul(mul.bc));
        this.mul5RichText.string = this._getTmpStr("炸弹", this._dealMul(mul.bomb));
        this.mul6RichText.string = this._getTmpStr("春   天", this._dealMul(mul.spring));

        // 公共倍数
        var comMul = GameDataUtils.getComMul();
        this.label1.string = "x" + comMul;

        // 地主倍数
        this.label2.string = "x" + mul.lo;

        // 农民倍数
        this.label3.string = "x" + mul.u3;

        // 总倍数
        var selfTotalMul = GameDataUtils.getSelfMul();
        this.label4.string = selfTotalMul;
    },
    // 处理一下倍数,方便显示
    _dealMul(mul){
        if (mul > 1) {
            return "x" + mul;
        } else {
            return '--';
        }
    },
    _getTmpStr(str1, str2){
        var color1 = this.color1.toHEX();
        var color2 = this.color2.toHEX();
        //console.log(color1);
        //console.log(color2);

        return "<color=#" + color1 + ">" + str1.toString() + "</c>" +
            "<color=#" + color2 + "> " + str2.toString() + "</color>";

    },
    onClickClose(){
        this.node.destroy();
    },
});
