window.Poker = {
    // 信号类型
    PhoneSignalType: {
        None:0,
        WiFi: 1,
        Mobile: 2,
    },
    GamePlatform: {// 游戏平台
        None: 0,
        Web: 1,
        Pc: 2,
        Android: 3,
        Ios: 4,
    },
    GameMode: {
        Home: 1,// 大厅
        Gold: 2,// 金币
        UStone: 3,//U钻
        Mail: 4,// 邮件
        Scene: 5,// 场景
        Role: 6,// 角色
        Convert: 7,//兑换
    },
    Json: {
        ShowCard: 100,// 明牌
        ShoutLandlord: 101,// 叫地主
        NoShoutLandlord: 102,// 不叫
        RobLandlord: 103,// 抢地主
        RobLandlordAgain: 104,//我抢
        NoRobLandlord: 105,// 不抢
        Double: 106,
        NoDouble: 107,
        SuperDouble: 108,
        NoPut: 109,// 不出
        NoBig: 110,// 要不起
        Pass: 111,// 过
        Warning1: 112,// 剩下1张牌
        Warning2: 113,// 剩下2张牌
    },
    Event: {
        TimerComplete: "Poker_Event_TimerComplete",// 定时器结束
    },
    // 游戏打牌状态
    GamePlayState: {
        None: 0,// 默认
        WaitPlayerJoin: 1,// 等待对手阶段
        SendPoker: 2,// 发牌阶段阶段
        ShoutLandLord: 10,//叫地主阶段
        RobLandlord: 3,// 抢地主阶段
        DoubleStage: 4,// 加倍阶段
        WaitPlayerSendPoker: 5,// 等待出牌阶段

        PutPokerWithLandlordBegan: 15,//地主第一次出牌
        PutPokerWithBegan: 13,// 先出牌
        PutPokerWithAfter: 6,// 接着上家的牌出
        PutPokerWithNoBig: 8,// 出牌阶段但是要不起

        SelectShowCard: 9,// 明牌阶段
        PutCardWarning: 11,//出牌报警阶段
        GameOver: 7,// 游戏结束
        ExtractPoker: 100,// 抽牌
    },
    GameOverResult: {
        Win: 1,// 胜利
        Lose: 2,// 失败
        Deuce: 3,// 平手
    },
    // 游戏所在的场景
    GameScene: {
        None: 0,
        Login: 1,
        Center_Home: 2,
        Play: 100,// 游戏打牌界面
    },
    // 暂时没有用到
    RoleState: {
        PushCard: 1,
        Think: 2,
        RobLandlord: 3,
        GetCard: 4,
    },
    RoleSex: {
        WoMan: 0,// 女
        Man: 1,// 男
    },
    // 游戏房间类型
    GameRoomType: {
        Gold: 1,// 金豆场
        Gem: 2,// U钻场
    },
    // 游戏角色类型
    GameRoleType: {
        None: 0,
        LandLord: 1,// 地主
        Farmer: 2,// 农民
    },
    // 加倍类型
    DoubleType: {
        No: 1,// 不加倍
        Double: 2,// 加倍
        Super: 4,// 超级加倍
    },
    // 购买类型
    ShopBuyType: {
        None: -1,//无需购买
        Gold: 0,// 金豆购买
        Gem: 1,// U钻购买
    },

    // 人物ID
    // 0 azhen
    // 1 gaoshu
    // 2 xiaoyou
    // 3 daozai

}
