var JsonFileMgr = require('JsonFileMgr');
var GameData = require('GameData');
var Utils = require('Utils');
var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var GameSceneUtil = require('GameSceneUtil');
var AudioMgr = require('AudioMgr');
var GameStaticCfg = require("GameStaticCfg");
cc.Class({
    extends: Observer,

    properties: {
        landlordNode: {default: null, displayName: "地主身份Node", type: cc.Node},
        peasantNode: {default: null, displayName: "农民身份Node", type: cc.Node},

        doubleIcon: {default: null, displayName: "加倍Node", type: cc.Node},
        actionTipLabel: {default: null, displayName: "动作提示Labe", type: cc.Label},
        spineRoleNode: {default: null, displayName: "角色放置节点", type: cc.Node},

        chatNode: {default: null, displayName: "聊天节点", type: cc.Node},
        chatPrefab: {default: null, displayName: "聊天预制体", type: cc.Prefab},

        _spineAni: null,// spine动画节点
        ui: {default: null, displayName: "UI", type: require('GameSceneBottomUI')},

    },
    _getMsgList(){
        return [
            GameLocalMsg.Play.OnClickNotPutCard,
            GameLocalMsg.Play.OnClickNoBig,
            GameLocalMsg.Play.OnClickRobLandlord,
            GameLocalMsg.Play.OnClickShoutLandlord,
            GameLocalMsg.Play.OnClickDouble,

            GameNetMsg.recv.ReSendPoker.msg,
            GameNetMsg.recv.BeganGame.msg,
            GameLocalMsg.Play.OnGamePlay,
            GameLocalMsg.Play.OnTriggerPutCardAction,
            GameLocalMsg.GameScene.OnSelectChatWord,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnClickNoBig) {// 要不起
            this._setActionTips("不出");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        } else if (msg == GameLocalMsg.Play.OnClickNotPutCard) {// 不出
            this._setActionTips("不出");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        } else if (msg == GameLocalMsg.Play.OnClickRobLandlord) {// 抢地主
            this.setRobLandlord(data);
        } else if (msg == GameLocalMsg.Play.OnClickShoutLandlord) {// 叫地主
            this.setShoutLandlord(data);
        } else if (msg == GameLocalMsg.Play.OnClickDouble) {
            this.setDouble(data);
        } else if (msg == GameNetMsg.recv.ReSendPoker.msg) {// 重新发牌
            this.cleanActionTips();
            GameSceneUtil.onRoleGetCard(this._spineAni);
        } else if (msg == GameNetMsg.recv.BeganGame.msg) {// 开始游戏
            this.resetStatus();
        } else if (msg == GameLocalMsg.Play.OnGamePlay) {
            GameSceneUtil.onRoleGetCard(this._spineAni);
        } else if (msg == GameLocalMsg.Play.OnTriggerPutCardAction) {// 触发出牌操作
            GameSceneUtil.onRolePushCardAni(this._spineAni);
        } else if (msg == GameLocalMsg.GameScene.OnSelectChatWord) {
            this.chat(3, data);
        }
    },
    chat(user, chatId){
        Utils.destroyChildren(this.chatNode);

        var chat = cc.instantiate(this.chatPrefab);
        var script = chat.getComponent('ChatPop');
        this.chatNode.addChild(chat);
        if (script) {
            var roleID = GameData.playData.image;
            var sex = JsonFileMgr.getRoleSex(roleID);
            script.setChatWord(user, chatId, sex);
            AudioMgr.playChatSound(roleID, chatId);
        }

        var fadeIn = new cc.FadeIn(0.1);
        var time = GameStaticCfg.time.chat;
        var delay = new cc.DelayTime(time);
        var fadeOut = new cc.FadeOut(0.5);
        var seq = new cc.Sequence([fadeIn, delay, fadeOut]);
        chat.runAction(seq);
    },

    onLoad: function () {
        this._initMsg();

        var playerData = GameData.playData;
        var roleId = parseInt(playerData.image.toString());
        this._createRole(roleId);
        this.cleanActionTips();
        Utils.destroyChildren(this.chatNode);

        this.peasantNode.active = false;// 身份id
        this.landlordNode.active = false;

        this.doubleIcon.active = false;
    },
    onShowIdentityIcon(isLandlord){
        if (isLandlord == true) {// 是地主
            this.peasantNode.active = false;
            this.landlordNode.active = true;

            var animation = this.landlordNode.getComponent(cc.Animation);
            if (animation) {
                animation.play("newLandlordTwist");
            }

        } else if (isLandlord == false) {
            //this.peasantNode.active = true;//todo 农民身份不显示
            this.peasantNode.active = false;
            this.landlordNode.active = false;
        } else {
            this.peasantNode.active = false;
            this.landlordNode.active = false;
        }
    },
    leave(){
        this.resetStatus();
        Utils.destroyChildren(this.spineRoleNode);
    },
    // 重置状态
    resetStatus(){
        this.setDouble(Poker.DoubleType.No);// 不加倍
        this.cleanActionTips();
        // 身份
        this.peasantNode.active = false;
        this.landlordNode.active = false;
        // 加倍
        this.doubleIcon.active = false;
        // 人物待机
        GameSceneUtil.onRoleIdleAni(this._spineAni);

    },
    _createRole: function (roleID) {
        Utils.destroyChildren(this.spineRoleNode);

        var roleData = JsonFileMgr.getRoleDataByRoleId(roleID);
        if (roleData && roleData['spine']) {
            var spine = roleData['spine'];
            cc.loader.loadRes(spine, function (err, prefab) {
                if (!err) {
                    var roleSpine = cc.instantiate(prefab);
                    roleSpine.scaleX = roleSpine.scaleY = 1;
                    this.spineRoleNode.addChild(roleSpine);
                    this._spineAni = roleSpine.getComponent(sp.Skeleton);
                    if (this._spineAni) {
                        this._spineAni.setAnimation(0, 'daiji', true);
                    }
                }
            }.bind(this));
        }
    },
    onResumePlayerStatus(){
        // 是否是地主
        var isLandlord = GameData.roomData.selfPlayData.isLandlord;
        this.onShowIdentityIcon(isLandlord);

        // 加倍情况
        var doubleMul = GameData.roomData.selfPlayData.doubleMul;
        this.setDouble(doubleMul);
        this.cleanActionTips();
    },
    ///////////////动作提示//////////////////////
    _setActionTips(str){
        this.actionTipLabel.string = str;
    },
    cleanActionTips(){
        this.actionTipLabel.string = "";
    },
    // 显示加倍图标
    _showDouble(){
        this.doubleIcon.active = true;
    },
    setDouble(state){
        //1 不加倍 2 加倍 4 超级加倍
        if (state == Poker.DoubleType.No) {
            this._setActionTips("不加倍");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        } else if (state == Poker.DoubleType.Double) {
            this._setActionTips("加倍");
            this._showDouble();
        } else if (state == Poker.DoubleType.Super) {
            this._setActionTips("超级加倍");
            this._showDouble();
        }
    },
    // 抢地主
    setRobLandlord(isRob){
        if (isRob) {
            this._setActionTips("抢地主");
            GameSceneUtil.onRoleRobLandlord(this._spineAni);
        } else {
            this._setActionTips("不抢");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        }
    },
    // 叫地主
    setShoutLandlord(isShout){
        if (isShout) {
            this._setActionTips("叫地主");
            GameSceneUtil.onRoleRobLandlord(this._spineAni);
        } else {
            this._setActionTips("不叫");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        }
    },
    //////////////////////////////////////
    think(){
        this.cleanActionTips();
        GameSceneUtil.onRoleThinkAni(this._spineAni);
    },
    thinkOver(){
        this.cleanActionTips();
        GameSceneUtil.onRoleIdleAni(this._spineAni);
    },
});
