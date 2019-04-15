var ObserverMgr = require('ObserverMgr');
var GameLocalStorage = require('GameLocalStorage');
var GameNextReadyData = require('GameNextReadyData');
var ActionAnalyze = require('ActionAnalyze');
var GameCfg = require('GameCfg');
var JsonFileMgr = require('JsonFileMgr');

module.exports = {
    isForceOutLine: false,// 是否强制下线
    isInitiativeOutLine: false,// 是否主动下线
    isReConnectServer: false,//是否正在重连server
    isResponseBackKey: false,// 是否正在响应back按键
    isRobotByHide: false,// 是否是隐藏界面导致的托管
    curScene: 0,// 当前的游戏scene
    visitorAccount: true,// 是否为访客账号

    id:0,//玩家id

    playData: {
        name: "name",
        image: 0,
        head: "",//头像标识,暂时无用
        gold: 0,// 金豆
        totalPlayNum: 0,// 游戏总局数
        winNum: 0,// 胜利局数
        continueWinNum: 0,// 持续胜利局数
        gem: 0,// 钻石
        type: "1",// 账号类型
        brokeNum: 0,//破产次数
        guide: 1,// 引导进度
        sex: "m",// 保留处理
        scene: 0,// 选择的场景
    },
   
    roomInfo: {
        // 金币场
        goldRoom: [
            // 场次ID + | + 底分 + | + 房间初始倍数 + | + 入场最小值 + | + 入场最大值 + | + 门票 + | + 输赢封顶
            // {id: 0, underPoint: 0, initMul: 0, minEnterPoint: 0, maxEnterPoint: 0, ticket: 0, maxEarn: 0},
        ],
        // U钻场数据结构
        gemRoom: [
            // 场次ID + | + 底分 + | + 房间初始倍数 + | + 可赢钻石 + | + 入场金币 + | + 金币购买的积分数量
            // {id: 0, underPoint: 0, initMul: 0, gem: 0, ticket: 0, gamePoint: 0},
        ],
    },
    // 游戏中的房间数据
    roomData: {
        type: 0,// 房间的类型
        roomInfo: null,// 房间具体信息,对应roomInfo.goldRoom/roomInfo.gemRoom
        roomID: 0,// 匹配的房间号
        gemPlayNum: 0,//U钻场第几局
        isDisconnect: false,// 该房间是否失去链接
        lastThreeCard: [],// 底牌

        // 要战胜的牌
        attackPoker: {
            card: [],// 要战胜的牌
            user: 0,// 谁的牌
        },

        playState: 0,//

        // 抽牌数据
        extractData: {
            nextUser: 0, // 下个要抽牌的人
            userArr: [], // 要抽牌的人
            data: [
                // 数据结构
                //{
                //    pos: null,// 抽的牌位置
                //    card: null,// 抽的牌
                //    user:null,// 抽卡的人
                //},
            ]
        },
        mul: {// 倍数情况
            init: 1, //  -- init: 初始倍数
            vc: 1,//  -- vc: 明牌倍数
            grab: 1,//  -- grab: 抢地主倍数
            bc: 1,//  -- bc: 底牌倍数
            bomb: 1,//  -- bomb: 炸弹倍数
            spring: 1,//  -- spring: 春天倍数
            lo: 1,//  -- lo: 地主倍数
            u1: 1,//  -- u1 用户1农民倍数
            u2: 1,//  -- u2 用户2农民情况
            u3: 1,//  -- u3 用户3农民情况
        },

        selfPlayData: {
            timeOutCount: 0,// 超时次数
            isShowCard: false,
            isLandlord: null, // true 代表是地主 false 代表是农民 null 标识没有确定身份
            isRobot: false, // 是否托管
            ready: false,
            isBeganPriority: false,//是否获得开始新一轮出牌的优先权
            cardIDArray: [],// 服务器下发的牌ID
            doubleMul: 0,// 加倍倍率

            // todo 后期积分要剥离出来,作为游戏道具存在
            raceScore: 0,// 比赛场积分
        },
        leftPlayData: {
            gem: 0,
            gold: 0,
            head: '',
            image: '',
            name: 'leftPlayer',
            continueWinNum: 0,
            totalPlayNum: 0,
            winRate: 0,
            showCardArray: [],// 明牌数组

            deskPos: 1,// 牌桌位置
            remainCardNum: 0, // 余牌数量
            isShowCard: false,
            isLandlord: null,
            doubleMul: 0,// 加倍倍率
            isRobot: false, // 是否托管
            ready: false,
            raceScore: 0,// 比赛场积分
        },
        rightPlayData: {
            gem: 0,
            gold: 0,
            head: '',
            image: '',
            name: 'rightPlayer',
            winRate: 0,
            continueWinNum: 0,
            totalPlayNum: 0,
            showCardArray: [],// 明牌数组

            deskPos: 2,// 牌桌位置
            remainCardNum: 0, // 余牌数量
            isShowCard: false,
            isLandlord: null,
            doubleMul: 0,// 加倍倍率
            isRobot: false, // 是否托管
            ready: false,
            raceScore: 0,// 比赛场积分
        },
    },
    // 重置房间数据
    resetRoomData(){
        this._resetRoom();
        this._resetLeftPlayData();
        this._resetRightPlayData();
    },
    _resetRoom(){
        this.roomData.isDisconnect = false;
        this.roomData.playState = Poker.GamePlayState.None;
        this.roomData.gemPlayNum = 0;
        this.roomData.mul.init = 1;
        this.roomData.mul.vc = 1;
        this.roomData.mul.grab = 1;
        this.roomData.mul.bc = 1;
        this.roomData.mul.bomb = 1;
        this.roomData.mul.spring = 1;
        this.roomData.mul.lo = 1;
        this.roomData.mul.u1 = 1;
        this.roomData.mul.u2 = 1;
        this.roomData.mul.u3 = 1;

        this.roomData.attackPoker.card = [];
        this.roomData.attackPoker.user = 0;

        this.roomData.lastThreeCard = [];

        this._resetExtractPokerData();
    },
    // 重置一下左边玩家数据
    _resetLeftPlayData(){
        this.roomData.leftPlayData.doubleMul = 0;
        this.roomData.leftPlayData.showCardArray = [];
        this.roomData.leftPlayData.remainCardNum = 0;
        this.roomData.leftPlayData.isShowCard = false;
        this.roomData.leftPlayData.isLandlord = null;
        this.roomData.leftPlayData.isRobot = false;
        this.roomData.leftPlayData.ready = false;

    },
    // 重置一下右边玩家数据
    _resetRightPlayData(){
        this.roomData.rightPlayData.doubleMul = 0;
        this.roomData.rightPlayData.showCardArray = [];
        this.roomData.rightPlayData.remainCardNum = 0;
        this.roomData.rightPlayData.isShowCard = false;
        this.roomData.rightPlayData.isLandlord = null;
        this.roomData.rightPlayData.isRobot = false;
        this.roomData.rightPlayData.ready = false;
    },
    // 重置一下自己玩家数据
    restSelfPlayData(){
        this.roomData.selfPlayData.doubleMul = 0;
        this.roomData.selfPlayData.timeOutCount = 0;
        this.roomData.selfPlayData.isShowCard = false;
        this.roomData.selfPlayData.isLandlord = null;
        this.roomData.selfPlayData.isRobot = false;
        this.roomData.selfPlayData.ready = false;
        this.roomData.selfPlayData.isBeganPriority = false;
        this.roomData.selfPlayData.cardIDArray = [];
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnUpdateLandlordState, null);
    },
    // 清理房间数据
    cleanRoomData(){
        GameNextReadyData.cleanData();
        this._cleanRoomData();
        this._cleanSelfPlayData();
        this.cleanLeftPlayerData();
        this.cleanRightPlayerData();
    },
    // 比赛场结束
    raceOver(){
        this.roomData.selfPlayData.raceScore = 0;
        this.roomData.leftPlayData.raceScore = 0;
        this.roomData.rightPlayData.raceScore = 0;
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
    },
    _cleanRoomData(){
        this.roomData.isDisconnect = false;
        this.roomData.playState = Poker.GamePlayState.None;
        this.roomData.mul.init = 1;
        this.roomData.mul.vc = 1;
        this.roomData.mul.grab = 1;
        this.roomData.mul.bc = 1;
        this.roomData.mul.bomb = 1;
        this.roomData.mul.spring = 1;
        this.roomData.mul.lo = 1;
        this.roomData.mul.u1 = 1;
        this.roomData.mul.u2 = 1;
        this.roomData.mul.u3 = 1;

        this.roomData.attackPoker.card = [];
        this.roomData.attackPoker.user = 0;

        this.roomData.lastThreeCard = [];

        this.roomData.type = 0;
        this.roomData.roomInfo = null;
        this.roomData.roomID = 0;
        this.roomData.gemPlayNum = 0;

        this._resetExtractPokerData();
    },
    _resetExtractPokerData(){
        this.roomData.extractData.data = [];
        this.roomData.extractData.nextUser = 0;
        this.roomData.extractData.userArr = [];
    },
    // 清理自己玩家的数据
    _cleanSelfPlayData(){
        this.roomData.selfPlayData.doubleMul = 0;
        this.roomData.selfPlayData.timeOutCount = 0;
        this.roomData.selfPlayData.isShowCard = false;
        this.roomData.selfPlayData.isLandlord = null;
        this.roomData.selfPlayData.isRobot = false;
        this.roomData.selfPlayData.ready = false;
        this.roomData.selfPlayData.isBeganPriority = false;
        this.roomData.selfPlayData.cardIDArray = [];
        this.roomData.selfPlayData.raceScore = 0;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnUpdateLandlordState, null);
    },
    // 清理左边玩家数据
    cleanLeftPlayerData(){
        this.roomData.leftPlayData.gem = 0;
        this.roomData.leftPlayData.gold = 0;
        this.roomData.leftPlayData.head = "";
        this.roomData.leftPlayData.image = 0;
        this.roomData.leftPlayData.raceScore = 0;
        this.roomData.leftPlayData.name = "";
        this.roomData.leftPlayData.continueWinNum = 0;
        this.roomData.leftPlayData.totalPlayNum = 0;
        this.roomData.leftPlayData.winRate = 0;
        this.roomData.leftPlayData.showCardArray = [];
        this.roomData.leftPlayData.remainCardNum = 0;
        this.roomData.leftPlayData.isShowCard = false;
        this.roomData.leftPlayData.isLandlord = null;
        this.roomData.leftPlayData.isRobot = false;
        this.roomData.leftPlayData.ready = false;
        this.roomData.leftPlayData.doubleMul = 0;
    },
    // 清理右边玩家数据
    cleanRightPlayerData(){
        this.roomData.rightPlayData.gem = 0;
        this.roomData.rightPlayData.gold = 0;
        this.roomData.rightPlayData.head = "";
        this.roomData.rightPlayData.image = 0;
        this.roomData.rightPlayData.raceScore = 0;
        this.roomData.rightPlayData.name = "";
        this.roomData.rightPlayData.continueWinNum = 0;
        this.roomData.rightPlayData.totalPlayNum = 0;
        this.roomData.rightPlayData.winRate = 0;
        this.roomData.rightPlayData.showCardArray = [];
        this.roomData.rightPlayData.remainCardNum = 0;
        this.roomData.rightPlayData.isShowCard = false;
        this.roomData.rightPlayData.isLandlord = null;
        this.roomData.rightPlayData.isRobot = false;
        this.roomData.rightPlayData.ready = false;
        this.roomData.rightPlayData.doubleMul = 0;
    },

    // 处理倍数数据
    // isNotifySHowCardMulChange 当恢复场景的时候是否提示名牌倍数变化,但是倍率还是要更新的
    _dealRoomMulData(data, isNotifySHowCardMulChange = true){
        if (!data.mul) {
            return;
        }
        // 初始倍数
        if (data.mul.init) {
            this.roomData.mul.init = data.mul.init;
        }
        // 明牌倍数
        if (data.mul.vc) {
            if (this.roomData.mul.vc != data.mul.vc) {
                if (isNotifySHowCardMulChange) {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerMul, data.mul.vc);// 明牌倍数变化
                } else {
                    console.log("不显示明牌倍数变化");
                }
                //var data ={show:isNotifySHowCardMulChange, mul:data.mul.vc};
                //ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerMul, data);// 明牌倍数变化
            }
            this.roomData.mul.vc = data.mul.vc;
        }
        // 抢地主
        if (data.mul.grab) {
            this.roomData.mul.grab = data.mul.grab;
        }
        // 底牌
        if (data.mul.bc) {
            //if (this.roomData.mul.bc != data.mul.bc) {
            //}
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerMul_BackCard, data.mul.bc);// 底牌倍数变化
            this.roomData.mul.bc = data.mul.bc;
        }
        // 炸弹
        if (data.mul.bomb) {
            this.roomData.mul.bomb = data.mul.bomb;
        }
        if (data.mul.spring) {
            this.roomData.mul.spring = data.mul.spring;
            if (this.roomData.mul.spring > 1) {
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerSpring, null);
            }
        }
        // 加倍阶段产生的(加倍/不加倍)
        if (data.mul.lo) {
            this.roomData.mul.lo = data.mul.lo;
        }
        if (data.mul.u1) {
            this.roomData.mul.u1 = data.mul.u1;
            this.roomData.leftPlayData.doubleMul = data.mul.u1;
        }
        if (data.mul.u2) {
            this.roomData.mul.u2 = data.mul.u2;
            this.roomData.rightPlayData.doubleMul = data.mul.u2;
        }
        if (data.mul.u3) {
            this.roomData.mul.u3 = data.mul.u3;
            this.roomData.selfPlayData.doubleMul = data.mul.u3;
        }
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnUpdateMul, null);
    },
    // 处理谁是地主
    _dealEnterLandlord(landlord){
        if (landlord == 1) {
            this.roomData.leftPlayData.isLandlord = true;
            this.roomData.rightPlayData.isLandlord = false;
            this.roomData.selfPlayData.isLandlord = false;
        } else if (landlord == 2) {
            this.roomData.rightPlayData.isLandlord = true;
            this.roomData.leftPlayData.isLandlord = false;
            this.roomData.selfPlayData.isLandlord = false;
        } else if (landlord == 3) {
            this.roomData.selfPlayData.isLandlord = true;
            this.roomData.leftPlayData.isLandlord = false;
            this.roomData.rightPlayData.isLandlord = false;
        }
    },


    _dealSendPokerData(data){
        // 自己手牌数据
        var selfHandCard = data.u3.toString();
        if (selfHandCard && selfHandCard.length > 0) {
            this.roomData.selfPlayData.cardIDArray = selfHandCard.toString().split(',');
        }
        // 左右玩家明牌数据
        var leftShowCardArray = data.u1;
        if (leftShowCardArray && leftShowCardArray.length > 0) {// 防止空字符串的问题""
            this.roomData.leftPlayData.isShowCard = true;
            this.roomData.leftPlayData.showCardArray = leftShowCardArray.toString().split(',');
        }
        var rightShowCardArray = data.u2;
        if (rightShowCardArray && rightShowCardArray.length > 0) {
            this.roomData.rightPlayData.isShowCard = true;
            this.roomData.rightPlayData.showCardArray = rightShowCardArray.toString().split(',');
        }

        this.roomData.gemPlayNum = data.num;// U钻场第几局
        // 房间类型
        if (data.type == "1") {
            this.roomData.type = Poker.GameRoomType.Gold;
        } else if (data.type == "2") {
            this.roomData.type = Poker.GameRoomType.Gem;
        }
        // 房间每个人金币
        if (data.up) {
            this.roomData.leftPlayData.gold = data.up.u1;
            this.roomData.rightPlayData.gold = data.up.u2;
            this.playData.gold = data.up.u3;
        }
        // 倍数情况
        this._dealRoomMulData(data);
    },
    readyForBegan(){
        var b = GameNextReadyData.isShowCardBegan;
        if (b) {
            this.roomData.selfPlayData.isShowCard = true;
        }

        GameNextReadyData.cleanData();
    },
    // 获取用户使用的sceneID
    getUseSceneId(){
        return this.playData.scene;
    },
    // 根据角色类型判断是否胜利
    judgeGameIsWin(winRoleType){
        var isWin = false;
        var selfIsLandLord = this.roomData.selfPlayData.isLandlord;
        if (selfIsLandLord) {
            if (winRoleType == Poker.GameRoleType.LandLord) {//胜利:  自己是地主,赢得是地主
                isWin = true;
            } else if (winRoleType == Poker.GameRoleType.Farmer) {//失败:  自己是地主,赢得是农民
                isWin = false;
            }
        } else {
            if (winRoleType == Poker.GameRoleType.LandLord) {//失败: 自己是农民,赢得是地主
                isWin = false;
            } else if (winRoleType == Poker.GameRoleType.Farmer) {// 胜利: 自己是农民,赢得是农民
                isWin = true;
            }
        }
        return isWin;
    },
    initGameDataEvent(){
        // todo 重新登陆重复注册消息的问题,主要还是匿名函数导致的
        this.isForceOutLine = false;//强制下线
        this.isInitiativeOutLine = false;// 主动断线
        this.isReConnectServer = false;// 是否正在重连服务器

        this.isResponseBackKey = false;
        this.isRobotByHide = false;

        ObserverMgr.removeEventListenerWithObject(this);
        ObserverMgr.addEventListener(GameNetMsg.recv.OnOutLine.msg, function (msg, data) {
            this.isForceOutLine = true;
        }, this);
        ObserverMgr.addEventListener(GameNetMsg.recv.CertToken.msg, function (msg, data) {
            //token [str] 新的游戏token,下次重连的时候要用它作为游戏Token
            //key   [str] 协议密钥 以后的消息加密都用它
            //iv    [str] aes加密时用向量参数
            window.gameAesKey = window.CryptoJS.enc.Utf8.parse(data['key']);
            window.gameAesIv = window.CryptoJS.enc.Utf8.parse(data['iv']);
            var token = data['token'];
            require('GameStaticCfg').setReconnectGameToken(token);
            require('NetSocketMgr').openHeartBeat();
            ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.CertSuccess, null);
        }, this);
        ObserverMgr.addEventListener(GameNetMsg.recv.SetHead.msg, function (msg, data) {
            var ownHeadArr = data['imgs'];// 用户已经购买的所有角色
            var costUp = data['costup'];// 花费的金币
            this.playData.image = data['img'];// 更换后的头像
            this.playData.gold = data['up'];// 最新的金币
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        ObserverMgr.addEventListener(GameNetMsg.recv.SetGameScene.msg, function (msg, data) {
            // 购买场景
            var costUp = data['costup'];// 花费的金币
            var ownHeadArr = data['scenes'];// 用户已经购买的所有场景
            this.playData.scene = data['scene'];
            this.playData.gold = data['up'];// 最新的金币
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 获取角色信息
        ObserverMgr.addEventListener(GameNetMsg.recv.GetUserInfo.msg, function (msg, data) {
            //this.playData.name = decodeURI(data['name']);
            this.playData.name = data['name'];
            GameLocalStorage.setName(this.playData.name);
            this.playData.image = data.img;
            this.playData.head = data.head;
            this.playData.gold = data.up;

            this.playData.continueWinNum = data.cw;
            this.playData.winNum = data.wn;
            this.playData.totalPlayNum = data.ct;

            this.playData.gem = data.ud;
            this.playData.type = data.type;
            this.playData.brokeNum = data.br;

            this.playData.guide = data.guide;
            var defaultSceneId = JsonFileMgr.getDefaultSceneID();
            this.playData.scene = data['scene'] || defaultSceneId;

            this.playData.sex = (data.img == 1 || data.img == 3) ? 'w' : 'm';
        }, this);
        // 获取系统配置
        ObserverMgr.addEventListener(GameNetMsg.recv.GetSysCfg.msg, function (msg, data) {
            var goldInfo = data.cp;
            var gemInfo = data.sp;

            // 金币场
            this.roomInfo.goldRoom = [];
            for (var i = 0; i < goldInfo.length; i++) {
                var goldData = goldInfo[i].split('|');
                var goldItem = {
                    id: goldData[0],
                    underPoint: goldData[1],
                    initMul: goldData[2],
                    minEnterPoint: goldData[3],
                    maxEnterPoint: goldData[4],
                    ticket: goldData[5],
                    maxEarn: goldData[6],
                };
                this.roomInfo.goldRoom.push(goldItem);
            }

            // 竞技场
            this.roomInfo.gemRoom = [];
            for (var i = 0; i < gemInfo.length; i++) {
                var gemData = gemInfo[i].split('|');
                var gemItem = {
                    id: gemData[0],
                    underPoint: gemData[1],
                    initMul: gemData[2],
                    gem: gemData[3],
                    ticket: gemData[4],
                    gamePoint: gemData[5],
                };
                this.roomInfo.gemRoom.push(gemItem);
            }
        }, this);
        ObserverMgr.addEventListener(GameNetMsg.recv.ChangeDesk.msg, function (msg, data) {
            this.cleanLeftPlayerData();
            this.cleanRightPlayerData();
            GameNextReadyData.cleanData();//当换桌的时候,如果上一局选择的是明牌开始,则新的一桌取消掉明牌开始的情况
        }, this);
        // 更新金币
        ObserverMgr.addEventListener(GameNetMsg.recv.UpdateMoney.msg, function (msg, data) {
            // 金币
            if (data.up) {
                this.playData.gold = parseInt(data.up.toString());
            }
            // U钻
            if (data.ud) {
                this.playData.gem = parseInt(data.ud.toString());
            }
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 破产
        ObserverMgr.addEventListener(GameNetMsg.recv.OnBankrupt.msg, function (msg, data) {
            this.playData.gold = parseInt(data.up.toString());
            this.playData.brokeNum = parseInt(data.num.toString());
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 充值成功
        ObserverMgr.addEventListener(GameNetMsg.recv.PaySuccess.msg, function (msg, data) {
            this.playData.gold = parseInt(data.up.toString());
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 当前房间匹配到用户
        ObserverMgr.addEventListener(GameNetMsg.recv.DeskEnterUser.msg, function (msg, data) {
            this.roomData.roomID = data.room;

            var leftPlayData = data.u1;
            if (leftPlayData) {
                this.roomData.leftPlayData.name = decodeURI(leftPlayData.name);
                this.roomData.leftPlayData.gold = leftPlayData.up;
                this.roomData.leftPlayData.totalPlayNum = leftPlayData.ct;
                this.roomData.leftPlayData.winRate = leftPlayData.wr;
                this.roomData.leftPlayData.continueWinNum = leftPlayData.cw;
                this.roomData.leftPlayData.image = leftPlayData.img;
                this.roomData.leftPlayData.head = leftPlayData.head;
                this.roomData.leftPlayData.ready = leftPlayData.isr == "1" ? true : false;
                if (this.roomData.type == Poker.GameRoomType.Gem) {
                    this.roomData.leftPlayData.raceScore = 0;
                }

                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnLeftUserEnter, null);
            }

            var rightPlayData = data.u2;
            if (rightPlayData) {
                this.roomData.rightPlayData.name = decodeURI(rightPlayData.name);
                this.roomData.rightPlayData.gold = rightPlayData.up;
                this.roomData.rightPlayData.totalPlayNum = rightPlayData.ct;// 总对局数
                this.roomData.rightPlayData.winRate = rightPlayData.wr;// 胜率
                this.roomData.rightPlayData.continueWinNum = rightPlayData.cw;// 连胜局数
                this.roomData.rightPlayData.image = rightPlayData.img;
                this.roomData.rightPlayData.head = rightPlayData.head;
                this.roomData.rightPlayData.ready = rightPlayData.isr == "1" ? true : false;
                if (this.roomData.type == Poker.GameRoomType.Gem) {
                    this.roomData.rightPlayData.raceScore = 0;
                }

                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnRightUserEnter, null);
            }
        }, this);
        // 开始游戏
        ObserverMgr.addEventListener(GameNetMsg.recv.BeganGame.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.WaitPlayerJoin;// 等待对手阶段
            // 游戏内更换场次,更新roomInfo
            //this.roomData.roomID = data.room;
            require('GameDataUtils').updateRoomData(data.room);
        }, this);
        // 初始化比赛场积分
        ObserverMgr.addEventListener(GameLocalMsg.Play.OnGetRaceInitScore, function (msg, data) {
            this.roomData.selfPlayData.raceScore = 5000;
            this.roomData.leftPlayData.raceScore = 5000;
            this.roomData.rightPlayData.raceScore = 5000;
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 游戏正式开始
        ObserverMgr.addEventListener(GameLocalMsg.Play.OnGamePlay, function (msg, data) {
            // 重置一下场内玩家的数据,开始新的一局
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGameOverContinuePlay, null);
            this._dealSendPokerData(data);
            this.roomData.playState = Poker.GamePlayState.SendPoker;// OnGameOverContinuePlay 消息会重置游戏状态,这里重新设置下
            this.readyForBegan();// 处理明牌开始的情况
        }, this);
        // 发牌
        ObserverMgr.addEventListener(GameNetMsg.recv.SendPoker.msg, function (msg, data) {
            //  发牌处理不能依赖网络
            var type = this.roomData.type;
            var num = data.num;
            if (type == Poker.GameRoomType.Gem) {
                if (num > 1) {
                    // 缓存这个data
                    require('GameNextRaceReadyData').setSendPokerCacheData(data);
                } else {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGamePlay, data);
                }
            } else {// 金豆场直接发牌开始
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGamePlay, data);
            }
        }, this);
        // 叫地主
        ObserverMgr.addEventListener(GameNetMsg.recv.ShoutLandlord.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.ShoutLandLord;

        }, this);
        // 抢地主
        ObserverMgr.addEventListener(GameNetMsg.recv.RobLandlord.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.RobLandlord;
            if (data.mul && data.mul.grab) {
                var changeMul = data.mul.cur;// 变化倍数
                if (changeMul != null) {
                    // fixme 问服务器为null什么意思
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerMul, changeMul);// 抢地主倍数变化
                }
                this._dealRoomMulData(data);
            }
        }, this);

        // 重新发牌
        ObserverMgr.addEventListener(GameNetMsg.recv.ReSendPoker.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.SendPoker;
            this.restSelfPlayData();// 因为在重新发牌期间可以选择托管,所以重置一下玩家数据
            this._dealSendPokerData(data);
        }, this);
        // 加倍
        ObserverMgr.addEventListener(GameNetMsg.recv.ShoutDouble.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.DoubleStage;// 加倍阶段
            this._dealRoomMulData(data);
        }, this);
        // 确定地主
        ObserverMgr.addEventListener(GameNetMsg.recv.EnsureLandlord.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.DoubleStage;// 加倍阶段
            // 地主
            var landlord = data.lo;
            this._dealEnterLandlord(landlord);
            // 底牌
            var lastThreeCard = data.bc.toString();
            if (lastThreeCard.length > 0) {
                this.roomData.lastThreeCard = lastThreeCard.split(',');
            } else {
                this.roomData.lastThreeCard = [];
            }
            // 倍数
            if (data.mul) {
                this._dealRoomMulData(data);
            }
        }, this);
        // 玩家出牌
        ObserverMgr.addEventListener(GameNetMsg.recv.PlayerOutPoker.msg, function (msg, data) {
            var upUser = data.user;
            var upUserCard = data.card.toString();

            this._dealRoomMulData(data);

            if (upUserCard != "") {//上个玩家出牌了
                this.roomData.attackPoker.card = upUserCard.split(',');
                this.roomData.attackPoker.user = upUser;
            } else {// 上个玩家没有出牌

            }

            var nextUser = data.nt;
            if (nextUser == 3) {// 轮到自己出牌了
                if (this.roomData.attackPoker.user == 3) {// 上次出的牌是自己的,那么自己就拿到了出牌权
                    this.roomData.selfPlayData.isBeganPriority = true;
                    //console.log("新的一轮开始了");
                } else {// 上次出的牌不是自己的,那么接着上家的牌出
                    this.roomData.selfPlayData.isBeganPriority = false;
                }
            } else {

            }
        }, this);
        // 托管
        ObserverMgr.addEventListener(GameNetMsg.recv.EntrustPlay.msg, function (msg, data) {
            var user = data.user;
            var isEntrust = data.status == 1 ? true : false;
            if (user == 1) {
                this.roomData.leftPlayData.isRobot = isEntrust;
            } else if (user == 2) {
                this.roomData.rightPlayData.isRobot = isEntrust;
            } else if (user == 3) {
                this.roomData.selfPlayData.isRobot = isEntrust;
            }
        }, this);
        // 明牌
        ObserverMgr.addEventListener(GameNetMsg.recv.DisplayPoker.msg, function (msg, data) {
            var type = data.type;// type 明牌类型， 1 明牌开始   2 发牌时明牌  3 地主发牌时明牌
            var user = data.user;
            var cardStr = data.card.toString();
            var showCardArr = cardStr.split(',');
            if (user == 1) {
                this.roomData.leftPlayData.isShowCard = true;
                this.roomData.leftPlayData.showCardArray = showCardArr;
            } else if (user == 2) {
                this.roomData.rightPlayData.isShowCard = true;
                this.roomData.rightPlayData.showCardArray = showCardArr;
            } else if (user == 3) {
                this.roomData.selfPlayData.isShowCard = true;
            }
            // 明牌倍数变化
            var mul = data.mul;
            if (mul) {
                this._dealRoomMulData(data);
            }
        }, this);
        //  金豆场 结算
        ObserverMgr.addEventListener(GameNetMsg.recv.GameOver_NormalMatch.msg, function (msg, data) {

            // 服务器结算校验
            var reduceMoney = data['reward']['u3'];// 本场结算变化的money
            var lastMoney = this.playData.gold; // 结算前的money
            var nowMoney = data['u3'];// 结算后的money
            console.log(msg + ": " + lastMoney + reduceMoney.toString() + "=" + nowMoney);
            if (lastMoney + reduceMoney == nowMoney) {
                console.log(msg + ": 服务器结算ok");
            } else {
                console.log(msg + ": 服务器结算error");
            }

            this.roomData.playState = Poker.GamePlayState.GameOver;
            this.roomData.leftPlayData.gold = data.u1;
            this.roomData.rightPlayData.gold = data.u2;
            this.playData.gold = data.u3;
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
            this._dealRoomMulData(data);
        }, this);
        // U钻场单局 结算
        ObserverMgr.addEventListener(GameNetMsg.recv.GameOver_RoundMatch.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.GameOver;
            this.roomData.leftPlayData.raceScore = data.u1;
            this.roomData.rightPlayData.raceScore = data.u2;
            this.roomData.selfPlayData.raceScore = data.u3;
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
            this._dealRoomMulData(data);
        }, this);
        // 比赛场最终结算
        ObserverMgr.addEventListener(GameNetMsg.recv.GameOver_CompeteMatch.msg, function (msg, data) {
            // todo[dataCache] 这个是因为触发抽卡,抽卡数据,结算结果接连发过来客户端会出现问题,地主失败,农民抽牌,2个农民都退出游戏,会触发这种情况
            require("LuckyCardCacheData").data = data;
            this.roomData.playState = Poker.GamePlayState.GameOver;
            if (this.roomData.type == Poker.GameRoomType.Gem) {
                this.playData.gem = data.nowud;

                this.roomData.leftPlayData.raceScore = data.u1;
                this.roomData.rightPlayData.raceScore = data.u2;
                this.roomData.selfPlayData.raceScore = data.u3;
            }
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
        }, this);
        // 用户离开房间
        ObserverMgr.addEventListener(GameNetMsg.recv.DeskUserLeave.msg, function (msg, data) {
            if (data.user == 1) {
                this.cleanLeftPlayerData();
            } else if (data.user == 2) {
                this.cleanRightPlayerData();
            }
        }, this);
        // 定时器时间到
        ObserverMgr.addEventListener(Poker.Event.TimerComplete, function (msg, data) {
            var isRobot = this.roomData.selfPlayData.isRobot;
            if (isRobot == false) {
                if (data == GameLocalMsg.Play.OnTimeOverPutCardWithAfter ||
                    data == GameLocalMsg.Play.OnTimeOverPutCardWithBegan ||
                    data == GameLocalMsg.Play.OnTimeOverPutCardWithNoBig) {

                    this.roomData.selfPlayData.timeOutCount++;
                    var timeOutCount = this.roomData.selfPlayData.timeOutCount;
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerTimeOutPutCard, timeOutCount);
                }
            }
        }, this);
        ObserverMgr.addEventListener(GameLocalMsg.Play.OnResetTimeOutCount, function (msg, data) {
            this.roomData.selfPlayData.timeOutCount = 0;// 托管超时次数为0
            console.log("重置超时次数");
        }, this);
        // 触发抽牌
        ObserverMgr.addEventListener(GameNetMsg.recv.TriggerExtractPoker.msg, function (msg, data) {
            this.roomData.extractData.userArr = data.users.toString().split(',');
            this.roomData.extractData.nextUser = data.nt;
            this.roomData.extractData.data = [];
        }, this);

        // 抽牌
        ObserverMgr.addEventListener(GameNetMsg.recv.ExtractPoker.msg, function (msg, data) {
            this.roomData.extractData.nextUser = data.nt;
            this.roomData.extractData.data.push({pos: data.pos, card: data.card, user: data.user});
        }, this);

        // 断线恢复重连
        ObserverMgr.addEventListener(GameNetMsg.recv.ResumeEnterHome.msg, function (msg, data) {
            this.roomData.playState = Poker.GamePlayState.None;
            // 公共处理
            this._dealReConnectPlayerBaseData(data);

            var currentDo = data.cudo;// 当前的操作
            var currentUser = data.cu;// 当前操作的用户是谁
            if (currentDo == 1) {//发牌阶段
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.SendPoker;
                this._dealPlayerCardData(data);
                this._onResumeCurDo1(data);// 发牌
            } else if (currentDo == 2) {// 等待检验发牌完毕
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this._dealPlayerCardData(data);
                this._onResumeCurDo2(data);
            } else if (currentDo == 3) {//叫地主
                this.roomData.playState = Poker.GamePlayState.ShoutLandLord;
                this._dealPlayerCardData(data);
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);
                ObserverMgr.dispatchMsg(GameNetMsg.recv.ShoutPoker.msg, currentUser);
            } else if (currentDo == 4) {//抢地主
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.RobLandlord;
                this._dealPlayerCardData(data);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);
                // fixme 无法得知抢谁的地主
                this._onResumeCurDo4(data);
            } else if (currentDo == 5) {//亮底牌,加倍
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.DoubleStage;
                this._dealRoomMulData(data, false);
                this._dealEnterLandlord(data.lo);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeShowLandlordAction, null);

                this._dealLastThreeCard(data);
                this._dealPlayerCardData(data);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);

                this._onResumeCurDo5(data);
            } else if (currentDo == 6) {//等待地主开始
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
                this._dealRoomMulData(data, false);
                this._dealEnterLandlord(data.lo);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowIdentity, null);
                this._dealLastThreeCard(data);
                this._dealPlayerCardData(data);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeWaitLandlordPutCard, null);
            } else if (currentDo == 7) {//打牌阶段
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
                // todo 正确的做法是把三个人的状态给我,而不是客户端自己计算
                this._dealRoomMulData(data, false);
                this._dealEnterLandlord(data.lo);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowIdentity, null);

                this._dealLastThreeCard(data);
                this._dealLastOneCard(data);
                this._dealPlayerCardData(data);
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);

                var putCardUser = this.roomData.attackPoker.user;
                var putCard = this.roomData.attackPoker.card.toString();

                // fixme 计算不出牌的人,出牌顺序: 3-2-1
                var notPutMan = [];
                if (putCardUser == 3 && currentUser == 3) {
                    // 1,2不出
                    notPutMan.push(1);
                    notPutMan.push(2);
                } else if (putCardUser == 2 && currentUser == 2) {
                    // 1,3不出
                    notPutMan.push(1);
                    notPutMan.push(3);
                } else if (putCardUser == 1 && currentUser == 1) {
                    // 2,3不出
                    notPutMan.push(2);
                    notPutMan.push(3);
                } else if (putCardUser == 1 && currentUser == 2) {
                    // 3 不出
                    notPutMan.push(3);
                } else if (putCardUser == 2 && currentUser == 3) {
                    // 1 不出
                    notPutMan.push(1);
                } else if (putCardUser == 3 && currentUser == 1) {
                    // 2 不出
                    notPutMan.push(2);
                }
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumePutPokerStatus, notPutMan);

                // 本地构建一个出牌的消息
                if (putCardUser == currentUser) {// 如果要压制的牌是自己,又轮到自己出牌,说明是新的一局开始,
                    putCard = [];
                    putCardUser = 0;
                }
                var num = 0;
                if (putCardUser == 1) {
                    num = this.roomData.leftPlayData.remainCardNum;
                } else if (putCardUser == 2) {
                    num = this.roomData.rightPlayData.remainCardNum;
                } else if (putCardUser == 3) {
                    num = this.roomData.selfPlayData.cardIDArray.length;
                    ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeSelfPutCard, this.roomData.attackPoker.card);
                }
                var localNetData = {
                    user: putCardUser,
                    card: putCard,
                    num: num,
                    nt: currentUser,
                };
                ObserverMgr.dispatchMsg(GameNetMsg.recv.PlayerOutPoker.msg, localNetData);

            } else if (currentDo == 8) {//一局结束
                this.roomData.playState = Poker.GamePlayState.GameOver;
                console.log("一局结束");
                this._dealEnterLandlord(data.lo);
                this._dealLastThreeCard(data);
            } else if (currentDo == 9) {//抽牌
                ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false);// 隐藏门票
                this.roomData.playState = Poker.GamePlayState.ExtractPoker;
                this._resetExtractPokerData();
                ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowRaceResultOverWithLuckyCard, null);

                var data1 = {users: data.users, nt: data.cu};
                ObserverMgr.dispatchMsg(GameNetMsg.recv.TriggerExtractPoker.msg, data1);
                var extractData = data.cards;
                for (var k = 0; k < extractData.length; k++) {
                    var itemData = extractData[k];
                    var sendData = {
                        nt: data.cu,
                        pos: itemData.pos,
                        card: itemData.card,
                        user: itemData.user
                    };
                    ObserverMgr.dispatchMsg(GameNetMsg.recv.ExtractPoker.msg, sendData);
                }
            }
        }, this);
    },

    _onResumeCurDo1(data){
        var localNetData1 = {
            u1: this.roomData.leftPlayData.showCardArray,
            u2: this.roomData.rightPlayData.showCardArray,
            u3: this.roomData.selfPlayData.cardIDArray,
            num: data.num,
            type: data.type,
            up: {
                u1: data.u1.up,
                u2: data.u2.up,
                u3: this.playData.gold,
            },
            mul: data.mul,
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ReSendPoker.msg, localNetData1);
    },
    _onResumeCurDo2(data){
        var currentUser = data.cu;// 当前操作的用户是谁
        if (currentUser == 3) {//还没有发送校验，需要客户端发送
            // 发牌
            var localNetData2 = {
                u1: this.roomData.leftPlayData.showCardArray,
                u2: this.roomData.rightPlayData.showCardArray,
                u3: this.roomData.selfPlayData.cardIDArray,
                num: data.num,
                type: data.type,
                up: {
                    u1: data.u1.up,
                    u2: data.u2.up,
                    u3: this.playData.gold,
                },
                mul: data.mul,
            };
            ObserverMgr.dispatchMsg(GameNetMsg.recv.ReSendPoker.msg, localNetData2);
        } else if (currentUser == 0) {//已经发送过了，正在等待其他用户,显示一下手牌
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeHandPoker, null);
        }
    },
    _onResumeCurDo4(data){
        var localNetData = {
            user: null,// 做抢地主操作的用户
            grab: null,// 上个人是否抢地主
            nt: data.cu,
            mul: {
                grab: data.mul.grab,
                cur: null,// fixme 本次操作变化的倍数
            }
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.RobLandlord.msg, localNetData);

    },
    _onResumeCurDo5(data){
        var doData = {
            actBtn: Poker.DoubleType.No,// 点击的什么类型的按钮
        };
        // fixme 缺少用户点击的加倍按钮情况
        // TODO 没有办法知道用户点击的加倍按钮情况,目前是根据mul.u1 计算的,是有问题的
        var currentUser = data.cu;
        if (currentUser == 3) {//表示还自己没有做加倍操作
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnWaitPlayerSelectDouble, true);
            // 自己显示加倍
            var syncData = {
                state: Poker.GamePlayState.DoubleStage,
                time: 15,
                event: GameLocalMsg.Play.OnTimeOverDouble,
            };
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
        } else if (currentUser == 0) {//表示已经已经做过加倍操作，正在等待其他用户
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnWaitPlayerSelectDouble, true);
        }
    },
    // 处理底牌
    _dealLastThreeCard(data){
        var card = data.bc.toString();
        this.roomData.lastThreeCard = card.split(',');
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeShowLastThreeCard, null);
    },
    _dealLastOneCard(data){
        // 上个人出的牌
        var atkCard = data.pc.toString();
        this.roomData.attackPoker.card = atkCard.split(',');
        this.roomData.attackPoker.user = data.pu;

    },
    // 处理玩家基本的信息
    _dealReConnectPlayerBaseData(data){
        // 房间类型
        // fixme 设置roomInfo
        this.roomData.type = data.type;
        this.roomData.gemPlayNum = data.num;
        // 左边玩家数据
        var leftPlayData = data.u1;
        if (leftPlayData) {
            this.roomData.leftPlayData.name = decodeURI(leftPlayData.name);
            this.roomData.leftPlayData.gold = leftPlayData.up;
            this.roomData.leftPlayData.totalPlayNum = leftPlayData.ct;
            this.roomData.leftPlayData.winRate = leftPlayData.wr;
            this.roomData.leftPlayData.continueWinNum = leftPlayData.cw;
            this.roomData.leftPlayData.image = leftPlayData.img;
            this.roomData.leftPlayData.head = leftPlayData.head;
            this.roomData.leftPlayData.raceScore = leftPlayData.point || 0;// 积分场左右玩家积分情况
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnLeftUserEnter, null);
        }
        // 右边玩家数据
        var rightPlayData = data.u2;
        if (rightPlayData) {
            this.roomData.rightPlayData.name = decodeURI(rightPlayData.name);
            this.roomData.rightPlayData.gold = rightPlayData.up;
            this.roomData.rightPlayData.totalPlayNum = rightPlayData.ct;
            this.roomData.rightPlayData.winRate = rightPlayData.wr;
            this.roomData.rightPlayData.continueWinNum = rightPlayData.cw;
            this.roomData.rightPlayData.image = rightPlayData.img;
            this.roomData.rightPlayData.head = rightPlayData.head;
            this.roomData.rightPlayData.raceScore = rightPlayData.point || 0;// 积分场左右玩家积分情况
            ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnRightUserEnter, null);
        }
        this.roomData.selfPlayData.raceScore = data.point || 0;
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.UpdateMoney, null);
    },
    // 处理玩家明牌数据
    _dealPlayerShowCardData(data){
        var showCardUser = data.vc.toString();
        var showCardUserArr = showCardUser.split(',');
        for (var k = 0; k < showCardUserArr.length; k++) {
            var item = showCardUserArr[k];
            if (item == 1) {
                this.roomData.leftPlayData.isShowCard = true;
                var leftShowCard = data.c1 || "";
                if (leftShowCard.length > 0) {
                    this.roomData.leftPlayData.showCardArray = leftShowCard.split(',');
                } else {
                    this.roomData.leftPlayData.showCardArray = [];
                }
            } else if (item == 2) {
                this.roomData.rightPlayData.isShowCard = true;
                var rightShowCard = data.c2 || "";
                if (rightShowCard.length > 0) {
                    this.roomData.rightPlayData.showCardArray = rightShowCard.split(',');
                } else {
                    this.roomData.rightPlayData.showCardArray = [];
                }
            } else if (item == 3) {
                this.roomData.selfPlayData.isShowCard = true;
            }
        }
    },
    // 处理玩家剩余牌量

    // 处理3位玩家的牌数据
    _dealPlayerCardData(data){
        // 明牌玩家处理
        this._dealPlayerShowCardData(data);
        // 处理左边玩家的牌的数据
        var leftRemainCardNum = data.c1n;
        var leftIsRobot = data.c1s;
        this.roomData.leftPlayData.remainCardNum = leftRemainCardNum;
        this.roomData.leftPlayData.isRobot = leftIsRobot == 0 ? false : true;
        // 右边玩家牌的数据
        var rightRemainCardNum = data.c2n;
        var rightIsRobot = data.c2s;
        this.roomData.rightPlayData.remainCardNum = rightRemainCardNum;
        this.roomData.rightPlayData.isRobot = rightIsRobot == 0 ? false : true;

        var selfHandCard = data.c3.toString();
        this.roomData.selfPlayData.cardIDArray = selfHandCard.split(',');

        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumePlayerStatusData, null);
    },
};