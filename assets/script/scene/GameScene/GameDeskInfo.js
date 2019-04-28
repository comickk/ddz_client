var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var NetSocketMgr = require('NetSocketMgr');
var GameData = require("GameData");
var GameDataUtils = require('GameDataUtils');
var CardMap = require('CardMap');
var Utils = require('Utils');
var GameStaticCfg = require("GameStaticCfg");

cc.Class({
    extends: Observer,

    properties: {
        tipMsgLabel: {default: null, displayName: "提示信息节点", type: cc.Label},
        roomInfo: {default: null, displayName: "房间信息", type: cc.Label},

        changePlayer: {default: null, displayName: "换对手按钮", type: cc.Node},
        startgame: {default: null, displayName: "开始按钮", type: cc.Node},//开始按钮组 ,  明牌开始  和  正常开始
       

        lastThreeCardNode: {default: null, displayName: "底牌节点", type: cc.Node},
        cardBgNode: {default: null, displayName: "底牌背景节点", type: cc.Node},

        smallCardPrefab: {default: null, displayName: "底牌预制体", type: cc.Prefab},
        _time: 0,

        mul2Node: {default: null, displayName: "2倍", type: cc.Node},
        mul3Node: {default: null, displayName: "3倍", type: cc.Node},
        mul4Node: {default: null, displayName: "4倍", type: cc.Node},
        mulLabel: {default: null, displayName: "倍数label", type: cc.Label},

        ticket: {default: null, displayName: "门票", type: require('GameTicket')},
        readyFlag: {default: null, displayName: "准备标识", type: cc.Node},

    },
    _getMsgList(){
        return [
            GameNetMsg.recv.BeganGame.msg,// 开始游戏
            GameNetMsg.recv.SendPoker.msg,// 发牌,游戏正式开始
            GameLocalMsg.Play.OnWaitPlayerSelectDouble,
            GameNetMsg.recv.EnsureLandlord.msg,
            GameLocalMsg.Play.OnGamePlay,
            GameLocalMsg.Play.OnResumeShowLastThreeCard,
            GameNetMsg.recv.LeaveHome.msg,
            GameLocalMsg.Play.onPlayerEscape,

            GameNetMsg.recv.ResumeEnterHome.msg,
            GameLocalMsg.Play.OnTriggerMul_BackCard,
            GameLocalMsg.Play.OnTriggerMul,
            GameLocalMsg.Play.OnShowFindPlayer,
        ];
    },
    _onError(msg, code, data){
        if (code == GameErrorMsg.GoldNotEnough) {// 补助后金币不足
            Utils.destroyChildren(this.lastThreeCardNode);
            this._hideCardMul();
            this.tipMsgLabel.string = "";
            //this.changePlayer.active = true;
            this.startgame.active = true;
        }
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.BeganGame.msg) {
            this.readyFlag.active = true;
            Utils.destroyChildren(this.lastThreeCardNode);

            this._time = GameStaticCfg.time.findPlayer;
            //this.changePlayer.active = false;
            this.startgame.active = false;
            this.tipMsgLabel.string = "正在速配玩伴..." + this._time;
            this.unschedule(this._onFindPlayerTimer);
            this.schedule(this._onFindPlayerTimer, 1, this._time);
            this._updateDeskInfo();
            this._hideCardMul();

        } else if (msg == GameLocalMsg.Play.OnGamePlay) {// 正式开始
            this.readyFlag.active = false;
            // 游戏正式开始,清除这里的所有操作
            this._hideCardMul();
            //this.changePlayer.active = false;
            this.startgame.active = false;
            this.tipMsgLabel.string = "";
            this.unschedule(this._onFindPlayerTimer);
            Utils.destroyChildren(this.lastThreeCardNode);
            this._updateDeskInfo();
        } else if (msg == GameLocalMsg.Play.OnWaitPlayerSelectDouble) {
            this._onWaitPlayerDouble(data);
        } else if (msg == GameNetMsg.recv.EnsureLandlord.msg) {// 确定地主
            this.readyFlag.active = false;
            this._addLastThreeCard();
        } else if (msg == GameNetMsg.recv.SendPoker.msg) {// 重新发牌
            this.readyFlag.active = false;
            Utils.destroyChildren(this.lastThreeCardNode);
        } else if (msg == GameNetMsg.recv.ReSendPoker.msg) {// 重新发牌
            this.readyFlag.active = false;
            Utils.destroyChildren(this.lastThreeCardNode);
        } else if (msg == GameLocalMsg.Play.OnResumeShowLastThreeCard) {
            this._addLastThreeCard();
        } else if (msg == GameNetMsg.recv.LeaveHome.msg) {// 离开房间
            Utils.destroyChildren(this.lastThreeCardNode);
            //this.changePlayer.active = false;
            this.startgame.active = false;
            this.tipMsgLabel.string = "";
            this.readyFlag.active = false;
            this.unschedule(this._onFindPlayerTimer);
        } else if (msg == GameNetMsg.recv.ResumeEnterHome.msg) {// 恢复链接
            this._updateDeskInfo();

            // 当在加倍阶段, 玩家网络断开再恢复,重置一下label(正在加倍提示)
            if (GameData.roomData.playState == Poker.GamePlayState.DoubleStage) {
                this._onWaitPlayerDouble(true);
            } else {
                this._onWaitPlayerDouble(false);
            }
        } else if   ( msg == GameLocalMsg.Play.onPlayerEscape){ //玩家逃跑时
            //this.changePlayer.active = true;

            Utils.destroyChildren(this.lastThreeCardNode);
            this.startgame.active = true;
            this.tipMsgLabel.string = "";

        }   else if (msg == GameLocalMsg.Play.OnTriggerMul_BackCard) {// 底牌加倍
            this._hideCardMul();
            this.readyFlag.active = false;
            //this.cardBgNode.active = true;
            this.cardBgNode.active = fade;
            if (data == 2) {
                this.mul2Node.active = true;
            } else if (data == 3) {
                this.mul3Node.active = true;
            } else if (data == 4) {
                this.mul4Node.active = true;
            }
        } else if (msg == GameLocalMsg.Play.OnTriggerMul) {// 触发倍率变化
            this.readyFlag.active = false;
            this.mulLabel.node.stopAllActions();
            this.mulLabel.node.active = true;
            this.mulLabel.node.opacity = 255;
            this.mulLabel.string = "x" + data.toString();

            var x = this.mulLabel.node.x;
            var y = this.mulLabel.node.y;

            var moveBy = new cc.MoveBy(1.2, 0, -20);
            var fade = new cc.FadeOut(0.5);
            var moveTo = new cc.MoveTo(0.1, x, y);
            var seq = new cc.Sequence([moveBy, fade, moveTo]);
            this.mulLabel.node.runAction(seq);
        } else if (msg == GameLocalMsg.Play.OnShowFindPlayer) {
            this._findPlayerOver();
        }
    },
    onLoad: function () {
        this._initMsg();
        this.tipMsgLabel.string = "";
        this.changePlayer.active = false;
        //this.startgame.active = false;

        this._updateDeskInfo();
        this._hideCardMul();
        this.mulLabel.node.active = false;
    },
    _hideCardMul(){
        this.cardBgNode.active = false;
        this.mul2Node.active = false;
        this.mul3Node.active = false;
        this.mul4Node.active = false;
    },
    _updateDeskInfo(){
        // 牌桌信息
        var roomData = GameData.roomData;
        var roomType = roomData.type;
        if (roomType == Poker.GameRoomType.Gem) {// U钻场
            var num = roomData.gemPlayNum;
            if (roomData.roomInfo && roomData.roomInfo.gem) {
                this.roomInfo.string = roomData.roomInfo.gem + " U钻场 第" + num + "/3局 底分" + roomData.roomInfo.underPoint;
            } else {
                this.roomInfo.string = "第" + num + "/3局";
            }
        } else if (roomType == Poker.GameRoomType.Gold) {// 金币/金豆
            if (roomData.roomInfo) {
                var roomID = roomData.roomInfo.id;
                var roomName = GameDataUtils.getGoldRoomName(roomID);
                this.roomInfo.string = roomName;
            } else {
                this.roomInfo.string = '';
            }
        }

        // 门票信息
        this.ticket.onUpdate();
    },
    _addLastThreeCard(){
        //this.cardBgNode.active = true;
        this.cardBgNode.active = false;
        Utils.destroyChildren(this.lastThreeCardNode);
        var lastThreeCard = GameData.roomData.lastThreeCard;
        //console.log("底牌1: " + JSON.stringify(lastThreeCard));
        // 按照从大到小排序
        lastThreeCard.sort(function (a, b) {
            var localIDA = CardMap.getLocalIDBySeverID(a);
            var localIDB = CardMap.getLocalIDBySeverID(b);
            return localIDB - localIDA;
        });
        //console.log("底牌2: " + JSON.stringify(lastThreeCard));
        for (var k = 0; k < lastThreeCard.length; k++) {
            var serverID = lastThreeCard[k];
            var smallCard = cc.instantiate(this.smallCardPrefab);
            this.lastThreeCardNode.addChild(smallCard);

            var script = smallCard.getComponent("GameLastThreeCard");
            if (script) {
                script.setServerCardID(serverID);
            }
        }
    },
    _onFindPlayerTimer(){
        this.readyFlag.active = true;
        this._time--;
        this.tipMsgLabel.string = "正在速配玩伴..." + this._time;
        if (this._time <= 0) {
            this._findPlayerOver();
        }
    },
    _findPlayerOver(){
        this.unschedule(this._onFindPlayerTimer);
        this.tipMsgLabel.string = "";
        //this.changePlayer.active = true;
        this.startgame.active = true;
        //通知服务器 移出匹配队列,等待玩家  换桌 操作再重新进入匹配队列        
        NetSocketMgr.send(GameNetMsg.send.FindPlayerOver, '');
    },
    onClickChangePlayer(){
       
        var roomID = GameData.roomData.roomID;        
        var data = {room: roomID};
        NetSocketMgr.send(GameNetMsg.send.ChangeDesk, data);
    },
    // TODO 等待玩家加倍 - 进一步优化(自己已经加倍, 不提示)
    _onWaitPlayerDouble(isWait){
        if (isWait) {
            this.tipMsgLabel.string = "等待玩家加倍...";
        } else {
            this.tipMsgLabel.string = "";
        }
    },

    // 开始  明牌开始
    onClickStartGame(event, customEventData){        
        var roomID = GameData.roomData.roomID;
        if(customEventData=='1'){
            NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 1, room: roomID});
           require('GameNextReadyData').isShowCardBegan = true;
        }else
            NetSocketMgr.send(GameNetMsg.send.BeganGame, {vc: 0, room: roomID});
       
    },

});
