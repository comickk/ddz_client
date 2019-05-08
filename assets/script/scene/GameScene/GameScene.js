var GameCardMgr = require("GameCardMgr");
var Observer = require("Observer");
var ObserverMgr = require('ObserverMgr');
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var NetSocketMgr = require('NetSocketMgr');
var CardAlgorithm = require('CardAlgorithm');
var Utils = require('Utils');
var DECK_TYPE = require('Enum').DECK_TYPE;
var CardMap = require('CardMap');
var TestCase = require('GameSceneTestCase');
var JsonFileMgr = require('JsonFileMgr');
var JsonFileCfg = require('JsonFileCfg');
var GameLocalStorage = require('GameLocalStorage');
var GameCfg = require('GameCfg');
var IconMgr = require('IconMgr');
var GameStaticCfg = require("GameStaticCfg");

cc.Class({
    extends: Observer,

    properties: {
        leftPlayer: {default: null, displayName: "左边玩家", type: require("GamePlayer")},
        rightPlayer: {default: null, displayName: "右边玩家", type: require("GamePlayer")},
        selfPlayer: {default: null, displayName: "自己玩家", type: require("GamePlayerSelf")},
        actionNode: {default: null, displayName: "出牌动画添加节点", type: cc.Node},
        uiNode: {default: null, displayName: "UI添加节点", type: cc.Node},
        topNode: {default: null, displayName: "top节点", type: cc.Node},
        netNode: {default: null, displayName: "网络节点", type: cc.Node},

        ruleShowLayer: {default: null, displayName: "U钻场游戏规则(show)", type: cc.Prefab},
        ruleClickLayer: {default: null, displayName: "U钻场游戏规则(click)", type: cc.Prefab},

        setLayer: {default: null, displayName: "游戏设置Layer", type: cc.Prefab},
        shopLayer: {default: null, displayName: "游戏商城Layer", type: cc.Prefab},
        landlordActPre: {default: null, displayName: "地主动画", type: cc.Prefab},
        userInfoPre: {default: null, displayName: "用户信息", type: cc.Prefab},

        _playState: 0,// 游戏状态

        goldResultLayer: {default: null, displayName: "金豆场结算界面", type: cc.Prefab},
        roundResultLayer: {default: null, displayName: "U钻场一局结算界面", type: cc.Prefab},
        gemResultLayer: {default: null, displayName: "U钻场最终结算界面", type: cc.Prefab},

        bombPrefab: {default: null, displayName: "炸弹预制体", type: cc.Prefab},
        planePrefab: {default: null, displayName: "飞机预制体", type: cc.Prefab},
        rocketPrefab: {default: null, displayName: "火箭预制体", type: cc.Prefab},
        springPrefab: {default: null, displayName: "春天预制体", type: cc.Prefab},
        pbTipMsg: {default: null, displayName: "提示消息", type: cc.Prefab},
        gameSceneAudio: {default: null, displayName: "游戏声音", type: require('GameSceneAudio')},
        bgSprite: {default: null, displayName: "背景", type: cc.Sprite},

        disRaceScoreLayer: {default: null, displayName: "发放比赛积分Layer", type: cc.Prefab},
        raceNumScoreLayer: {default: null, displayName: "比赛局数显示Layer", type: cc.Prefab},
        extractPokerLayer: {default: null, displayName: "抽牌界面", type: cc.Prefab},        
    },
    _getMsgList(){
        return [
            // UI 事件
            GameLocalMsg.Play.OnClickRobot,
            GameLocalMsg.Play.OnClickCancelRobot,
            GameLocalMsg.Play.OnClickRules,
            GameLocalMsg.Play.OnClickSet,
            GameLocalMsg.Play.OnClickShop,
            GameLocalMsg.Play.OnShowPlayerUserInfo,// 显示用户信息

            // 游戏事件
            GameLocalMsg.Play.OnLeftUserEnter,
            GameLocalMsg.Play.OnRightUserEnter,
            GameLocalMsg.Com.UpdateMoney,
            GameLocalMsg.Com.OnShowTips,
            GameNetMsg.recv.DeskEnterUser.msg,
            GameNetMsg.recv.LeaveHome.msg,
            GameNetMsg.recv.BeganGame.msg,

            GameLocalMsg.Play.OnGamePlay,// 游戏正式开始 / 发牌
            GameLocalMsg.SOCKET.SEND,
            GameNetMsg.recv.ReSendPoker.msg,// 重新发牌
            GameNetMsg.recv.ShoutPoker.msg,// 叫牌
            GameNetMsg.recv.ShoutLandlord.msg,// 叫地主
            GameNetMsg.recv.RobLandlord.msg,// 抢地主
            GameNetMsg.recv.EnsureLandlord.msg,// 确定地主
            GameNetMsg.recv.ShoutDouble.msg,// 加倍
            GameNetMsg.recv.PlayerOutPoker.msg,// 玩家出牌
            GameLocalMsg.Play.OnShowIdentity,// 显示身份
            GameNetMsg.recv.EntrustPlay.msg,// 托管
            GameNetMsg.recv.DisplayPoker.msg,// 明牌
            GameNetMsg.recv.ChangeDesk.msg,// 换桌子
            GameLocalMsg.Play.onPlayerEscape,//玩家逃跑

            GameNetMsg.recv.GameOver_NormalMatch.msg,// 金豆场结算
            GameNetMsg.recv.GameOver_RoundMatch.msg,// 比赛场单场结算
            GameNetMsg.recv.GameOver_CompeteMatch.msg,// 比赛场最终结算
            GameNetMsg.recv.OnBankrupt.msg,
            GameLocalMsg.Play.OnShowRaceResultOverWithLuckyCard,// 结算显示完毕展示抽牌
            GameNetMsg.recv.DeskUserLeave.msg,
            GameLocalMsg.Play.OnGameOverChangePlayer,//游戏结束玩家更换对手
            GameLocalMsg.Play.OnGameOverContinuePlay,
            GameLocalMsg.Play.OnTriggerPutCardWarning,
            GameLocalMsg.Play.OnGameOverShowResultWithExtractPoker,// 抽牌结算结束
            

            GameLocalMsg.Play.OnTriggerBomb,
            GameLocalMsg.Play.OnTriggerPlane,
            GameLocalMsg.Play.OnTriggerRocket,
            GameLocalMsg.Play.OnTriggerSpring,
            GameNetMsg.recv.ResumeEnterHome.msg,
            GameLocalMsg.Play.OnResumePlayerStatusData,
            GameLocalMsg.Play.OnResumeShowLandlordAction,
            GameLocalMsg.Play.OnResumeWaitLandlordPutCard,
            GameLocalMsg.Play.OnResumePutPokerStatus,
            GameNetMsg.recv.UserReady.msg,
            GameNetMsg.recv.Chat.msg,
            GameLocalMsg.Play.OnUpdateLandlordState,// 暂时没有用到

            GameLocalMsg.Game.OnKeyBack,

            GameLocalMsg.Game.OnTriggerReconnect,// 触发重连
            GameLocalMsg.Game.OnForceOutLine,// 强制下线
            GameLocalMsg.Game.OnReconnectFailed,// 重连失败
            GameLocalMsg.Game.OnInitiativeOutLine,// 主动退出登录
        ];
    },
    // 出现错误
    _onError(msg, code, data){
        if (code == GameErrorMsg.GoldNotEnough) {// 补助后金币不足
            this.leftPlayer.resetStatus();
            this.rightPlayer.resetStatus();

            // 提示充值
            var tmp = cc.instantiate(this.pbTipMsg);
            tmp.getComponent('TipMsg').showMsgWithOkCancel(
                '友情提示',
                '您的金豆数量不足, 是否去充值？',
                function () {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShop, null);
                },
                null, this
            );
            this.topNode.addChild(tmp);
        } else if (code == GameErrorMsg.BeyondMax) {// 超出限制
            this.leftPlayer.resetStatus();
            this.rightPlayer.resetStatus();

            var tmp = cc.instantiate(this.pbTipMsg);
            tmp.getComponent('TipMsg').showMsgWithIKnow(
                '友情提示',
                '您的金豆数量不满足该房间限制, \n请离开房间!',
                function () {
                    NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
                },
                this);
            this.topNode.addChild(tmp);
        } else if (code == GameErrorMsg.ResumeGameOnOver) {
            // 游戏外进入其他房间,提示进入当前房间, 当进入当前房间的时候,牌局已经结束, 会收到此消息
            Utils.destroyChildren(this.uiNode);
            var isShowGame = require('GameReady').isShowGame;
            if (isShowGame) {
                //console.log("已经在指定房间牌局结束,重新开始游戏...");
                // 删除结算节点
                GameData.roomData.playState = Poker.GamePlayState.None;
                ObserverMgr.dispatchMsg(GameNetMsg.recv.ChangeDesk.msg, null);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverContinuePlay, null);
                this._sendBeganGameNetMsg(false);
            } else {
                //console.log("已经在指定房间牌局结束,但是游戏挂起,等待开始游戏...");
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowFindPlayer, null);
            }
        }
    },
    _onMsg(msg, data){
        switch(msg){
        case GameLocalMsg.Play.OnClickRobot:
            break;
        case GameLocalMsg.Com.OnShowTips:// 弹出提示
            Utils.destroyChildren(this.topNode);
            var title = data.title;
            var content = data.content;
            var tmp = cc.instantiate(this.pbTipMsg);
            tmp.getComponent('TipMsg').showMsgWithIKnow(title, content);
            this.topNode.addChild(tmp);
            break;

        case GameLocalMsg.Play.OnClickCancelRobot:// 点击取消托管
            this._onClickCancelRobot();
            break;

        case GameLocalMsg.Play.OnClickRules:// 点击规则
            if (this.ruleClickLayer) {
                var node = cc.instantiate(this.ruleClickLayer);
                this.uiNode.addChild(node);
            }
            break;

        case GameLocalMsg.Play.OnClickSet:// 点击设置
            var node = cc.instantiate(this.setLayer);
            this.uiNode.addChild(node);
            break;

        case GameLocalMsg.Play.OnClickShop:// 点击商城
            var node = cc.instantiate(this.shopLayer);
            this.uiNode.addChild(node);
            break;

        case GameNetMsg.recv.DeskEnterUser.msg://玩家有进入
            //this._initPlayer();
            break;
        case GameLocalMsg.Play.OnLeftUserEnter:// 左边玩家进入
            var leftPlayerData = GameData.roomData.leftPlayData;
            this.leftPlayer.setData(leftPlayerData);
            this.leftPlayer.setReady(true);
            break;

        case GameLocalMsg.Play.OnRightUserEnter:// 右边玩家进入
            var rightPlayerData = GameData.roomData.rightPlayData;
            this.rightPlayer.setData(rightPlayerData);
            this.rightPlayer.setReady(true);
            break;

        case GameNetMsg.recv.BeganGame.msg:// 开始游戏
            // 速配倒计时
            break;

        case GameNetMsg.recv.ShoutPoker.msg:// 叫牌
            this._onNetShoutPoker(data);
            break;

        case GameNetMsg.recv.ShoutLandlord.msg:// 叫地主
            this._onNetShoutLandlord(data);
            break;

        case GameNetMsg.recv.RobLandlord.msg:// 抢地主
            this._onNetRobLandlord(data);
            break;

        case GameNetMsg.recv.ShoutDouble.msg:// 加倍
            this._onNetShoutDouble(data);
            break;
            
        case GameNetMsg.recv.EnsureLandlord.msg:// 确定地主
            this._onNetEnsureLandlord(data);
            break;

        case GameNetMsg.recv.PlayerOutPoker.msg:// 玩家出牌
            this._onNetUserOutPoker(data);
            break;

        case GameLocalMsg.Play.OnShowIdentity:// 显示自己的身份
            this._onShowIdentity();
            break;
        case GameNetMsg.recv.EntrustPlay.msg:// 托管
            this._onNetEntrust(data);
            break;

        case GameNetMsg.recv.DisplayPoker.msg:// 明牌
            var user = data.user;
            this._onNetShowCard(user);
            break;

        case GameNetMsg.recv.GameOver_RoundMatch.msg:// U钻场单场结算
            this._onNetRoundMatchOver(msg, data);
            break;
            
        case GameNetMsg.recv.GameOver_NormalMatch.msg:// 金豆场结算
            this._onNetGoldMatchOver(msg, data);
            break;
            
        case GameLocalMsg.Play.OnShowRaceResultOverWithLuckyCard:// 展示抽牌界面,
            Utils.destroyChildren(this.uiNode);
            var extractPokerLayer = cc.instantiate(this.extractPokerLayer);
            this.uiNode.addChild(extractPokerLayer);
            break;
            
        case GameNetMsg.recv.GameOver_CompeteMatch.msg:// U钻场结算(正常)
            var isExtractPoker = data.iss == 1 ? true : false;//  1表示是抽牌决出的胜负，0表示打完积分的结果
            if (isExtractPoker == false) {// 没有抽牌的话直接显示结算
                this._onNetMatchFinalWithNormal(data);
            }
            break;
            
        case GameLocalMsg.Play.OnGameOverShowResultWithExtractPoker:// U钻场结算(抽牌)
            var isExtractPoker = data.iss == 1 ? true : false;//  1表示是抽牌决出的胜负，0表示打完积分的结果
            if (isExtractPoker == true) {// 抽牌的话直接显示结算
                this._onNetMatchFinalWithExtractPoker(data);
            }
            break;
            
        case GameNetMsg.recv.DeskUserLeave.msg:// 用户离开
            this._onNetDeskUserLeave(data);
            break;
            
        case GameLocalMsg.Play.OnGameOverChangePlayer:// 游戏结束,玩家换对手
            this.gameSceneAudio.playNormalPlayMusic();

            this.leftPlayer.leave();
            GameData.cleanLeftPlayerData();
            this.rightPlayer.leave();
            GameData.cleanRightPlayerData();
            this.selfPlayer.resetStatus();
            GameData.restSelfPlayData();
            GameData._resetRoom();
            break;
            
        case GameLocalMsg.Play.OnGameOverContinuePlay:// 游戏结束继续游戏(明牌开始/重新开始)
            this.gameSceneAudio.playNormalPlayMusic();

            this.selfPlayer.resetStatus();
            GameData.restSelfPlayData();

            this.leftPlayer.resetStatus();
            this.rightPlayer.resetStatus();
            GameData.resetRoomData();
            break;
            
        case GameLocalMsg.Com.UpdateMoney:// 更新玩家金币
            //var leftGold = GameData.roomData.leftPlayData.gold;
            //this.leftPlayer.setGoldNum(leftGold);
            //
            //var rightGold = GameData.roomData.rightPlayData.gold;
            //this.rightPlayer.setGoldNum(rightGold);
            break;
            
        case GameNetMsg.recv.LeaveHome.msg:// 离开房间
            this.leftPlayer.leave();
            this.rightPlayer.leave();
            this.selfPlayer.leave();

            GameCardMgr.exitRoom();
            GameData.cleanRoomData();
            cc.director.loadScene('Center');
            break;
            
        case GameLocalMsg.Play.OnTriggerPutCardWarning:// 游戏进入最后报牌阶段
            this._onGamePutCardWaring();
            break;
            
        case GameLocalMsg.Play.OnTriggerBomb:// 炸弹
            //Utils.destroyChildren( this.actionNode);
            this._addBombEffect(data);
            break;
            
        case GameLocalMsg.Play.OnTriggerPlane:// 飞机
            //Utils.destroyChildren( this.actionNode);
            this._addPlaneEffect(data);
            break;
            
        case GameLocalMsg.Play.OnTriggerRocket:// 火箭
            //Utils.destroyChildren( this.actionNode);
            this._addRocketEffect(data);
            break;
            
        case GameLocalMsg.Play.OnTriggerSpring:// 春天
            this._addSpringEffect(data);
            break;
            
        case GameNetMsg.recv.ResumeEnterHome.msg:// 断线重连
            this._onNetResumeEnterRoom(data);
            break;
            
        case GameLocalMsg.Play.OnResumePlayerStatusData:
            this._onResumePlayerStatusData();
            break;
            
        case GameLocalMsg.Play.OnResumeShowLandlordAction:
            this._onShowEnsureLandlordAction();
            break;
            
        case GameLocalMsg.Play.OnResumeWaitLandlordPutCard:
            this._onBeganWithLandlordPutPoker();
            break;
            
        case GameLocalMsg.Play.OnResumePutPokerStatus:// 恢复游戏时设置各个玩家出牌的状态
            for (var k = 0; k < data.length; k++) {
                var user = data[k];
                if (user == 1) {
                    this.leftPlayer._setActionTip("不出");
                } else if (user == 2) {
                    this.rightPlayer._setActionTip("不出");
                } else if (user == 3) {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickNotPutCard, null);
                }
            }
            break;
            
        case GameNetMsg.recv.UserReady.msg:// 用户准备
            this._onNetUserReady(data);
            break;
            
        case GameLocalMsg.Play.OnGamePlay:// 游戏开始发牌明牌处理
            this._onGetRaceScore();
            this._dealPlayerShowCardData();
            break;
            
        case GameNetMsg.recv.ReSendPoker.msg:// 重新发牌
            this._dealPlayerShowCardData();
            break;
            
        case GameNetMsg.recv.Chat.msg:// 聊天
            this._onNetChat(data);
            break;
            
        case GameNetMsg.recv.OnBankrupt.msg:// 破产补助提示
            this._onNetBankrupt(data);
            break;
            
        case GameLocalMsg.Game.OnTriggerReconnect:// 触发重连
            this._onReConnect();
            break;
            
        case GameLocalMsg.Game.OnForceOutLine:// 账号异地登录
            this._onForceOutLine(data);
            break;
            
        case GameLocalMsg.Game.OnKeyBack:// 按下返回键
            this._onKeyBack();
            break;
            
        case GameLocalMsg.Game.OnReconnectFailed:// 重连失败
            this._onReconnectFailed();
            break;
            
        case GameNetMsg.recv.ChangeDesk.msg:// 换桌, 清理桌子上的玩家
            this.leftPlayer.leave();
            this.rightPlayer.leave();

            //清理后,重新申请进入队列
            this._sendBeganGameNetMsg(true);
            break;
            
        case GameLocalMsg.SOCKET.SEND:
            if (data == GameNetMsg.send.LeaveHome.msg) {// 离开房间
                Utils.destroyChildren(this.netNode);
                //Utils.addLoadingMaskLayer(this.netNode);
                Utils.addEnterGameLoading(this.netNode);
            }
            break;
            
        case GameLocalMsg.Play.OnShowPlayerUserInfo:// 显示用户信息
            if (this.userInfoPre) {
                Utils.destroyChildren(this.uiNode);
                var layer = cc.instantiate(this.userInfoPre);
                this.uiNode.addChild(layer);

                var script = layer.getComponent("UserInfo");
                if (script) {
                    var name = data['name'];// 名字
                    var winRate = data['winRate'];// 胜率
                    var continueWinNum = data['continueWinNum'];// 连胜局数
                    var totalNum = data['totalPlayNum'];// 总对局数
                    var roleId = data['image'];// 形象
                    var gold = data['gold'];// 金币
                    script._initUI(name, winRate, continueWinNum, totalNum, roleId, gold);
                }
            }
            break;
            
        case GameLocalMsg.Game.OnInitiativeOutLine:// 主动退出游戏
            // TODO add loadingMask
            Utils.destroyChildren(this.uiNode);
            Utils.destroyChildren(this.netNode);
            Utils.addLoadingMaskLayer(this.netNode);
            cc.director.loadScene('Login');
            break;
        }
    },
    _onNetOpen(){
        this._onReConnectSuccess();
    },
    _onReconnectFailed(){
        Utils.destroyChildren(this.netNode);
        var tmp = cc.instantiate(this.pbTipMsg);
        tmp.getComponent('TipMsg').showMsgWithOkCancel(
            '友情提示',
            '无法连接网络, 是否继续尝试重连?',
            function () {// ok
                this._onReConnect();
            },
            function () {// cancel
                cc.director.loadScene("Login");
            },
            this);
        this.netNode.addChild(tmp);
    },
    _onReConnectSuccess(){
        Utils.destroyChildren(this.netNode);
        this._resumeEnterHome();
    },
    _onReConnect(){
        cc.loader.loadRes("prefab/ReConnectLayer2", function (err, prefab) {
            if (!err) {
                Utils.destroyChildren(this.netNode);
                var layer = cc.instantiate(prefab);
                this.netNode.addChild(layer);
            }
        }.bind(this));
    },
    _onKeyBack(){
        if (GameData.roomData.playState == Poker.GamePlayState.GameOver ||
            GameData.isResponseBackKey == true) {
            // 结算展示界面有返回按钮,不需要响应back按键
            return;
        }
        if (GameData.isReConnectServer) {// 正在连接服务器
            if (cc.sys.isNative) {// 手机端询问是否退出游戏
                Utils.showOkCancelDlg("友情提示", "是否退出游戏?", function () {
                    cc.director.end();
                }.bind(this), null);
            } else if (cc.sys.isBrowser) {// 浏览器询问是否返回登录界面
                Utils.showOkCancelDlg("友情提示", "是否返回登录界面?", function () {
                    cc.director.loadScene("Login");
                }.bind(this), null);
            }
        } else {
            Utils.showOkCancelDlg("友情提示", "是否返回大厅?", function () {
                NetSocketMgr.send(GameNetMsg.send.LeaveHome, {});
            }.bind(this), null);
        }
    },
    // 强制下线
    _onForceOutLine(data){
        Utils.destroyChildren(this.netNode);
        var tmp = cc.instantiate(this.pbTipMsg);
        tmp.getComponent('TipMsg').showMsgWithIKnow(
            '友情提示',
            '您的账号在其他地方登陆,请重新登录...',
            function () {
                GameData.isForceOutLine = false;
                cc.director.loadScene("Login");
            },
            this);
        this.netNode.addChild(tmp);
    },
    _onNetBankrupt(data){
        //Utils.destroyChildren(this.topNode);
        var helpGold = data.getup;
        var str = '恭喜您获得' + helpGold + '金豆补助';
        Utils.showBankOutDlg(str);
    },
    // U钻场最终结算(没有抽牌)
    _onNetMatchFinalWithNormal(data){
        Utils.destroyChildren(this.uiNode);
        var gemLayer = cc.instantiate(this.gemResultLayer);
        this.uiNode.addChild(gemLayer);

        var gemScript = gemLayer.getComponent('MatchSubtotal');
        if (gemScript) {
            gemScript.finalData(data);
        }
    },
    // 抽牌结束
    _onNetMatchFinalWithExtractPoker(data){
        Utils.destroyChildren(this.uiNode);
        var gemLayer = cc.instantiate(this.gemResultLayer);
        this.uiNode.addChild(gemLayer);

        var gemScript = gemLayer.getComponent('MatchSubtotal');
        if (gemScript) {
            gemScript.finalData(data);
        }
    },
    //比赛场单局比赛结束
    _onNetRoundMatchOver(msg, data){
        Utils.destroyChildren(this.uiNode);
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场(前两局), 因为心跳是5s, 所以展示结算界面3s后自动消失
            var gemLayer = cc.instantiate(this.roundResultLayer);
            this.uiNode.addChild(gemLayer);

            var gemScript = gemLayer.getComponent('RoundResult');
            if (gemScript) {
                gemScript.setData(data);
            }
        }

    },
    //金豆场结束比赛
    _onNetGoldMatchOver(msg, data){
        Utils.destroyChildren(this.uiNode);
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gold) {// 金豆场结束
            var layer = cc.instantiate(this.goldResultLayer);
            this.uiNode.addChild(layer);

            var script = layer.getComponent("SubTotalLayer");
            if (script) {
                script.setData(data);
            }
        }
    },
    // 分发比赛积分
    _onGetRaceScore(){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        var num = roomData.gemPlayNum;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场
            if (num == 1) {// 第一场 发放积分
                var node = cc.instantiate(this.disRaceScoreLayer);
                this.topNode.addChild(node);
                var script = node.getComponent('DispatchRaceScore');
                if (script) {
                    var leftNode = this.leftPlayer.moneyIcon.node;
                    var rightNode = this.rightPlayer.moneyIcon.node;
                    var selfNode = this.selfPlayer.ui.scoreIcon.node;

                    script.dispatchScore(leftNode, rightNode, selfNode);
                }
            }
            // 第几局
            var raceNum = cc.instantiate(this.raceNumScoreLayer);
            var script1 = raceNum.getComponent('RaceNumLayer');
            if (script1) {
                script1.setRaceNum(num);
            }
            this.topNode.addChild(raceNum);
        }
    },
    _onNetChat(data){
        var id = data.id;
        var user = data.user;
        if (user == 1) {
            this.leftPlayer.chat(user, id);
        } else if (user == 2) {
            this.rightPlayer.chat(user, id);
        }
    },
    _dealPlayerShowCardData(){
        this._onNetShowCard(1);// 左边玩家明牌处理
        this._onNetShowCard(2);// 右边玩家明牌处理
    },
    _onNetUserReady(data){
        if (data == 1) {
            this.leftPlayer.setReady(true);
        } else if (data == 2) {
            this.rightPlayer.setReady(true);
        }
    },
    _onResumePlayerStatusData(){
        var leftData = {
            isRobot: GameData.roomData.leftPlayData.isRobot,
            isShowCard: GameData.roomData.leftPlayData.isShowCard,
            showCardArr: GameData.roomData.leftPlayData.showCardArray,
            isLandLord: GameData.roomData.leftPlayData.isLandlord,
            remainCardNum: GameData.roomData.leftPlayData.remainCardNum,
            doubleMul: GameData.roomData.leftPlayData.doubleMul,

        };
        this.leftPlayer.onResumePlayerStatus(leftData);

        var rightData = {
            isRobot: GameData.roomData.rightPlayData.isRobot,
            isShowCard: GameData.roomData.rightPlayData.isShowCard,
            showCardArr: GameData.roomData.rightPlayData.showCardArray,
            isLandLord: GameData.roomData.rightPlayData.isLandlord,
            remainCardNum: GameData.roomData.rightPlayData.remainCardNum,
            doubleMul: GameData.roomData.rightPlayData.doubleMul,
        };
        this.rightPlayer.onResumePlayerStatus(rightData);
        // 自己的手牌
        this.selfPlayer.onResumePlayerStatus();
    },
    // 场景恢复
    _onNetResumeEnterRoom(data){
        var curOpUser = data.cu;// 当前操作的用户是谁
        var str = JSON.stringify(data);
        //console.log("GameScene[场景恢复情况]: " + str);
    },
    _addSpringEffect(data){
        var node = cc.instantiate(this.springPrefab);
        var script = node.getComponent("SpringEffect");
        if (script) {
            script.onSpring(data);
        }
        this.topNode.addChild(node);
    },
    _addBombEffect(data){
        var node = cc.instantiate(this.bombPrefab);
        var script = node.getComponent("BoomEffect");
        if (script) {
            script.onBoomWithDirection(data);
        }
        this.actionNode.addChild(node);
    },
    _addPlaneEffect(data){
        var node = cc.instantiate(this.planePrefab);
        var script = node.getComponent("PlaneEffect");
        if (script) {
            script.onPlane(data);
        }
        this.actionNode.addChild(node);
    },
    _addRocketEffect(data){
        var node = cc.instantiate(this.rocketPrefab);
        var script = node.getComponent("RocketEffect");
        if (script) {
            script.onRocket(data);
        }
        this.actionNode.addChild(node);
    },
    _onGamePutCardWaring(){
        var isWarning = GameData.roomData.playState;
        if (isWarning == Poker.GamePlayState.PutCardWarning) {
            // 已经进入报警阶段
        } else {
            GameData.roomData.playState = Poker.GamePlayState.PutCardWarning;
            this.gameSceneAudio.playWarningMusic();
        }
    },
    _onNetDeskUserLeave(data){
        if (data.user == 1) {
            this.leftPlayer.leave();
            GameData.cleanLeftPlayerData();
        } else if (data.user == 2) {
            this.rightPlayer.leave();
            GameData.cleanRightPlayerData();
        }        

        if (data.escape){//发送逃跑消息------------------------------------------
            var str = '玩家 '+ data.escape + ' 已退出,游戏结束!';
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, {title:"玩家逃跑",content:str});
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.onPlayerEscape,null);

            this.gameSceneAudio.playNormalPlayMusic();

            this.leftPlayer.leave();
            GameData.cleanLeftPlayerData();

            this.rightPlayer.leave();
            GameData.cleanRightPlayerData();

            this.selfPlayer.resetStatus();
            GameData.restSelfPlayData();

            GameData._resetRoom();
        }
    },
    // 明牌
    _onNetShowCard(user){
        if (user == GameData.roomData.leftPlayData.deskPos) {
            var isLeftShowCard = GameData.roomData.leftPlayData.isShowCard;
            if (isLeftShowCard) {
                var leftShowCardArr = GameData.roomData.leftPlayData.showCardArray;
                var isLeftLandlord = GameData.roomData.leftPlayData.isLandlord;
                this.leftPlayer.setShowCard(leftShowCardArr, isLeftLandlord);
            }
        } else if (user == GameData.roomData.rightPlayData.deskPos) {
            var isRightShowCard = GameData.roomData.rightPlayData.isShowCard;
            if (isRightShowCard) {
                var rightShowCardArr = GameData.roomData.rightPlayData.showCardArray;
                var isRightLandlord = GameData.roomData.rightPlayData.isLandlord;
                this.rightPlayer.setShowCard(rightShowCardArr, isRightLandlord);
            }
        } else {
            // 自己明牌,更新最后一张明牌
            GameCardMgr.updateLastOneCardFlag();
        }
    },
    _onNetEntrust(data){
        var user = data.user;
        if (user == 1) {
            var isRobot = GameData.roomData.leftPlayData.isRobot;
            this.leftPlayer.setRobot(isRobot);
        } else if (user == 2) {
            var isRobot = GameData.roomData.rightPlayData.isRobot;
            this.rightPlayer.setRobot(isRobot);
        }
    },
    // 叫牌
    _onNetShoutPoker(data){
        if (data == GameData.roomData.leftPlayData.deskPos) {
            this.leftPlayer.think(null, GameStaticCfg.time.shoutLandlord);
            this.rightPlayer.thinkOver();
        } else if (data == GameData.roomData.rightPlayData.deskPos) {
            this.rightPlayer.think(null, GameStaticCfg.time.shoutLandlord);
            this.leftPlayer.thinkOver();
        } else {
            var selfIsRobot = GameData.roomData.selfPlayData.isRobot;
            if (selfIsRobot) {// 托管: 不叫牌
                NetSocketMgr.send(GameNetMsg.send.ShoutLandlord, 0);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShoutLandlord, false);
            } else {
                var syncData = {
                    state: Poker.GamePlayState.ShoutLandLord,
                    time: GameStaticCfg.time.shoutLandlord,
                    event: GameLocalMsg.Play.OnTimeOverShoutLand,
                };
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
                this.selfPlayer.think();
            }
        }
    },
    // 确定地主,开始加倍
    _onNetEnsureLandlord(data){
        this.rightPlayer.thinkOver();
        this.rightPlayer.cleanActionTip();

        this.leftPlayer.thinkOver();
        this.leftPlayer.cleanActionTip();

        this.selfPlayer.cleanActionTips();
        this.selfPlayer.think();

        // 地主的动画
        this._onShowEnsureLandlordAction();
        // 桌子上提示加倍
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnWaitPlayerSelectDouble, true);

        var selfIsRobot = GameData.roomData.selfPlayData.isRobot;
        if (selfIsRobot) {// 托管: 不加倍
            var robotFunc = function () {
                NetSocketMgr.send(GameNetMsg.send.ShoutDouble, 0);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickDouble, Poker.DoubleType.No);////1 不加倍 2 加倍 4 超级加倍
            }.bind(this);

            var isShowGame = require('GameReady').isShowGame;
            if (isShowGame) {
                this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
            } else {
                robotFunc();
            }
        } else {
            // 自己显示加倍
            var syncData = {
                state: Poker.GamePlayState.DoubleStage,
                time: GameStaticCfg.time.double,
                event: GameLocalMsg.Play.OnTimeOverDouble,
            };
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
        }
    },
    // 加载确定地主的动画
    _onShowEnsureLandlordAction(){
        var landlord = new cc.instantiate(this.landlordActPre);
        landlord.y = 116;// 其实高度,
        this.actionNode.addChild(landlord);

        var p = null;
        if (GameData.roomData.leftPlayData.isLandlord) {
            p = this.leftPlayer.landlordNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        } else if (GameData.roomData.rightPlayData.isLandlord) {
            p = this.rightPlayer.landlordNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        } else if (GameData.roomData.selfPlayData.isLandlord) {
            p = this.selfPlayer.landlordNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        }

        var script = landlord.getComponent("LandlordAction");
        if (script) {
            var localPos = this.actionNode.convertToNodeSpaceAR(p);// 要注意父节点是谁
            script.setMovePosition(localPos.x, localPos.y);
        }
    },
    // 显示自己的身份
    _onShowIdentity(){
        var isLeftLandlord = GameData.roomData.leftPlayData.isLandlord;
        this.leftPlayer.onShowIdentityIcon(isLeftLandlord);

        var isRightLandlord = GameData.roomData.rightPlayData.isLandlord;
        this.rightPlayer.onShowIdentityIcon(isRightLandlord);

        var isSelfLandlord = GameData.roomData.selfPlayData.isLandlord;
        this.selfPlayer.onShowIdentityIcon(isSelfLandlord);
    },
    // 玩家出牌
    _onNetUserOutPoker(data){
        //{"user":2,"card":407,"nt":0,"num":0}

        var left = GameData.roomData.leftPlayData.deskPos
        var right  = GameData.roomData.rightPlayData.deskPos
        var user = data.user;
        var cardArrStr = data.cards.toString();
        var cardNum = data.num;
        if (user ==  left) {
            var leftIsLandlord = GameData.roomData.leftPlayData.isLandlord;
            this.leftPlayer.setRemainCardNum(cardNum);// 剩余手牌数量
            this.leftPlayer.setPutCardInfo(cardArrStr, leftIsLandlord, user, cardNum); // 出的牌
        } else if (user == right) {
            var rightIsLandlord = GameData.roomData.rightPlayData.isLandlord;
            this.rightPlayer.setRemainCardNum(cardNum);
            this.rightPlayer.setPutCardInfo(cardArrStr, rightIsLandlord, user, cardNum);
        } else  {
            // 自己出牌也会受到这个消息,暂时不做处理
        }

        var nextUser = data.nt;
        if (nextUser == left) {
            if (user != right)this.rightPlayer.thinkOver();
            this.leftPlayer.think(null, GameStaticCfg.time.putCard);
        } else if (nextUser == right) {
            if (user != left)this.leftPlayer.thinkOver();
            this.rightPlayer.think(null, GameStaticCfg.time.putCard);
        } else if (nextUser == 0) {// 出牌结束
            this.rightPlayer.thinkOver();
            this.leftPlayer.thinkOver();
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOver, null);
        } else {
            if (user != left) this.leftPlayer.thinkOver();
            if (user != right) this.rightPlayer.thinkOver();
            this.selfPlayer.think();

            this._onNetTurnSelfPutPoker();
        }
    },
    // 轮到自己出牌
    _onNetTurnSelfPutPoker(){
        var selfIsRobot = GameData.roomData.selfPlayData.isRobot;

        if (GameData.roomData.selfPlayData.isBeganPriority) {

            GameData.roomData.playState = Poker.GamePlayState.PutPokerWithBegan;
            // 自己随便开头出牌
            if (selfIsRobot) {//托管: 地主开始出牌,选择的牌如果符合牌型就出,否则随机选择一张单子
                // 不能使用这个,因为这个消息和PutPokerTipBtn绑定了,托管的时候是不会创建tipBtn的
                //ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTimeOverPutCardWithBegan);
                var robotFunc = function () {
                    // 2种做法,采用第一种
                    if (true) {
                        // 不判断选择的牌,直接随机一张出牌
                        GameCardMgr.setAllHandPokerUnSelect();
                        GameCardMgr.randomSelectHandPoker();
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                    } else {
                        // 判断选择的牌,符合直接打出去,不符合随机选择一张
                        var putCardData = GameCardMgr.getSelectHandPokerData();
                        var putCardTypeResult = CardAlgorithm.getPokerType(putCardData);
                        var putCardType = putCardTypeResult.type;
                        if (putCardType == DECK_TYPE.ERROR) {
                            GameCardMgr.setAllHandPokerUnSelect();
                            GameCardMgr.randomSelectHandPoker();
                            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                        } else {
                            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                        }
                    }
                }.bind(this);

                var isShowGame = require('GameReady').isShowGame;
                if (isShowGame) {
                    this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                } else {
                    robotFunc();
                }
            } else {// 不托管: 等待出牌
                var syncData = {
                    state: Poker.GamePlayState.PutPokerWithBegan,
                    time: GameStaticCfg.time.putCard,
                    event: GameLocalMsg.Play.OnTimeOverPutCardWithBegan,
                };
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
            }
        } else {
            // 轮到自己出牌有2中情况
            // 1.有牌可出 提示/不出/出牌
            // 2.无牌可出 要不起
            var gameCardData = GameDataUtils.getAtkCardData();// 上家出的牌
            var selfCard = GameCardMgr.getAllHandPokerData();// 自己的手牌
            var tipLen = CardAlgorithm.calcTipCard(gameCardData, selfCard);

            // 计算出了要出的牌
            if (tipLen > 0) {
                GameData.roomData.playState = Poker.GamePlayState.PutPokerWithAfter;
                if (selfIsRobot) {// 托管: 打出可以压制的牌
                    var robotFunc = function () {
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickTipPutCard);// 提示一下
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardAfter);// 出牌
                    }.bind(this);

                    var isShowGame = require('GameReady').isShowGame;
                    if (isShowGame) {
                        this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                    } else {
                        robotFunc();
                    }
                } else {// 非托管: 到时间不出
                    this._selfThinkWithTips();
                }
            } else {
                if (selfIsRobot) {//托管: 要不起
                    var robotFunc = function () {
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickNoBig);
                        NetSocketMgr.send(GameNetMsg.send.PutPoker, []);
                    }.bind(this);

                    var isShowGame = require('GameReady').isShowGame;
                    if (isShowGame) {
                        this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                    } else {
                        robotFunc();
                    }

                } else {//非托管:等待点击(要不起)
                    this._selfThinkWithNoBig();
                }
            }
        }

    },
    // 有可以出的牌思考
    _selfThinkWithTips(){
        var syncData = {
            state: Poker.GamePlayState.PutPokerWithAfter,
            time: GameStaticCfg.time.putCard,
            event: GameLocalMsg.Play.OnTimeOverPutCardWithAfter,
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
    },
    // 要不起思考
    _selfThinkWithNoBig(){
        GameCardMgr.setAllHandPokerUnSelect();// 所有的手牌未选中
        var syncData = {
            state: Poker.GamePlayState.PutPokerWithNoBig,
            time: GameStaticCfg.time.noBig,
            event: GameLocalMsg.Play.OnTimeOverPutCardWithNoBig,
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
    },
    // 加倍
    _onNetShoutDouble(data){
        // 更新加倍情况
        var user = data.user;
        var type = data.type;//1 不加倍 2 加倍 4 超级加倍
        if (user ==  GameData.roomData.leftPlayData.deskPos) {
            this.leftPlayer.setDouble(type);
        } else if (user == GameData.roomData.rightPlayData.deskPos) {
            this.rightPlayer.setDouble(type);
        } else {

        }

        var nextDo = data.ntdo;
        if (!nextDo ||                 // 没有这个参数
            (nextDo && nextDo == 0)) { // 或者这个参数为0
            // 等待其他用户完成加倍
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnWaitPlayerSelectDouble, true);
        } else if ((nextDo && nextDo == 6)) {
            this.rightPlayer.cleanActionTip();
            this.leftPlayer.cleanActionTip();
            this.selfPlayer.cleanActionTips();
            this._onBeganWithLandlordPutPoker();// 进入地主出牌阶段
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnWaitPlayerSelectDouble, false);
        }
    },
    // 地主出牌
    _onBeganWithLandlordPutPoker(){
        var selfIsLandlord = GameData.roomData.selfPlayData.isLandlord;
        var rightIsLandlord = GameData.roomData.rightPlayData.isLandlord;
        var leftIsLandlord = GameData.roomData.leftPlayData.isLandlord;

        if (selfIsLandlord) {// 只有一个出牌按钮
            GameData.roomData.playState = Poker.GamePlayState.PutPokerWithLandlordBegan;
            var selfIsRobot = GameData.roomData.selfPlayData.isRobot;
            if (selfIsRobot) {// 托管: 随机选择一张牌

                var robotFunc = function () {
                    var putCardData = GameCardMgr.getSelectHandPokerData();
                    var putCardTypeResult = CardAlgorithm.getPokerType(putCardData);
                    var putCardType = putCardTypeResult.type;
                    if (putCardType == DECK_TYPE.ERROR) {
                        GameCardMgr.setAllHandPokerUnSelect();
                        GameCardMgr.randomSelectHandPoker();
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                    } else {
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan);
                    }
                }.bind(this);
                var isShowGame = require('GameReady').isShowGame;
                if (isShowGame) {
                    this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                } else {
                    robotFunc();
                }
            } else {
                var syncData = {
                    state: Poker.GamePlayState.PutPokerWithLandlordBegan,
                    time: GameStaticCfg.time.putCard,
                    event: GameLocalMsg.Play.OnTimeOverPutCardWithBegan,
                };
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
            }
        } else if (leftIsLandlord) {
            GameData.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
            this.leftPlayer.think(null, GameStaticCfg.time.putCard);
            this.rightPlayer.thinkOver();
        } else if (rightIsLandlord) {
            GameData.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
            this.rightPlayer.think(null, GameStaticCfg.time.putCard);
            this.leftPlayer.thinkOver();
        }
    },
    // 叫地主
    _onNetShoutLandlord(data){
        // 处理上个人的情况
        var user = data.user;// 叫地主的用户 (1 左侧 2 右侧 3 自己)
        var userCall = data.call;// 叫地主用户的情况(1 表示叫   0 表示不叫)
        if (user == GameData.roomData.leftPlayData.deskPos) {// 左边的用户
            this.leftPlayer.setShoutLandlord(userCall == 1);
            this.rightPlayer.thinkOver();
            this.selfPlayer.thinkOver();
        } else if (user == GameData.roomData.rightPlayData.deskPos) {// 右边的用户
            this.rightPlayer.setShoutLandlord(userCall == 1);
            this.leftPlayer.thinkOver();
            this.selfPlayer.thinkOver();
        } else{//自己
        }

        var nextUser = data.nt;// 下一个用户  1 左侧  2 右侧  3 自己
        var nextDo = data.ntdo; // 下一个用户要做的事情 c 表示下一步是叫地主  g 表示下一步是抢地主
        var time = 20;
        if (nextDo == "c") {
            time = GameStaticCfg.time.shoutLandlord;
        } else if (nextDo == "g") {
            time = GameStaticCfg.time.robLandlord;
        }

        if (nextUser == GameData.roomData.leftPlayData.deskPos) {
            this.leftPlayer.think(null, time);
        } else if (nextUser == GameData.roomData.rightPlayData.deskPos) {
            this.rightPlayer.think(null, time);
        } else {
            this.selfPlayer.think();

            var selfIsRobot = GameData.roomData.selfPlayData.isRobot;

            var syncData = {};
            if (nextDo == "c") {// 叫地主
                if (selfIsRobot) {// 托管: 不叫地主
                    var robotFunc = function () {
                        NetSocketMgr.send(GameNetMsg.send.ShoutLandlord, 0);
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickShoutLandlord, false);
                    }.bind(this);

                    var isShowGame = require('GameReady').isShowGame;
                    if (isShowGame) {
                        this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                    } else {
                        robotFunc();
                    }

                } else {
                    syncData = {
                        state: Poker.GamePlayState.ShoutLandLord,
                        time: GameStaticCfg.time.shoutLandlord,
                        event: GameLocalMsg.Play.OnTimeOverShoutLand,
                    };
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
                }
            } else if (nextDo == "g") {// 抢地主
                if (selfIsRobot) {// 托管: 不抢地主
                    var robotFunc = function () {
                        NetSocketMgr.send(GameNetMsg.send.RobLandlord, 0);
                        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRobLandlord, false);
                    }.bind(this);

                    var isShowGame = require('GameReady').isShowGame;
                    if (isShowGame) {
                        this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                    } else {
                        robotFunc();
                    }
                } else {
                    syncData = {
                        state: Poker.GamePlayState.RobLandlord,
                        time: GameStaticCfg.time.robLandlord,
                        event: GameLocalMsg.Play.OnTimeOverRobLand,
                    };
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
                }
            }

        }
    },
    // 抢地主
    _onNetRobLandlord(data){
        var robUser = data.user;// 做抢地主操作的用户
        var isRob = data.grab;// 该用户是否抢地主
        if (robUser == GameData.roomData.leftPlayData.deskPos) {
            this.leftPlayer.setRobLandlord(isRob == 1);
            this.rightPlayer.thinkOver();
            this.selfPlayer.thinkOver();
        } else if (robUser == GameData.roomData.rightPlayData.deskPos) {
            this.rightPlayer.setRobLandlord(isRob == 1);
            this.leftPlayer.thinkOver();
            this.selfPlayer.thinkOver();
        } else {// 一般不会走到这个地方

        }

        var nextUser = data.nt;// 下一个操作的用户
        if (nextUser == GameData.roomData.leftPlayData.deskPos) {
            this.leftPlayer.think(null, GameStaticCfg.time.robLandlord);
        } else if (nextUser == GameData.roomData.rightPlayData.deskPos) {
            this.rightPlayer.think(null, GameStaticCfg.time.robLandlord);
        } else if (nextUser == 0) {
            //console.log("叫地主结束");
        }else {
            this.selfPlayer.think();

            var selfIsRobot = GameData.roomData.selfPlayData.isRobot;
            if (selfIsRobot) {// 托管: 不抢地主
                var robotFunc = function () {
                    NetSocketMgr.send(GameNetMsg.send.RobLandlord, 0);
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickRobLandlord, false);
                }.bind(this);

                var isShowGame = require('GameReady').isShowGame;
                if (isShowGame) {
                    this.scheduleOnce(robotFunc, GameCfg.robotThinkTime);
                } else {
                    robotFunc();
                }
            } else {
                var syncData = {
                    state: Poker.GamePlayState.RobLandlord,
                    time: GameStaticCfg.time.robLandlord,
                    event: GameLocalMsg.Play.OnTimeOverRobLand,
                };
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
            }
        } 
    },

    _onClickCancelRobot(){
        //console.log("cancel robot");
    },
    onLoad: function () {
        GameData.curScene = Poker.GameScene.Play;
        if (false) {
            JsonFileCfg.init();
            //JsonFileMgr.preLoadAudio();
            GameData.initGameDataEvent();
        }
        this._initMsg();
        //this._initPlayer();
        var isDisconnect = GameData.roomData.isDisconnect;
        if (isDisconnect) {
            this._resumeEnterHome();
        } else {
            //this._sendBeganGameNetMsg(true);
        }
        this._initBg();
    },
    _initBg(){
        var sceneIndex = GameData.getUseSceneId();
        IconMgr.setGameBg(this.bgSprite, sceneIndex);
    },
    // 恢复游戏场景
    _resumeEnterHome(){
        NetSocketMgr.send(GameNetMsg.send.ResumeEnterHome, {});
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickCancelRobot);
    },

    // 开始游戏
    _sendBeganGameNetMsg(isShowRules){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻
            // 展示规则,前3局提示规则,之后就不进行提示了
            var num = GameLocalStorage.getIsShowRaceRuleCount();
            if (num > 3 || isShowRules == false) {
                // todo 一定次数后不展示U钻场, 规则直接开始
                var data1 = {vc: 0, room: GameData.roomData.roomID};
                NetSocketMgr.send(GameNetMsg.send.BeganGame, data1);
            } else {
                GameLocalStorage.addShowRaceRleCount();
                if (this.ruleShowLayer) {
                    var node = cc.instantiate(this.ruleShowLayer);
                    this.uiNode.addChild(node);
                }
            }
        } else if (roomType == Poker.GameRoomType.Gold) {// 金豆
            var selfData = GameData.roomData.selfPlayData;
            var vc = selfData.isShowCard ? 1 : 0;
            var data = {vc: vc, room: GameData.roomData.roomID};
            NetSocketMgr.send(GameNetMsg.send.BeganGame, data);
        }
    },
    
    // 初始化玩家
    _initPlayer(){
        var leftPlayerData = null;
        this.leftPlayer.setData();
        var rightPlayerData = null;
        this.rightPlayer.setData();
    },   
});
