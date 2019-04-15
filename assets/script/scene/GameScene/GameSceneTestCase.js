/**
 * 测试用例
 * @type {{}}
 */
var ObserverMgr = require('ObserverMgr');
var GameDataUtils = require('GameDataUtils');
var GameCardMgr = require('GameCardMgr');
var CardAlgorithm = require('CardAlgorithm');
var GameData = require('GameData');
var JsonFileMgr = require('JsonFileMgr');
var AudioMgr = require('AudioMgr');
var GameReady = require('GameReady');

module.exports = {
    onTestEnter(){
        GameData.roomData.rightPlayData.image = 1002;
        GameData.roomData.rightPlayData.isLandlord = true;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnRightUserEnter);
    },

    // 测试出牌特效,飞机炸弹
    // 测试接收玩家出牌
    onTest1(){
        var card = [
            //518, 519,// 王炸
            106, 206, 306, 406,// 炸弹
            //406,// 单张
            //306, 406,// 对子
            //206, 306, 406,// 三张
            //206, 306, 406, 409// 三带一
            //206, 306, 406, 407, 307// 三带二
            //206, 207, 208, 209, 210,// 顺子
            //206, 306, 207, 307, 208, 308, 209, 309, 210, 310,// 双顺
            //206, 306, 406, 207, 307, 407, 208, 308, 408, 209, 309, 409, 210, 310, 410,// 三顺
            // 四带二(6张牌)
            //106, 206, 306, 406, 105, 108,
            //106, 206, 306, 406, 105, 205,
            // 四带二(8张牌)
            //106, 206, 306, 406, 105, 205, 108, 208,
            //106, 206, 306, 406, 105, 205, 305, 405,

            //107, 207, 307, 108, 208, 308, 407, 213,// 二连飞机带翅膀
            //107, 207, 307, 108, 208, 308, 403, 213,// 二连飞机带翅膀

            //106, 206, 306,     107, 207, 307,    108, 208, 308,    407, 213, 408,// 3连飞机带翅膀
            //106, 206, 306, 107, 207, 307, 108, 208, 308, 403, 108, 213,// 3连飞机带翅膀

            //106, 206, 306, 107, 207, 307, 108, 208, 308, 109, 209, 309, 409, 408, 407, 406,// 3连飞机带翅膀
        ];
        var data = {user: 2, card: card, nt: 1, num: 10};
        ObserverMgr.dispatchMsg(GameNetMsg.recv.PlayerOutPoker.msg, data);
    },
    // 测试轮到自己优先出牌者
    onTest2(){
        GameData.playData.image = 2;
        var syncData = {
            state: Poker.GamePlayState.PutPokerWithBegan,
            time: 5,
            event: GameLocalMsg.Play.OnTimeOverPutCardWithBegan,
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
    },

    // 测试发牌
    onTest3(){
        GameData.roomData.gemPlayNum = 2;
        GameData.roomData.type = Poker.GameRoomType.Gold;
        var data = {
            'u3': [
                203,
                103, 203, 303, 403,
                104, 205, 306, 407,
                109, 209, 309, 409,

                112, 212, 312, 412,
                113, 213, 313, 413,
            ],
            'u1': [],
            'u2': [],
            'again': 0,
            'type': 2, // type 类型 1金币场  2u钻场
            'num': 3, // num 如果在u钻场，表示第几局，从1开始 u钻场专用
            'mul': {"init": 15, "vc": 1},
            'up': {'u1': 1000, 'u2': 2000, 'u3': 1111} // 场中用户当前的金币值
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ReSendPoker.msg, data);
    },
    // 测试金豆场结算
    onTest4(){
        GameData.roomData.type = Poker.GameRoomType.Gem;
        GameData.roomData.roomInfo = {
            id: 10,
            underPoint: 10,
            initMul: 15,
            minEnterPoint: 100,
            maxEnterPoint: 0,
            ticket: 0,
            maxEarn: 0
        };
        GameData.playData.image = 1;
        ObserverMgr.dispatchMsg(GameNetMsg.recv.GameOver_NormalMatch.msg,
            {
                win: 2,// win 胜利的一方 1 地主， 2 农民
                reward: {
                    u1: 300,
                    u2: 600,
                    u3: 900,
                },
                mul: {
                    u1: 1,
                    u2: 2,
                    u3: 3,
                },
                u1: 9999,
                u2: 6666,
                u3: 7777,
            });
    },

    onTest51(){
        var data = {
            "cudo": 7,
            "vc": "",
            "type": 1,
            "num": 1,
            "c1s": 0,
            "u1": {
                "name": "%E6%B2%88%E5%AD%90%E6%99%8B",
                "up": 10993600,
                "ct": 50,
                "wr": 2.2727272727273,
                "cw": 4,
                "img": 1002,
                "head": ""
            },
            "c1n": 17,
            "c2s": 0,
            "u2": {
                "name": "%E5%AD%99%E5%A4%A9%E4%BD%91",
                "up": 7669500,
                "ct": 55,
                "wr": 2.6190476190476,
                "cw": 3,
                "img": 1002,
                "head": ""
            },
            "c2n": 8,
            "c3": "313,413,114,214,314,414,116,216,316",
            "c3n": 9,
            "bc": "103,518,519",
            "lo": 2,
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 4,
                "bomb": 2,
                "spring": 1,
                "lo": 1,
                "u1": 1,
                "u2": 2,
                "u3": 1
            },
            "pu": 2,
            "pc": "519,518",
            "cu": 1
        };
        GameData.playData.image = 1;
        GameData.playData.name = "uu";
        GameData._resetExtractPokerData();
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ResumeEnterHome.msg, data);
    },
    // 测试游戏恢复
    onTest5(){
        // 发牌阶段
        var data1 = {
            "cudo": 1,
            "cu": 3,
            "vc": "1",
            "type": 1,
            "num": 1,

            "u1": {"name": "左边玩家", "up": 10270000, "ct": 91, "wr": 1.5423728813559, "cw": 10, "img": 2, "head": ""},
            "c1": "518,413",
            "c1s": 1,
            "c1n": 17,

            "u2": {"name": "右边玩家", "up": 10313500, "ct": 85, "wr": 1.734693877551, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 17,

            "c3": "519,416,414,413,313,113,112,411,110,308,108,208,207,206,305,205,204",
            "c3n": 17,
            "bc": "314,107,412",

            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 1, "u2": 1, "u3": 1
            },
        };
        // 校验牌
        var data2 = {
            "cudo": 2,
            "cu": 3,
            "vc": "1",
            "type": 2,
            "num": 1,

            "u1": {"name": "左边玩家", "up": 10270000, "ct": 91, "wr": 1.5423728813559, "cw": 10, "img": 2, "head": ""},
            "c1": "518,413",
            "c1s": 1,
            "c1n": 17,

            "u2": {"name": "右边玩家", "up": 10313500, "ct": 85, "wr": 1.734693877551, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 17,

            "c3": "519,416,414,413,313,113,112,411,110,308,108,208,207,206,305,205,204",
            "c3n": 17,
            "bc": "314,107,412",

            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 1, "u2": 1, "u3": 1
            },
        };
        // 叫地主测试数据
        var data3 = {
            "cudo": 3,
            "cu": 3,
            "vc": "",
            "type": 2,
            "num": 1,

            "u1": {
                "name": "左边玩家",
                "up": 10217500,
                "ct": 92,
                "wr": 1.5593220338983,
                "cw": 10,
                "img": 2,
                "head": "",
                point: 100
            },
            "c1s": 0,
            "c1n": 17,

            "u2": {
                "name": "右边玩家", "up": 10333000, "ct": 86, "wr": 1.72, "cw": 13, "img": 1, "head": "",
                point: 200
            },

            "c2s": 0,
            "c2n": 17,

            "c3": "519,116,314,114,313,113,412,112,111,109,408,308,307,207,406,106,203",
            "c3n": 17,
            "bc": "105,205,212",
            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 1, "u2": 1, "u3": 1
            },
            point: 300,
        };
        // 抢地主数据
        var data4 = {
            "cudo": 4,
            "cu": 2,
            "vc": "",
            "type": 1,
            "num": 1,

            "u1": {"name": "左边玩家", "up": 10217500, "ct": 92, "wr": 1.5593220338983, "cw": 10, "img": 2, "head": ""},
            "c1s": 0,
            "c1n": 17,

            "u2": {"name": "右边玩家", "up": 10333000, "ct": 86, "wr": 1.72, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 17,

            "c3": "519,116,314,114,313,113,412,112,111,109,408,308,307,207,406,106,203",
            "c3n": 17,
            "bc": "105,205,212",
            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 1, "u2": 1, "u3": 1
            },
        };
        var data41 = {
            "cudo": 4,
            "vc": "",
            "type": 1,
            "num": 1,
            "c3": "416,414,413,411,311,410,310,210,308,108,208,106,206,405,105,204,403",
            "c3n": 17,
            "c1s": 0,
            "u1": {
                "name": 325423,
                "up": 10013500,
                "ct": 8,
                "wr": 2,
                "cw": 3,
                "img": 3,
                "head": ""
            },
            "c1n": 17,
            "c2s": 0,
            "u2": {
                "name": 56546,
                "up": 9639000,
                "ct": 23,
                "wr": 2.3,
                "cw": 3,
                "img": 2,
                "head": ""
            },
            "c2n": 17,
            "bc": "404,306,107",
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 1,
                "spring": 1,
                "lo": 1,
                "u1": 1,
                "u2": 1,
                "u3": 1
            },
            "cu": 2
        };
        // 加倍测试数据
        var data5 = {
            "cudo": 5,
            "cu": 3,
            "vc": "",
            "type": 1,
            "num": 1,

            "u1": {"name": "左边玩家", "up": 10217500, "ct": 92, "wr": 1.5593220338983, "cw": 10, "img": 2, "head": ""},
            "c1s": 0,
            "c1n": 17,

            "u2": {"name": "右边玩家", "up": 10333000, "ct": 86, "wr": 1.72, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 17,

            "c3": "519,116,314,114,313,113,412,112,111,109,408,308,307,207,406,106,203",
            "c3n": 17,

            "lo": 1,
            "bc": "105,205,212",
            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 2, "u2": 1, "u3": 1
            },
        };
        // 等待地主开始
        var data6 = {
            "cudo": 6,
            "cu": 3,
            "vc": "1",
            "type": 2,
            "num": 1,

            "u1": {"name": "左边玩家", "up": 10217500, "ct": 92, "wr": 1.5593220338983, "cw": 10, "img": 2, "head": ""},
            "c1s": 0,
            "c1n": 17,
            "c1": "518,413",

            "u2": {"name": "右边玩家", "up": 10333000, "ct": 86, "wr": 1.72, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 15,

            "c3": "519,116,314,114,313,113,412,112,111,109,408,308,307,207,406,106,203",
            "c3n": 17,

            "lo": 3,
            "bc": "105,205,212",
            "mul": {
                "init": 15, "vc": 1, "grab": 1, "bc": 1, "bomb": 1, "spring": 1, "lo": 1, "u1": 2, "u2": 1, "u3": 1
            },
        };
        // 打牌阶段
        var data71 = {
            "cudo": 7,
            "vc": "",
            "type": 1,
            "num": 1,
            "cu": 2,

            "u1": {"name": 321321, "up": 10270000, "ct": 91, "wr": 1.5423728813559, "cw": 10, "img": 2, "head": ""},
            "c1s": 1,
            "c1n": 8,

            "u2": {"name": 213123, "up": 10313500, "ct": 85, "wr": 1.734693877551, "cw": 13, "img": 1, "head": ""},
            "c2s": 0,
            "c2n": 12,

            "c3": "413,411",
            "c3n": 2,

            "bc": "316,407,311",
            "lo": 1,

            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 4,
                "spring": 1,
                "lo": 1,
                "u1": 2,
                "u2": 1,
                "u3": 1
            },
            "pu": 1,
            "pc": 106,
        };
        var data72 = {
            "cudo": 7,
            "vc": "",
            "type": 1,
            "num": 1,
            "c1s": 0,
            "u1": {"name": 321321, "up": 10270000, "ct": 91, "wr": 1.5423728813559, "cw": 10, "img": 2, "head": ""},
            "c1n": 6,
            "c2s": 0,
            "u2": {"name": 213123, "up": 10313500, "ct": 85, "wr": 1.734693877551, "cw": 13, "img": 1, "head": ""},
            "c2n": 5,
            "c3": "413,411",
            "c3n": 2,
            "bc": "316,407,311",
            "lo": 1,
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 4,
                "spring": 1,
                "lo": 1,
                "u1": 2,
                "u2": 1,
                "u3": 1
            },
            "pu": 3,
            "pc": "104,304",
            "cu": 2
        };
        var data73 = {
            "cudo": 7,
            "vc": "",
            "point": 5000,
            "type": 2,
            "num": 1,
            "c1s": 0,
            "u1": {
                "name": 213123,
                "up": 10920000,
                "ct": 202,
                "wr": 1.6694214876033,
                "cw": 13,
                "img": 1,
                "head": "",
                "point": 5000
            },
            "c1n": 15,
            "c2s": 0,
            "u2": {
                "name": 321321,
                "up": 9232500,
                "ct": 208,
                "wr": 1.7333333333333,
                "cw": 10,
                "img": 2,
                "head": "",
                "point": 5000
            },
            "c2n": 14,
            "c3": "518,116,214,113,212,310,110,408,308,208,107,207,105,204,210,211,312",
            "c3n": 17,
            "bc": "210,211,312",
            "lo": 3,
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 3,
                "bomb": 1,
                "spring": 1,
                "lo": 1,
                "u1": 1,
                "u2": 1,
                "u3": 2
            },
            "pu": 2,
            "pc": 411,
            "cu": 1
        };
        var data9 = {
            "cudo": 9,
            "point": 5000,
            "u1": {
                "name": 123123,
                "up": 9894600,
                "ct": 31,
                "wr": 2.5833333333333,
                "cw": 2,
                "img": 1,
                "head": "",
                "point": 5000
            },
            "u2": {
                "name": 325423,
                "up": 10902000,
                "ct": 30,
                "wr": 1.6666666666667,
                "cw": 5,
                "img": 3,
                "head": "",
                "point": 5000
            },
            "cu": 1,//下一个要抽牌的人
            "users": "1,2,3",// 要进行抽牌的玩家
            "cards": [// 玩家抽牌的情况
                //{"pos": 1, "card": 214, "user": 3},
                //{"pos": 2, "card": 411, "user": 2}
            ]
        };
        GameData.playData.image = 1;
        GameData.playData.name = "uu";
        GameData._resetExtractPokerData();
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ResumeEnterHome.msg, data9);
    },
    // 测试地主第一次出牌按钮显示
    onTest6(){
        GameData.roomData.selfPlayData.isLandlord = true;
        GameData.roomData.selfPlayData.isRobot = false;
        GameData.roomData.selfPlayData.isShowCard = false;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeWaitLandlordPutCard, null);
    },
    // 测试左边玩家明牌
    onTest7(){
        GameData.roomData.rightPlayData.isLandlord = true;

        var data = {user: 2, card: [107, 207, 307, 407, 108, 208, 308, 408, 206]};
        ObserverMgr.dispatchMsg(GameNetMsg.recv.DisplayPoker.msg, data);
    },
    // 测试左边玩家出牌
    onTest8(){
        GameData.roomData.rightPlayData.isLandlord = true;
        var data = {"user": 2, "card": [407, 406, 405], "num": 2, "nt": 1};
        ObserverMgr.dispatchMsg(GameNetMsg.recv.PlayerOutPoker.msg, data);
    },
    // 测试聊天
    onTest9(){
        ObserverMgr.dispatchMsg(GameNetMsg.recv.Chat.msg, {id: 1, user: 1});
    },
    // 测试给发牌
    onTest10(){
        // 恢复一下自己的状态
        var data72 = {
            "cudo": 7,
            "vc": "",
            "type": 1,
            "num": 1,
            "c1s": 0,
            "u1": {"name": 321321, "up": 10270000, "ct": 91, "wr": 1.5423728813559, "cw": 10, "img": 2, "head": ""},
            "c1n": 6,
            "c2s": 0,
            "u2": {"name": 213123, "up": 10313500, "ct": 85, "wr": 1.734693877551, "cw": 13, "img": 1, "head": ""},
            "c2n": 5,
            // 自己的手牌
            "c3": "518, 519,103",
            "c3n": 2,
            "bc": "316,407,311",
            "lo": 1,
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 4,
                "spring": 1,
                "lo": 1,
                "u1": 2,
                "u2": 1,
                "u3": 1
            },
            "pu": 3,
            "pc": "104,304",
            "cu": 2
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ResumeEnterHome.msg, data72);
    },
    // 测试加载声音(是否excel配置有问题)
    onTest11(){
        AudioMgr.init();
    },
    // 测试接收玩家出牌
    onTest12(){
        GameData.roomData.rightPlayData.image = 1;

        GameData.roomData.selfPlayData.isRobot = true;
        // fixme [214,216,314,316,403,416] 这个牌型需要确认下,曾经接收到服务器发的这种牌(1 2 1 2 3 2)
        var card = [214, 216, 314, 316, 403, 416];
        var data = {user: 3, card: card, nt: 3, num: 11};
        ObserverMgr.dispatchMsg(GameNetMsg.recv.PlayerOutPoker.msg, data);
    },
    // 测试抢地主
    onTest13(){
        GameData.playData.image = 2;
        var syncData = {
            state: Poker.GamePlayState.RobLandlord,
            time: 5,
            event: GameLocalMsg.Play.OnTimeOverRobLand,
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
    },
    // 测试显示地主动画
    onTest14(){
        GameData.roomData.leftPlayData.isLandlord = true;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnResumeShowLandlordAction, null);
    },
    // 测试发放积分
    onTest15(){
        GameData.roomData.type = Poker.GameRoomType.Gem;
        ObserverMgr.dispatchMsg(GameNetMsg.recv.BeganGame.msg, null);
    },
    // 测试U钻场一局结束结算
    onTest16(){
        GameData.roomData.leftPlayData.isLandlord = true;
        GameData.roomData.rightPlayData.isLandlord = false;
        GameData.roomData.selfPlayData.isLandlord = false;
        GameData.roomData.type = Poker.GameRoomType.Gem;
        GameData.roomData.gemPlayNum = 3;
        var data = {
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 1,
                "spring": 1,
                "lo": 1,
                "u1": 1,
                "u2": 2,
                "u3": 1
            },
            "win": 2,
            "reward": {"u3": 600, "u1": 600, "u2": -1200},
            "u3": 6200,
            "u1": 6200,
            "u2": 2600,
            "c3": "",
            "c1": "306,206,305,205",
            "c2": "408,208"
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.GameOver_RoundMatch.msg, data);

        var ss = {
            "mul": {
                "init": 15,
                "vc": 1,
                "grab": 1,
                "bc": 1,
                "bomb": 1,
                "spring": 1,
                "lo": 1,
                "u1": 1,
                "u2": 2,
                "u3": 1
            },
            "win": 2,
            "reward": {"u1": 600, "u2": -1200, "u3": 600},
            "u1": 3200,
            "u2": 5000,
            "u3": 6800,
            "c1": "312,404,204",
            "c2": "410,310,406,306,205,409,110",
            "c3": ""
        };
    },
    // 测试U钻场最终结算
    onTest17(){
        GameData.playData.image = 2;
        GameData.roomInfo.gemRoom = [
            {id: 1, underPoint: 0, initMul: 0, gem: 1, ticket: 0, gamePoint: 0},
            {id: 2, underPoint: 0, initMul: 0, gem: 23, ticket: 0, gamePoint: 0},
            {id: 3, underPoint: 0, initMul: 0, gem: 33, ticket: 0, gamePoint: 0},
            {id: 4, underPoint: 0, initMul: 0, gem: 44, ticket: 0, gamePoint: 0},
            {id: 5, underPoint: 0, initMul: 0, gem: 55, ticket: 0, gamePoint: 0},
        ];

        GameData.roomData.type = Poker.GameRoomType.Gem;
        GameData.roomData.leftPlayData.isLandlord = true;
        GameData.roomData.rightPlayData.isLandlord = false;
        GameData.roomData.selfPlayData.isLandlord = false;
        var data = {
            "win": 1, //胜利的玩家 1,2,3
            "u1": 3000,
            "u2": 6000,
            "u3": 0,
            "ud": 10,  //获胜者赢得的U钻数量
            "nowud": 100, //自己的最新的U钻数量
            "iss": 1, //1表示抽牌的结果，0表示打完积分的结果
            "s1": '406', //如果抽牌决出胜负，表示用户1抽的牌
            "s2": '', //如果抽牌决出胜负，表示用户2抽的牌
            "s3": '409', //如果抽牌决出胜负，表示用户3抽的牌,
            "reward": {"u1": 250, "u2": -500, "u3": 250},//结算前的最后一场得到或消耗的积分
            "ext_num": 5,//新手引导额外奖励的场次
            "ext_ud": 21,//新手引导额外奖励的U钻
            "ext_nr": "1,20,50,100" //下一局可能的额外奖励u钻，用逗号分隔,只在第四局才有该参数
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.GameOver_CompeteMatch.msg, data);
    },
    // 触发抽牌
    onTest18(){
        GameData.roomData.leftPlayData.image = 1;
        GameData.roomData.rightPlayData.image = 2;
        GameData.playData.image = 3;
        var data = {users: "1,3,2", nt: 3};
        ObserverMgr.dispatchMsg(GameNetMsg.recv.TriggerExtractPoker.msg, data);
    },
    // 玩家抽牌
    onTest19(){
        var data = {
            "pos": 1,
            "card": 104,
            "user": 3,
            "nt": 2
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ExtractPoker.msg, data);

        data = {
            "pos": 2,
            "card": 306,
            "user": 2,
            "nt": 1
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ExtractPoker.msg, data);
        data = {
            "pos": 3,
            "card": 305,
            "user": 1,
            "nt": 0
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.ExtractPoker.msg, data);
    },
    onTest20(){
        //GameReady.initShowHideWindowEvent();

        //this.onTest16();// 第三局结束
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowRaceResultOverWithLuckyCard, null);
        this.onTest18();// 触发抽牌
        this.onTest19();// 玩家抽牌
        this.onTest17();
    },
    onTest21(){
        this.onTest16();// 第一局结束
        this.onTest3();//测试发牌
    },
    // 测试局数显示
    onTest22(){
        GameData.roomData.roomInfo = {gem: 2};
        var data = {
            'u3': [103, 203, 303],
            'u1': [],
            'u2': [],
            'again': 0,
            'type': 2, // type 类型 1金币场  2u钻场
            'num': 1, // num 如果在u钻场，表示第几局，从1开始 u钻场专用
            'mul': {"init": 15, "vc": 1},
            'up': {'u1': 1000, 'u2': 2000, 'u3': 1111} // 场中用户当前的金币值
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnGamePlay, data);
    },
    onTest23(){
        ObserverMgr.dispatchMsg(GameNetMsg.recv.OnBankrupt.msg, {getup: 10, up: 1111, num: 1});
    },
    // 测试底牌倍数
    onTest24(){
        var data = {
            lo: 1,
            bc: [108, 208, 308],
            mul: {
                grab: 2,
                bc: 2,
            },
        };
        ObserverMgr.dispatchMsg(GameNetMsg.recv.EnsureLandlord.msg, data);
    },
    // 测试出牌按钮顺序
    onTest25(){
        require('GameLocalStorage').initStorageData();
        GameData.playData.image = 2;
        var syncData = {
            state: Poker.GamePlayState.PutPokerWithAfter,
            time: 5,
            event: GameLocalMsg.Play.OnTimeOverPutCardWithAfter,
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnShowTipBtn, syncData);
    },
    onTest26(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerTimeOutPutCard, 1);
    },
}

