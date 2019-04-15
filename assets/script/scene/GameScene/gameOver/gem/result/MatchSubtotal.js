var JsonFileMgr = require('JsonFileMgr');
var GameCfg = require('GameCfg');
var Utils = require('Utils');
var Observer = require("Observer");
var ObserverMgr = require("ObserverMgr");
var GameData = require('GameData');
var NetSocketMgr = require('NetSocketMgr');

cc.Class({
    extends: Observer,

    properties: {
        roleNode: {default: null, displayName: "人物spineNode", type: cc.Node},

        loseNode: {default: null, displayName: "失败节点", type: cc.Node},
        winNode: {default: null, displayName: "胜利节点", type: cc.Node},

        leftPlayer: {default: null, displayName: "左边玩家-普通", type: require('MatchSubItem')},
        rightPlayer: {default: null, displayName: "右边玩家-普通", type: require('MatchSubItem')},
        selfPlayer: {default: null, displayName: "玩家自己-普通", type: require('MatchSubItem')},


        leftPlayer2: {default: null, displayName: "左边玩家-抽牌", type: require('MatchSubExtractPokerItem')},
        rightPlayer2: {default: null, displayName: "右边玩家-抽牌", type: require('MatchSubExtractPokerItem')},
        selfPlayer2: {default: null, displayName: "玩家自己-抽牌", type: require('MatchSubExtractPokerItem')},

        result1: {default: null, displayName: "正常结算", type: cc.Node},
        result2: {default: null, displayName: "抽牌结算", type: cc.Node},
    },
    _getMsgList(){
        return [
            GameLocalMsg.Race.ChallengeHeightMatch,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Race.ChallengeHeightMatch) {
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverChangePlayer, null);
            this._goToNextMatch(data.id);
            // NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});// 离开房间
            // NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 0, room: data.id})// 开始游戏
        }
    },
    onLoad(){
        this._initMsg();
    },

    // 最终结算(分抽卡决定的胜负/比赛决定的胜负)
    finalData(data){
        GameData.playData.guide = 2;// 引导结束
        this._setMatchResult(data);
        this._dealReward(data);
        this._dealSelfWin(data);
        this._createRole(data);
    },
    _createRole(data){
        var isWin = data.win == 3 ? true : false;
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
    // 处理奖品情况
    _dealReward(data){
        var rewardNum = data.ud;// 奖品数量
        var isExtractPoker = data.iss == 1 ? true : false;//  1表示是抽牌决出的胜负，0表示打完积分的结果
        if (data.win == 1) {
            if (isExtractPoker) {
                this.leftPlayer2.setRewardNum(rewardNum);
            } else {
                this.leftPlayer.setRewardNum(rewardNum);
            }
        } else if (data.win == 2) {
            if (isExtractPoker) {
                this.rightPlayer2.setRewardNum(rewardNum);
            } else {
                this.rightPlayer.setRewardNum(rewardNum);
            }
        } else if (data.win == 3) {
            if (isExtractPoker) {
                this.selfPlayer2.setRewardNum(rewardNum);
            } else {
                this.selfPlayer.setRewardNum(rewardNum);
            }
        }
    },
    // 处理自己获胜
    _dealSelfWin(data){
        var isSelfWin = data.win == 3 ? true : false;
        if (isSelfWin) {// 胜利
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResultWithForce, Poker.GameOverResult.Win);
            this.loseNode.active = false;
            this.winNode.active = true;
        } else {// 失败
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverWithResultWithForce, Poker.GameOverResult.Lose);
            this.winNode.active = false;
            this.loseNode.active = true;
        }
    },
    _setMatchResult(data){
        this.result1.active = false;
        this.result2.active = false;

        var isExtractPoker = data.iss == 1 ? true : false;//  1表示是抽牌决出的胜负，0表示打完积分的结果
        if (isExtractPoker) {
            this.result2.active = true;
            this._setMatchResultWithExtractPoker(data);
        } else {
            this.result1.active = true;
            this._setMatchResultWithNormal(data);
        }
    },
    _setMatchResultWithExtractPoker(data){
        // 自己玩家信息
        var selfData = {
            name: GameData.playData.name,
            card: data.s3,
            isLandlord: GameData.roomData.selfPlayData.isLandlord,
        };
        this.selfPlayer2.setData(selfData);
        // 左边玩家信息
        var leftData = {
            name: GameData.roomData.leftPlayData.name,
            card: data.s1,
            isLandlord: GameData.roomData.leftPlayData.isLandlord,
        };
        this.leftPlayer2.setData(leftData);
        // 右边玩家信息
        var rightData = {
            name: GameData.roomData.rightPlayData.name,
            card: data.s2,
            isLandlord: GameData.roomData.rightPlayData.isLandlord,
        };
        this.rightPlayer2.setData(rightData);
    },
    _setMatchResultWithNormal(data){
        // 自己玩家信息
        var selfData = {
            name: GameData.playData.name,
            curScore: data.reward.u3,
            totalScore: data.u3,
            isLandlord: GameData.roomData.selfPlayData.isLandlord,
        };
        this.selfPlayer.setData(selfData);
        // 左边玩家信息
        var leftData = {
            name: GameData.roomData.leftPlayData.name,
            curScore: data.reward.u1,
            totalScore: data.u1,
            isLandlord: GameData.roomData.leftPlayData.isLandlord,
        };
        this.leftPlayer.setData(leftData);
        // 右边玩家信息
        var rightData = {
            name: GameData.roomData.rightPlayData.name,
            curScore: data.reward.u2,
            totalScore: data.u2,
            isLandlord: GameData.roomData.rightPlayData.isLandlord,
        };
        this.rightPlayer.setData(rightData);
    },
    // 返回大厅
    onClickReturnCenter(){
        GameCfg.isShowRaceLayer = false;
        NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
    },
    // 更换对手
    onClickChangePlayer(){
        GameData.raceOver();
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverChangePlayer, null);
        var roomID = GameData.roomData.roomID;
        NetSocketMgr.send(GameNetMsg.send.ChangeDesk, {room: roomID});
        this.node.destroy();
    },
    // 下一局比赛
    onClickNextMatch(){
        var roomID = GameData.roomData.roomID;
        this._goToNextMatch(roomID);
    },
    _goToNextMatch(roomID){
        GameData.raceOver();
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverContinuePlay, null);
        NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 0, room: roomID});
        this.node.destroy();

    },
    // 去U钻场选择界面
    onGoMatchSelectLayer(){
        GameCfg.isShowRaceLayer = true;
        NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
    },
});
