var JsonFileMgr = require('JsonFileMgr');
var Utils = require('Utils');
var Observer = require("Observer");
var ObserverMgr = require('ObserverMgr');
var GameSceneUtil = require('GameSceneUtil');
var CardMap = require('CardMap');
var CardAlgorithm = require('CardAlgorithm');
var DECK_TYPE = require('Enum').DECK_TYPE;
var AudioMgr = require('AudioMgr');
var GameData = require('GameData');
var GameStaticCfg = require("GameStaticCfg");
cc.Class({
    extends: Observer,

    properties: {
        UINodeArr: {default: null, displayName: "UI节点", type: cc.Node},
        landlordNode: {default: null, displayName: "地主身份Node", type: cc.Node},
        peasantNode: {default: null, displayName: "农民身份Node", type: cc.Node},

        doubleIcon: {default: null, displayName: "加倍Node", type: cc.Node},

        nameLabel: {default: null, displayName: "名字", type: cc.Label},
        moneyIcon: {default: null, displayName: "金豆Icon", type: cc.Sprite},
        moneyIconArr: {default: [], displayName: "money图标", type: cc.SpriteFrame},
        moneyLabel: {default: null, displayName: "money数量", type: cc.Label},

        robotFlag: {default: null, displayName: "托管标识", type: cc.Node},
        readyFlag: {default: null, displayName: "准备标识", type: cc.Node},

        cardNumLabel: {default: null, displayName: "剩余牌数", type: cc.Label},
        cardNumNode: {default: null, displayName: "剩余牌数节点", type: cc.Node},
        warningNode: {default: null, displayName: "警告", type: cc.Node},
        putCardNode: {default: null, displayName: "出牌展示节点", type: cc.Node},
        putCardDescEffectPre: {default: null, displayName: "出牌说明预制体", type: cc.Prefab},
        putCardDescNode: {default: null, displayName: "出的牌说明节点", type: cc.Node},

        showCardNode: {default: null, displayName: "明牌展示节点", type: cc.Node},
        actionTipLabel: {default: null, displayName: "动作提示Label", type: cc.Label},

        spineRoleNode: {default: null, displayName: "角色放置节点", type: cc.Node},
        clockNode: {default: null, displayName: "闹钟节点", type: cc.Node},
        clockPrefab: {default: null, displayName: "闹钟预制体", type: cc.Prefab},
        smallCardPrefab: {default: null, displayName: "小牌预制体", type: cc.Prefab},

        chatNode: {default: null, displayName: "聊天节点", type: cc.Node},
        chatPrefab: {default: null, displayName: "聊天预制体", type: cc.Prefab},

        _spineAni: null,// spine动画节点
        _showCardArray: [],// 明牌数组
        _roleID: null,// 角色ID
        playRoomData: {default: null, visible: false, displayName: "玩家房间数据"},// TODO v1.2 数据处理方式
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.ShoutLandlord.msg,// 叫地主的情况
            GameLocalMsg.Play.OnGamePlay,
            GameNetMsg.recv.ReSendPoker.msg,// 从新发牌
            GameNetMsg.recv.PlayerOutPoker.msg,// 玩家出牌
            GameLocalMsg.Play.OnSendPokerWithSyncCardNum,
            GameLocalMsg.Com.UpdateMoney,// 更新玩家金币
            GameNetMsg.recv.ResumeEnterHome.msg,
            GameNetMsg.recv.EnsureLandlord.msg,
        ];
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.ReSendPoker.msg) {
            this.thinkOver();
            this.cleanActionTip();
            this.readyFlag.active = false;
            GameSceneUtil.onRoleGetCard(this._spineAni);

        } else if (msg == GameNetMsg.recv.PlayerOutPoker.msg) {// 收到玩家出牌


        } else if (msg == GameLocalMsg.Play.OnSendPokerWithSyncCardNum) {
            this.syncUpdateSendCardNum(data);
        } else if (msg == GameLocalMsg.Play.OnGamePlay) {// 游戏正式开始/ 发牌
            this.readyFlag.active = false;
            GameSceneUtil.onRoleGetCard(this._spineAni);
            this._updateMoney();
        } else if (msg == GameLocalMsg.Com.UpdateMoney) {
            this._updateMoney();
        } else if (msg == GameNetMsg.recv.ResumeEnterHome.msg) {// 游戏恢复
            this._initMoneyIcon();
            this._updateMoney();
        } else if (msg == GameNetMsg.recv.EnsureLandlord.msg) {// 确定地主更新玩家明牌最后一张地主牌
            if (data.lo == this.playRoomData.deskPos) {
                this.setRemainCardNum(20);// 更新牌的数量,地主20张
                var b = this.playRoomData.isShowCard;
                if (b) {
                    this._addLastThreeCardToShowCard();// 底牌加入到明牌区域
                    this._updateShowCardLastOneLandlordIcon();// 更新明牌区域牌的地主icon
                }
            }
        }
    },
    _updateMoney(){
        var num = 0;

        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem && this.playRoomData) {// U钻场
            num = this.playRoomData.raceScore;
        } else if (roomType == Poker.GameRoomType.Gold && this.playRoomData) {// 金豆场
            num = this.playRoomData.gold;
        }
        this.moneyLabel.string = Utils.formatNum(num);//金豆
    },
    chat(user, id){
        Utils.destroyChildren(this.chatNode);
        var chat = cc.instantiate(this.chatPrefab);
        this.chatNode.addChild(chat);
        var script = chat.getComponent('ChatPop');
        if (script) {
            var sex = JsonFileMgr.getRoleSex(this._roleID);
            script.setChatWord(user, id, sex);
            AudioMgr.playChatSound(this._roleID, id);
        }

        var fadeIn = new cc.FadeIn(0.1);
        var time = GameStaticCfg.time.chat;
        var delay = new cc.DelayTime(time);
        var fadeOut = new cc.FadeOut(0.5);
        var seq = new cc.Sequence([fadeIn, delay, fadeOut]);
        chat.runAction(seq);
    },

    // use this for initialization
    onLoad: function () {
        this._initMsg();
        this._resetUI();
    },

    _resetUI(){
        this._init();
        this.cleanActionTip();
        Utils.destroyChildren(this.spineRoleNode);
        this.spineRoleNode.off(cc.Node.EventType.TOUCH_END, this._onClickRole, this);
        Utils.destroyChildren(this.putCardDescNode);
        Utils.destroyChildren(this.putCardNode);// 手牌节点
        Utils.destroyChildren(this.showCardNode);// 明牌节点
        Utils.destroyChildren(this.clockNode);// 闹钟节点
        Utils.destroyChildren(this.chatNode);

        this._cleanShowCardNode();
        this.UINodeArr.active = false;
        this.cardNumNode.active = false;
        this.warningNode.active = false;
    },
    _cleanShowCardNode(){
        for (var k = 0; k < this._showCardArray.length; k++) {
            var item = this._showCardArray[k];
            item.destroy();
        }
        this._showCardArray = [];
        Utils.destroyChildren(this.showCardNode);
    },
    _delShowCardNode(cardServerIDArray){
        for (var k = 0; k < cardServerIDArray.length; k++) {
            var serverID = cardServerIDArray[k];

            for (var i = 0; i < this._showCardArray.length;) {
                var item = this._showCardArray[i];
                var script = item.getComponent("GameSmallCard");
                if (script) {
                    var cardServerID = script.cardData.serverID;
                    if (serverID == cardServerID) {
                        this._showCardArray.splice(i, 1);
                        item.destroy();
                    } else {
                        i++;
                    }
                }
            }
        }
        this._updateShowCardLastOneLandlordIcon();
    },
    // 更新最后一张地主牌图标
    _updateShowCardLastOneLandlordIcon(){
        //destroy的node会在当前帧还存在,所以不能用这种方式
        //var children = this.showCardNode.getChildren();
        //var childNum = this.showCardNode.getChildrenCount();
        //for (var i = 0; i < childNum; i++) {
        //    var card = children[i];
        //    var cardScript = card.getComponent("GameSmallCard");
        //    if (cardScript) {
        //        var isLastOne = i == childNum - 1;
        //        if (isLastOne) {
        //            //var isLandlord = this.playRoomData.isLandlord;
        //            var isLandlord = true;
        //            cardScript.setCardIsLandlord(isLandlord);
        //        } else {
        //            cardScript.setCardIsLandlord(false);
        //        }
        //    }
        //}

        // 按照z进行排序
        this._showCardArray.sort(function (a, b) {
            var cardA = a.getLocalZOrder();
            var cardB = b.getLocalZOrder();
            return cardA - cardB;
        });

        var showCardNum = this._showCardArray.length;
        for (var i = 0; i < showCardNum; i++) {
            var card = this._showCardArray[i];
            var cardScript = card.getComponent("GameSmallCard");
            if (cardScript) {
                var isLastOne = i == showCardNum - 1;
                if (isLastOne) {
                    //var isLandlord = true;
                    var isLandlord = this.playRoomData.isLandlord;
                    cardScript.setCardIsLandlord(isLandlord);
                } else {
                    cardScript.setCardIsLandlord(false);
                }
            }
        }
    },
    // 用户离开房间
    leave(){
        this._roleID = null;
        this._resetUI();
    },
    // 用户重置一下新的状态,开始新的一局比赛
    resetStatus(){
        this._cleanShowCardNode();
        this.cleanActionTip();// 动作提示
        Utils.destroyChildren(this.putCardNode);// 手牌节点
        Utils.destroyChildren(this.showCardNode);// 明牌节点
        Utils.destroyChildren(this.clockNode);// 闹钟节点
        //this.UINodeArr.active = true;// uiNode不改变active,有可能用户离开了
        this.cardNumNode.active = false;

        this.peasantNode.active = false;// 身份id
        this.landlordNode.active = false;

        this.doubleIcon.active = false;// 加倍
        this.robotFlag.active = false;// 是否托管
        // TODO 后续版本解决这个问题
        //this.readyFlag.active = false;// 准备标识 重置的时候不处理准备,可能这个玩家比玩家本身早重置
        this.cardNumLabel.string = "";// 牌数
        this.warningNode.active = false;// 警告

        // 人物待机
        GameSceneUtil.onRoleIdleAni(this._spineAni);
    },
    setGoldNum(num){
        this.moneyLabel.string = Utils.formatNum(num);//金豆
    },
    ///////////////////////动作提示/////////////////////////////////
    cleanActionTip(){
        this.actionTipLabel.string = "";
    },
    _setActionTip(str){
        this.actionTipLabel.string = str;
    },
    setShoutLandlord(isShout){
        Utils.destroyChildren(this.clockNode);
        if (isShout) {
            this._setActionTip("叫地主");
            GameSceneUtil.onRoleRobLandlord(this._spineAni);
            AudioMgr.playActionSound(this._roleID, Poker.Json.ShoutLandlord);
        } else {
            this._setActionTip("不叫");
            AudioMgr.playActionSound(this._roleID, Poker.Json.NoShoutLandlord);
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        }
    },
    setRobLandlord(isRob){
        Utils.destroyChildren(this.clockNode);
        if (isRob) {
            this._setActionTip("抢地主");
            AudioMgr.playActionSound(this._roleID, Poker.Json.RobLandlord);
            GameSceneUtil.onRoleRobLandlord(this._spineAni);
        } else {
            this._setActionTip("不抢");
            AudioMgr.playActionSound(this._roleID, Poker.Json.NoRobLandlord);
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        }
    },
    setDouble(state){
        //1 不加倍 2 加倍 4 超级加倍
        if (state == Poker.DoubleType.No) {
            this._setActionTip("不加倍");
            this.doubleIcon.active = false;
            AudioMgr.playActionSound(this._roleID, Poker.Json.NoDouble);
            GameSceneUtil.onRoleIdleAni(this._spineAni);
        } else if (state == Poker.DoubleType.Double) {
            this._setActionTip("加倍");
            this.doubleIcon.active = true;
            AudioMgr.playActionSound(this._roleID, Poker.Json.Double);
        } else if (state == Poker.DoubleType.Super) {
            this._setActionTip("超级加倍");
            this.doubleIcon.active = true;
            AudioMgr.playActionSound(this._roleID, Poker.Json.SuperDouble);
        }
    },
    // 设置剩余牌的数量
    setRemainCardNum(num){
        this.cardNumNode.active = true;
        this.cardNumLabel.string = num.toString();
        if (num <= 2) {
            this.warningNode.active = true;// 警告
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerPutCardWarning, num);
        } else {
            this.warningNode.active = false;// 警告
        }
    },
    // 更新报牌的声音, 不出牌是不会调用的,防止重复报
    _updateWarningSoundByRemainCardNum(num){
        if (num == 1) {
            AudioMgr.playActionSound(this._roleID, Poker.Json.Warning1);
        } else if (num == 2) {
            AudioMgr.playActionSound(this._roleID, Poker.Json.Warning2);
        }
    },
    _updatePutCardFootFlag(arr){
        // 按照z进行排序依次
        arr.sort(function (a, b) {
            var cardA = a.getLocalZOrder();
            var cardB = b.getLocalZOrder();
            return cardA - cardB;
        });

        var len = arr.length;
        for (var i = 0; i < len; i++) {
            var card = arr[i];
            var script = card.getComponent("GameSmallCard");
            if (script) {
                var isLandlord = this.playRoomData.isLandlord;
                var isLastOne = i == len - 1;
                script.setCardIsLandlord(isLandlord && isLastOne);
            }
        }
    },
    // 设置出牌信息
    setPutCardInfo(putCardArrStr, isLandlord, userID, remainCardNum){
        Utils.destroyChildren(this.putCardNode);// 清理上次出的牌
        Utils.destroyChildren(this.clockNode);
        var userPutCardArr = putCardArrStr.toString().split(',');
        if (userPutCardArr.length == 0 || putCardArrStr.toString() == "") {
            this._setActionTip("不出");
            GameSceneUtil.onRoleIdleAni(this._spineAni);
            AudioMgr.playActionSound(this._roleID, Poker.Json.NoPut);
        } else {
            // 展示牌型
            var putCardDataArr = [];
            for (var key = 0; key < userPutCardArr.length; key++) {
                var serverID = userPutCardArr[key];
                var data = CardMap.getDataByServerID(serverID);
                putCardDataArr.push(data);
            }
            var typeResult = CardAlgorithm.getPokerType(putCardDataArr);
            if (typeResult && typeResult.type != DECK_TYPE.ERROR) {
                GameSceneUtil.addPutCardDescEffect(typeResult.type, this.putCardDescEffectPre, this.putCardDescNode, userID);
                if (this._roleID != null) {
                    AudioMgr.playCardSound(this._roleID, typeResult.type, typeResult.p);
                    this._updateWarningSoundByRemainCardNum(remainCardNum);
                }
            } else {
                console.log("[无法识别出牌类型]: " + putCardArrStr);
            }
            // 牌型动画
            GameSceneUtil.onRolePushCardAni(this._spineAni);

            // 出的牌按照从大到小排序
            userPutCardArr.sort(function (a, b) {
                var localIDA = CardMap.getLocalIDBySeverID(a);
                var localIDB = CardMap.getLocalIDBySeverID(b);
                return localIDB - localIDA;
            });

            //展示出的牌
            var putCardArr = [];
            for (var i = 0; i < userPutCardArr.length; i++) {
                var cardID = userPutCardArr[i];
                var smallCard = cc.instantiate(this.smallCardPrefab);
                this.putCardNode.addChild(smallCard);
                var script = smallCard.getComponent("GameSmallCard");
                if (script) {
                    script.setServerCardID(cardID);
                }
                smallCard.setLocalZOrder(i);// 重新设置zorder,保证从大到小
                putCardArr.push(smallCard);
            }
            if (typeResult && typeResult.type != DECK_TYPE.ERROR) {
                var zOrder = 0;
                var sortArr = [typeResult.main, typeResult.sub];// 先排序主牌, 再排序副牌
                for (var i = 0; i < sortArr.length; i++) {
                    var sortArrItem = sortArr[i];
                    for (var k1 = 0; k1 < sortArrItem.length; k1++) {
                        var item = sortArrItem[k1];
                        var findCard = this._findCardNodeByData(putCardArr, item);
                        if (findCard) {
                            findCard.setLocalZOrder(zOrder);
                            zOrder++;
                            //console.log("重新排序: " + JSON.stringify(item));
                        }
                    }
                }
            }
            this._updatePutCardFootFlag(putCardArr);

            // 明牌减法
            this._delShowCardNode(userPutCardArr);
        }
    },
    // 从牌堆里面找到那张牌
    _findCardNodeByData(cardArr, cardData){
        for (var k = 0; k < cardArr.length; k++) {
            var card = cardArr[k];
            var script = card.getComponent("GameSmallCard");
            if (script && script.cardData == cardData) {
                return card;
            }
        }
        return null;
    },
    // 设置明牌
    setShowCard(cardArr, isLandlord){
        this._cleanShowCardNode();
        AudioMgr.playActionSound(this._roleID, Poker.Json.ShowCard);// 明牌声音
        // todo 明牌其实也需要排序
        for (var i = 0; i < cardArr.length; i++) {
            var serverID = cardArr[i];
            var node = cc.instantiate(this.smallCardPrefab);
            this.showCardNode.addChild(node);
            this._showCardArray.push(node);
            var script = node.getComponent("GameSmallCard");
            if (script) {
                script.setServerCardID(serverID);
                var isLastOne = i == cardArr.length - 1;
                script.setCardIsLandlord(isLandlord && isLastOne);
            }
        }

        this._updateShowCardLastOneLandlordIcon();// 更新明牌区域牌的地主icon
    },
    // 增加底牌到明牌区域
    _addLastThreeCardToShowCard(){
        // todo 明牌其实也需要排序
        var cardArr = GameData.roomData.lastThreeCard;
        for (var i = 0; i < cardArr.length; i++) {
            var serverID = cardArr[i];
            var node = cc.instantiate(this.smallCardPrefab);
            this.showCardNode.addChild(node);
            this._showCardArray.push(node);
            var script = node.getComponent("GameSmallCard");
            if (script) {
                script.setServerCardID(serverID);
            }
        }
    },
    setRobot(b){
        this.robotFlag.active = b;
    },
    onResumePlayerStatus(data){
        // 是否托管
        var isRobot = data.isRobot;
        this.setRobot(isRobot);
        this.readyFlag.active = false;

        // 明牌数据
        var isShowCard = data.isShowCard;
        if (isShowCard) {
            var showCardArr = data.showCardArr;
            var isLandlord = data.isLandLord;
            this.setShowCard(showCardArr, isLandlord);
        }

        // 剩余牌数
        var remainCardNum = data.remainCardNum;
        this.setRemainCardNum(remainCardNum);
        this._updateWarningSoundByRemainCardNum(remainCardNum);

        // 加倍情况(恢复的时候不显示加倍action)
        var doubleMul = data.doubleMul;
        this.setDouble(doubleMul);
        this._setActionTip("");
    },
    setReady(b){
        if (b) {
            this.readyFlag.active = true;
        } else {
            this.readyFlag.active = false;
        }
        this.cleanActionTip();
    },
    ////////////////////////////////////////////////////////
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
        } else if (isLandlord == null) {
            this.peasantNode.active = false;
            this.landlordNode.active = false;
        }
    },
    think(msg, time){
        this._setActionTip("");// 动作提示清空
        Utils.destroyChildren(this.putCardNode);// 上局出的牌清空
        Utils.destroyChildren(this.clockNode);
        var clock = cc.instantiate(this.clockPrefab);
        this.clockNode.addChild(clock);

        var script = clock.getComponent('Clock');
        if (script) {
            script.setTimer(time, msg);
        }

        GameSceneUtil.onRoleThinkAni(this._spineAni);
    },
    // 停止思考
    thinkOver(){
        Utils.destroyChildren(this.clockNode);
        GameSceneUtil.onRoleIdleAni(this._spineAni);
    },
    // 初始化
    _init(){
        this.nameLabel.string = "";// 名字
        this.moneyLabel.string = "";//金豆
        this._initMoneyIcon();

        this.doubleIcon.active = false;// 加倍
        this.robotFlag.active = false;// 是否托管
        this.readyFlag.active = false;// 准备标识
        this.cardNumLabel.string = "";// 牌数
        this.warningNode.active = false;// 警告

        this.peasantNode.active = false;// 身份id
        this.landlordNode.active = false;
    },
    _initMoneyIcon(){
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻
            this.moneyIcon.spriteFrame = this.moneyIconArr[0];
        } else if (roomType == Poker.GameRoomType.Gold) {
            this.moneyIcon.spriteFrame = this.moneyIconArr[1];
        }
    },

    setData(data){
        this.playRoomData = data;// 持有玩家数据Data的结构
        // 创建角色
        var roleID = data.image;
        this._createRole(parseInt(roleID.toString()));


        this.UINodeArr.active = true;
        this.nameLabel.string = data.name;// 名字
        this._updateMoney();
        //this.moneyLabel.string = Utils.formatNum(data.gold);//金豆

        this.doubleIcon.active = false;// 加倍
        this.warningNode.active = false;// 警告
        this.robotFlag.active = false;// 是否托管
        this.readyFlag.active = false;// 准备标识
    },
    _createRole: function (roleID) {
        this._roleID = roleID;
        Utils.destroyChildren(this.spineRoleNode);
        this.spineRoleNode.off(cc.Node.EventType.TOUCH_END, this._onClickRole, this);

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
                    this.spineRoleNode.on(cc.Node.EventType.TOUCH_END, this._onClickRole, this);
                }
            }.bind(this));
        }
    },
    _onClickRole(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowPlayerUserInfo, this.playRoomData);
    },

    // 同步更新发牌的数据
    syncUpdateSendCardNum(num){
        this.cardNumNode.active = true;
        this.cardNumLabel.string = num.toString();
    },
});
