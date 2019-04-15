// 金豆场结算界面
var JsonFileMgr = require('JsonFileMgr');
var ObserverMgr = require("ObserverMgr");
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var NetSocketMgr = require('NetSocketMgr');
var GameNextReadyData = require('GameNextReadyData');

cc.Class({
    extends: cc.Component,

    properties: {
        roleNode: {default: null, displayName: "人物spineNode", type: cc.Node},

        btnLeave: {default: null, displayName: "客服离开按钮", type: cc.Node},
        btnBegan: {default: null, displayName: "开始游戏按钮", type: cc.Node},
        btnShowCard: {default: null, displayName: "明牌开始按钮", type: cc.Node},
        btnChange: {default: null, displayName: "换对手按钮", type: cc.Node},

        winNode: {default: null, displayName: "胜利节点", type: cc.Node},
        loseNode: {default: null, displayName: "失败节点", type: cc.Node},

        selfResultScript: {default: null, displayName: "自己的结果", type: require('SubTotalItem')},
        leftResultScript: {default: null, displayName: "左边的结果", type: require('SubTotalItem')},
        rightResultScript: {default: null, displayName: "右边的结果", type: require('SubTotalItem')},


    },

    onLoad: function () {
        this._initBtn();
    },

    _initBtn(){
        var type = GameData.playData.type;
        if (type == 1) {// 普通账号
            this.btnLeave.active = false;
            this.btnBegan.active = true;
            this.btnShowCard.active = true;
            this.btnChange.active = true;
        } else if (type == 2) {// 客服账号
            this.btnLeave.active = true;
            this.btnBegan.active = false;
            this.btnShowCard.active = false;
            this.btnChange.active = false;

            this.scheduleOnce(this.onClickExitRoom, 3);
        }
    },
    _initItem(data){
        var underPoint = GameData.roomData.roomInfo.underPoint;

        // item数据
        var selfMul = GameDataUtils.getSelfMul();
        var selfName = GameData.playData.name;
        var selfIsLandLord = GameData.roomData.selfPlayData.isLandlord;
        var selfConsumeGold = data.reward.u3;
        this.selfResultScript.setData(selfIsLandLord, selfName, underPoint, selfMul, selfConsumeGold);

        var leftMul = GameDataUtils.getLeftMul();
        var leftName = GameData.roomData.leftPlayData.name;
        var leftIsLandlord = GameData.roomData.leftPlayData.isLandlord;
        var leftConsumeGold = data.reward.u1;
        this.leftResultScript.setData(leftIsLandlord, leftName, underPoint, leftMul, leftConsumeGold);

        var rightMul = GameDataUtils.getRightMul();
        var rightName = GameData.roomData.rightPlayData.name;
        var rightIsLandlord = GameData.roomData.rightPlayData.isLandlord;
        var rightConsumeGold = data.reward.u2;
        this.rightResultScript.setData(rightIsLandlord, rightName, underPoint, rightMul, rightConsumeGold);

    },
    setData(data){
        this._initItem(data);

        var isWin = GameData.judgeGameIsWin(data.win);;

        if (isWin) {
            this.winNode.active = true;
            this.loseNode.active = false;
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResult, Poker.GameOverResult.Win);
        } else {
            this.winNode.active = false;
            this.loseNode.active = true;
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResult, Poker.GameOverResult.Lose);
        }
        this._createRole(isWin);
    },
    _createRole(isWin){
        var roleID = GameData.playData.image;
        var roleData = JsonFileMgr.getRoleDataByRoleId(roleID);
        if (roleData && roleData['spine']) {
            var spine = roleData['spine'];
            cc.loader.loadRes(spine, function (err, prefab) {
                if (!err) {
                    let role = cc.instantiate(prefab);
                    if (role) {
                        this.roleNode.addChild(role);
                        var actionStr = isWin ? 'shengli' : 'shibai';
                        role.getComponent(sp.Skeleton).setAnimation(0, actionStr, true, 1);
                    }
                }
            }.bind(this));
        }
    },
    // 更换对手
    onClickChangeDesk(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverChangePlayer, null);
        var roomID = GameData.roomData.roomID;
        NetSocketMgr.send(GameNetMsg.send.ChangeDesk, {room: roomID});
        this.node.destroy();
    },
    // 明牌开始
    onClickShowCardBegan(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverContinuePlay, null);
        var roomID = GameData.roomData.roomID;
        NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 1, room: roomID});
        GameNextReadyData.isShowCardBegan = true;
        this.node.destroy();
    },
    // 重新开始游戏
    onClickStart(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverContinuePlay, null);
        var roomID = GameData.roomData.roomID;
        NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 0, room: roomID});
        this.node.destroy();
    },
    // 退出房间
    onClickExitRoom(){
        NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
    },
});
