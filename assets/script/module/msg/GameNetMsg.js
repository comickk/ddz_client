window.GameNetMsg = {
    send: {
        AnonymityLogin:{sendId:3001,msg:"send_AnonymityLogin"},// 匿名登录
        GetUserInfo: {sendId: 1001, msg: "send_GetUserInfo"},// 获取用户消息
        SetNameAndHead: {sendId: 1002, msg: "send_SetNameAndHead"},// 设置用户昵称形象
        UploadHead: {sendId: 1003, msg: "send_UploadHead"},// 上传自定义头像
        SetHead: {sendId: 1006, msg: "send_SetHead"},// 设置自定义头像
        SetGameScene: {sendId: 1007, msg: "send_SetGameScene"},// 设置场景

        GetSysCfg: {sendId: 1010, msg: "send_GetSysCfg"},// 获取系统配置
        UpdateDeskPeople: {sendId: 1011, msg: "send_UpdateDeskPeople"},// 获取场次人数
        EnterHome: {sendId: 1021, msg: "send_EnterHome"},// 进入房间
        LeaveHome: {sendId: 1022, msg: "send_LeaveHome"},// 离开房间
        BeganGame: {sendId: 1030, msg: "send_BeganGame"},// 开始游戏

        ResumeEnterHome: {sendId: 1038, msg: "send_ResumeEnterHome"},//  如果在牌桌中掉线重连需要主动请求场景

        ChangeDesk: {sendId: 1037, msg: "send_ChangeDesk"},// 换桌
        DisplayPoker: {sendId: 1031, msg: "send_DisplayPoker"},// 明牌
        SendPokerOver: {sendId: 1032, msg: "send_SendPokerOver"},// 发完牌之后校验
        ShoutLandlord: {sendId: 1033, msg: "send_ShoutLandlord"},// 叫地主
        RobLandlord: {sendId: 1034, msg: "send_ShoutLandlord"},// 抢地主
        ShoutDouble: {sendId: 1035, msg: "send_ShoutDouble"},// 加倍
        PutPoker: {sendId: 1036, msg: "send_PutPoker"},// 出牌
        EntrustPlay: {sendId: 1040, msg: "send_EntrustPlay"},// 托管
        ExtractPoker: {sendId: 1039, msg: "send_ExtractPoker"},// 抽牌
        HeartBeat: {sendId: 1100, msg: "send_HeartBeat"},// 心跳
        GetShopListInfo: {sendId: 1050, msg: "send_GetShopListInfo"},// 获取商品列表
        PayShop: {sendId: 1051, msg: "send_PayShop"},// 购买商品
        GetRank: {sendId: 1056, msg: "send_GetRank"},// 获取排行
        Chat: {sendId: 1061, msg: "send_Chat"},// 聊天
        CertToken: {sendId: 1900, msg: "send_CertToken"},// 校验token
        IAPSuccess:{sendId:1052, msg:"send_IAPSuccess"},// 内购成功
    },

    recv: {
        AnonymityLogin:{recvId:4001,msg:"recv_AnonymityLogin"},// 匿名登录
        CertToken: {recvId: 2900, msg: "recv_CertToken"},// 校验token
        GetUserInfo: {recvId: 2001, msg: "recv_GetUserInfo"},// 获取用户消息
        SetNameAndHead: {recvId: 2002, msg: "recv_SetNameAndHead"},// 设置用户昵称形象
        UploadHead: {recvId: 2003, msg: "recv_UploadHead"},// 上传自定义头像
        UpdateMoney: {recvId: 2004, msg: "recv_UpdateMoney"},// 更新金币
        SetHead: {recvId: 2006, msg: "recv_SetHead"},// 设置自定义头像
        SetGameScene: {recvId: 2007, msg: "send_SetGameScene"},// 设置场景
        GetSysCfg: {recvId: 2010, msg: "recv_GetSysCfg"},// 获取系统配置
        UpdateDeskPeople: {recvId: 2011, msg: "recv_UpdateDeskPeople"},// 获取场次人数
        EnterHome: {recvId: 2021, msg: "recv_EnterHome"},// 进入房间
        LeaveHome: {recvId: 2022, msg: "recv_LeaveHome"},// 离开房间
        BeganGame: {recvId: 2030, msg: "recv_BeganGame"},// 开始游戏

        DeskEnterUser: {recvId: 2031, msg: "recv_DeskEnterUser"},//牌桌匹配到用户
        ResumeEnterHome: {recvId: 2045, msg: "recv_ResumeEnterHome"},// 如果在牌桌中掉线重连需要主动请求场景
        DeskUserLeave: {recvId: 2043, msg: "recv_DeskUserLeave"},// 用户离开
        ChangeDesk: {recvId: 2044, msg: "recv_ChangeDesk"},// 换桌
        SendPoker: {recvId: 2032, msg: "recv_SendPoker"},// 发牌
        ReSendPoker: {recvId: 2042, msg: "recv_ReSendPoker"},// 重新发牌
        DisplayPoker: {recvId: 2033, msg: "recv_DisplayPoker"},// 明牌
        UserReady: {recvId: 2034, msg: "recv_UserReady"},// 用户准备
        ShoutPoker: {recvId: 2035, msg: "recv_ShoutPoker"},// 叫牌
        ShoutLandlord: {recvId: 2036, msg: "recv_ShoutLandlord"},// 叫地主
        RobLandlord: {recvId: 2037, msg: "recv_RobLandlord"},// 抢地主
        EnsureLandlord: {recvId: 2038, msg: "recv_EnsureLandlord"},// 确定地主
        ShoutDouble: {recvId: 2039, msg: "recv_ShoutDouble"},// 加倍
        PlayerOutPoker: {recvId: 2040, msg: "recv_PlayerOutPoker"},// 玩家出牌

        GameOver_NormalMatch: {recvId: 2041, msg: "recv_GameOver_NormalMatch"},// 游戏结束，结算
        GameOver_RoundMatch: {recvId: 2065, msg: "recv_GameOver_RoundMatch"},// 比赛场单局结束
        GameOver_CompeteMatch: {recvId: 2048, msg: "recv_GameOver_CompeteMatch"},// 比赛场结算

        EntrustPlay: {recvId: 2049, msg: "recv_EntrustPlay"},// 托管
        TriggerExtractPoker: {recvId: 2046, msg: "recv_TriggerExtractPoker"},// 触发抽牌
        ExtractPoker: {recvId: 2047, msg: "recv_ExtractPoker"},// 抽牌
        EntrustPlayTimeOut: {recvId: 9696, msg: "recv_EntrustPlayTimeOut"},// 托管超时离线
        GetShopListInfo: {recvId: 2050, msg: "recv_GetShopListInfo"},// 获取商品列表
        PayShop: {recvId: 2051, msg: "recv_PayShop"},// 购买商品
        PaySuccess: {recvId: 2052, msg: "recv_PaySuccess"},// 支付成功
        GetRank: {recvId: 2055, msg: "recv_GetRank"},// 获取排行
        OnBankrupt: {recvId: 2060, msg: "recv_OnBankrupt"},// 破产
        Chat: {recvId: 2061, msg: "recv_Chat"},// 聊天
        OnOutLine: {recvId: 2070, msg: "recv_OnOutLine"},// 强制下线
        OnMatchService: {recvId: 2090, msg: "recv_OnMatchService"},// 匹配到客服
    },
    // 通过id获取消息的string
    getReceiveMsgStrByID(id){
        var msg = null;
        for (var k in this.recv) {
            var item = this.recv[k];
            if (id == item["recvId"]) {
                msg = item['msg'];
            }
        }
        return msg;
    },
    getSendMsgStrByID(id){
        var msg = null;
        for (var k in this.send) {
            var item = this.send[k];
            if (id == item["sendId"]) {
                msg = item['msg'];
            }
        }
        return msg;
    },
};
