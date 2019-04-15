var JsonFileMgr = require('JsonFileMgr');
var GameData = require('GameData');
var Utils = require('Utils');
var GameStaticCfg = require("GameStaticCfg");
var ImgMgr = require("ImgMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        clockNode: {default: null, displayName: "闹钟", type: cc.Node},
        clockPre: {default: null, displayName: "闹钟预制体", type: cc.Prefab},

        cardPre: {default: null, displayName: "抽的牌预制体", type: cc.Prefab},
        cardNode: {default: null, displayName: "抽的牌节点", type: cc.Node},

        roleName: {default: null, displayName: "名字", type: cc.Label},
        roleNode: {default: null, displayName: "人物节点", type: cc.Node},
        resultIcon: {default: null, displayName: "抽牌结果icon", type: cc.Sprite},

        _roleData: null,
        _roleID: null,
    },

    onLoad: function () {

    },
    setResult(isWin){
        var winPng = "texture/Subtotal/win";
        var losePng = "texture/Subtotal/lose";
        if (isWin) {
            ImgMgr.setImg(this.resultIcon, winPng);
        } else {
            ImgMgr.setImg(this.resultIcon, losePng);
        }
        var defaultAni = this.resultIcon.getComponent(cc.Animation);
        if (defaultAni) {
            defaultAni.play();
        }
    },
    setData(roleId){
        this._roleID = roleId;
        if (roleId == 1) {
            this._roleData = GameData.roomData.leftPlayData;
        } else if (roleId == 2) {
            this._roleData = GameData.roomData.rightPlayData;
        } else if (roleId == 3) {
            this._roleData = GameData.playData;
        }
        var img = this._roleData.image;
        this._createRole(img);

        this.roleName.string = this._roleData.name;

    },
    _createRole(roleId){
        Utils.destroyChildren(this.roleNode);

        var roleData = JsonFileMgr.getRoleDataByRoleId(roleId);
        if (roleData && roleData['spine']) {
            var spine = roleData['spine'];
            cc.loader.loadRes(spine, function (err, prefab) {
                if (!err) {
                    var animate = cc.instantiate(prefab);
                    this.roleNode.addChild(animate);

                    // fixme spine播放动画的bug,有时间反馈一下
                    this.scheduleOnce(function () {
                        var spine = animate.getComponent(sp.Skeleton);
                        spine.setAnimation(0, 'sikao', true);
                    }, 0.001);
                }
            }.bind(this));
        }
    },
    // 抽卡倒计时
    extractClock(){
        Utils.destroyChildren(this.clockNode);
        var node = cc.instantiate(this.clockPre);
        this.clockNode.addChild(node);
        var script = node.getComponent('Clock');
        if (script) {
            var time = GameStaticCfg.time.extractCard;
            script.setTimer(time, GameLocalMsg.Play.OnTimeOverExtractPoker, this._roleID);
        }
    },
    stopExtractClock(){
        Utils.destroyChildren(this.clockNode);
    },
    setCard(cardServerID){
        Utils.destroyChildren(this.clockNode);// 抽到牌删除掉闹钟
        var node = cc.instantiate(this.cardPre);
        this.cardNode.addChild(node);
        var script = node.getComponent('GameSmallCard');
        if (script) {
            script.setServerCardID(cardServerID);
            script.setCardIsLandlord(false);
        }
    },
});
