window.GameLocalMsg = {
    Race: {
        Apply: "GameLocalMsg_Race_Apply",// 比赛场报名
        ChallengeHeightMatch: "GameLocalMsg_Race_ChallengeHeightMatch",// 挑战更高比赛场场
        UpdateStone: "GameLocalMsg_Race_UpdateStone",//更新U钻
    },
    Classic: {
        QuickBegan: "GameLocalMsg_Classic_QuickBegan",// 金币场快速开始
        Enter: "GameLocalMsg_Classic_Enter",// 进入金币场
    },
    Rank: {
        ShowPlayerInfo: "GameLocalMsg_Rank_ShowPlayerInfo",// 显示玩家信息
        ShowPlayerSelfInfo: "GameLocalMsg_Rank_ShowPlayerSelfInfo",// 显示自己的信息
    },
    Center: {
        EnterSubLayer: "GameLocalMsg_Center_EnterSubLayer",// 进度子页面
        ChangeMode: "GameLocalMsg_Center_ChangeMode",// 改变模式
        ShowChargeTips: "GameLocalMsg_Center_ShowShopLayer",//显示重置提示商城
        ShowShop: "GameLocalMsg_Center_ShowShop",// 显示商城
        ShowActive: "GameLocalMsg_Center_ShowActive",// 显示活动
        ClickShopItem: "GameLocalMsg_Center_ClickShopItem",// 点击商品item
        AddGuideMask: "GameLocalMsg_Center_AddGuideMask",// 引导遮罩
        ShowBeanAni: "GameLocalMsg_Race_ShowBeanAni",//显示bean的动画
        OnClickCloseHomeItemLayer: "GameLocalMsg_Center_OnClickCloseHomeItemLayer",// 关闭页面

        OnUpdateHead: "GameLocalMsg_Center_OnUpdateHead",// 更新头像
    },
    Game: {
        ShowShopLayer: "GameLocalMsg_Game_ShowShopLayer",// 显示充值提示
        CleanSmartTipsIndex: "GameLocalMsg_Game_CleanSmartTipsIndex",// 清空智能提示index
        OnWinShow: "GameLocalMsg_Game_OnWinShow",
        OnWinHide: "GameLocalMsg_Game_OnWinHide",
        OnKeyBack: "GameLocalMsg_Game_OnKeyBack",


        OnTriggerReconnect: "GameLocalMsg_Game_OnTriggerReconnect",// 重连事件
        OnReconnectFailed: "GameLocalMsg_Game_OnReconnectFailed",// 重连失败
        OnForceOutLine: "GameLocalMsg_Game_OnForceOutLine",// 强制下线
        OnInitiativeOutLine: "GameLocalMsg_Game_OnInitiativeOutLine",// 主动下线

        OnCertGameServer: "GameLocalMsg_Game_OnCertGameServer",// 游戏服务器签证
        OnSdkChangeAccount: "GameLocalMsg_Game_onSdkChangeAccount",// 切换账号
        OnUpdateTicketVisible: "GameLocalMsg_Game_OnUpdateTicketVisible",// 更新门票visible
    },
    Com: {
        OnRouter: "GameLocalMsg_Com_OnRouter",// 路由
        UpdateMoney: "GameLocalMsg_Com_UpdateMoney",// 更新金币
        OnExclusionLayer: "GameLocalMsg_Com_OnExclusionLayer",// 互斥界面
        OnShowTips: "GameLocalMsg_Com_OnShowTips",// 显示提示

        OnUpdateVersion: "GameLocalMsg_Com_OnUpdateVersion",// 更新版本
        OnGetVersionInfo: "GameLocalMsg_Com_OnGetVersionInfo",// 获取到版本信息
        OnTipUpdateVersion: "GameLocalMsg_Com_OnTipUpdateVersion",// 提示更新版本
        OnUpdateProgress: "GameLocalMsg_Com_OnUpdateProgress",// 更新进度
        OnUpdateVersionResult: "GameLocalMsg_Com_OnUpdateVersionResult",// 更新成功
        OnIAPSuccess: "GameLocalMsg_Com_OnIAPSuccess",// 内购成功
        OnIAPFailed: "GameLocalMsg_Com_OnIAPFailed",// 内购成功
        OnPayingUpdate: "GameLocalMsg_Com_OnPayingUpdate",// 更新支付状态
    },
    Play: {
        // 点击按钮
        OnShowTipBtn: "GameLocalMsg_Play_OnShowTipBtn",// 显示出牌阶段按钮
        OnClickPutCardAfter: "GameLocalMsg_Play_OnPutCardAfter",// 接着上家的牌出
        OnClickPutCardBegan: "GameLocalMsg_Play_OnPutCardBegan",// 地主开始出牌
        OnClickTipPutCard: "GameLocalMsg_Play_OnTips",
        OnClickNotPutCard: "GameLocalMsg_Play_OnNotPutCard",
        OnClickNoBig: "GameLocalMsg_Play_OnNoBig",
        OnClickShowCard: "GameLocalMsg_Play_OnShowCard",
        OnClickDouble: "GameLocalMsg_Play_OnDouble",
        OnClickRobLandlord: "GameLocalMsg_Play_OnRobLandlord",
        OnClickShoutLandlord: "GameLocalMsg_Play_OnShoutLandlord",
        OnShowFindPlayer: "GameLocalMsg_Play_OnShowFindPlayer",
        OnShowPlayerUserInfo: "GameLocalMsg_Play_OnShowPlayerUserInfo",

        OnClickCancelRobot: "GameLocalMsg_Play_OnCancelRobot",// 取消托管
        OnClickRobot: "GameLocalMsg_Play_OnRobot",// 托管
        OnClickShop: "GameLocalMsg_Play_OnClickShop",// 点击商城
        OnClickRules: "GameLocalMsg_Play_OnClickRules",// 点击规则
        OnClickSet: "GameLocalMsg_Play_OnClickSet",// 点击设置
        OnClickExitRoom: "GameLocalMsg_Play_OnExitRoom",// 退出房间
        OnClickExtractCard: "GameLocalMsg_Play_OnClickExtractCard",// 点击抽牌中的一张牌

        OnThinkLeft: "GameLocalMsg_Play_OnThinkLeft",// 左边的玩家思考
        OnThinkRight: "GameLocalMsg_Play_OnThinkRight",// 右边的玩家思考
        OnThinkTimeOverSelf: "GameLocalMsg_Play_OnThinkTimeOverSelf",// 自己的思考时间到

        OnUpdateMul: "GameLocalMsg_Play_OnUpdateMul",// 更新倍率
        OnUpdateLandlordState: "GameLocalMsg_Play_OnUpdateLandlordState",//更新地主状态
        OnTriggerMul: "GameLocalMsg_Play_OnTriggerMul",// 触发倍率变化,开始游戏之前(明牌,抢地主)
        OnTriggerMul_BackCard: "GameLocalMsg_Play_OnTrigger_BackCard",// 触发倍率变化

        OnGamePlay: "GameLocalMsg_Play_OnGamePlay",// 正式开始游戏,发牌
        OnGetRaceInitScore: "GameLocalMsg_Play_OnGetRaceInitScore",// 获取比赛场初始积分

        OnWaitPlayerSelectDouble: "GameLocalMsg_Play_OnWaitPlayerSelectDouble",// 等待玩家选择加倍
        OnTimeOverWithShowCard: "GameLocalMsg_Play_OnTimeOverWithShowCard",// 明牌倒计时结束
        OnTimeOverShoutLand: "GameLocalMsg_Play_OnShoutLanTimeOverSelf",// 自己叫地主时间到
        OnTimeOverRobLand: "GameLocalMsg_Play_OnRobLandTimeOverSelf",// 自己抢地主时间到
        OnTimeOverDouble: "GameLocalMsg_Play_OnDoubleTimeOverSelf",// 自己加倍时间到
        OnTimeOverPutCardWithAfter: "GameLocalMsg_Play_OnPutCardWithAfterTimeOver",// 接着上家出牌思考时间到
        OnTimeOverPutCardWithBegan: "GameLocalMsg_Play_OnPutCardWithBeganTimeOver",// 地主开始出牌思考时间到
        OnTimeOverPutCardWithNoBig: "GameLocalMsg_Play_OnPutCardWithNoBigTimerOver",// 要不起思考时间到
        OnTimeOverExtractPoker: "GameLocalMsg_Play_OnTimeOverExtractPoker",// 抽卡时间到

        OnResetTimeOutCount: "GameLocalMsg_Play_OnResetTimeOutCount",// 重置超时次数

        OnTriggerPutCardAction: "GameLocalMsg_Play_OnTriggerPutCardAction",// 触发出牌操作
        OnTriggerTimeOutPutCard: "GameLocalMsg_Play_OnTriggerTimeOutPutCard",// 触发出牌超时
        OnTriggerPutCardWarning: "GameLocalMsg_Play_OnTriggerPutCardWarning",// 触发出牌报警
        OnTriggerHideEventWithLuckCard: "GameLocalMsg_Play_OnTriggerHideEventWithLuckCard",// 在抽牌界面触发隐藏游戏事件
        OnTriggerSlidePutCard: "GameLocalMsg_Play_OnTriggerSlidePutCard",// 触发滑动出牌
        OnTriggerPlane: "GameLocalMsg_Play_OnTriggerPlane",// 触发飞机
        OnTriggerBomb: "GameLocalMsg_Play_OnTriggerBomb",// 触发炸弹
        OnTriggerRocket: "GameLocalMsg_Play_OnTriggerRocket",// 触发火箭
        OnTriggerSpring: "GameLocalMsg_Play_OnTriggerSpring",// 触发春天

        OnLeftUserEnter: "GameLocalMsg_Play_OnLeftUserEnter",// 左边的用户进入房间
        OnRightUserEnter: "GameLocalMsg_Play_OnRightUserEnter",// 右边的用户进入房间

        OnGameOver: "GameLocalMsg_Play_OnGameOver",// 游戏结束
        OnGameOverWithResult: "GameLocalMsg_Play_OnGameOverWithResult",// 游戏结束-胜利/失败/平局
        OnGameOverWithResultWithForce: "GameLocalMsg_Play_OnGameOverWithResultWithForce",// 游戏结束-胜利/失败/平局
        OnShowRaceResultOverWithLuckyCard: "GameLocalMsg_Play_OnShowRaceResultOverWithLuckyCard",//显示比赛结果结束,抽卡
        OnGameOverShowResultWithExtractPoker: "GameLocalMsg_Play_OnGameOverShowResultWithExtractPoker",// 抽卡结束显示结算界面

        OnGameOverChangePlayer: "GameLocalMsg_Play_OnGameOverChangePlayer",// 玩家更换房间
        OnGameOverContinuePlay: "GameLocalMsg_Play_ONGameOverContinuePlay",// 游戏结束继续游戏

        OnUpdateActivityContent: "GameLocalMsg_Play_OnUpdateActivityContent",// 更新活动的index
        OnTest: "OnTest",//

        onPlayerEscape:"GameLoacalmsg_Player_OnPlayerEscape", //游戏中玩家逃跑

        OnSendPokerWithSyncCardNum: "GameLocalMsg_Play_OnSendPokerWithSyncCardNum",// 发牌阶段同步更新其他玩家牌的数量
        OnShowIdentity: "GameLocalMsg_Play_OnShowIdentity",// 显示身份

        OnResumePlayerStatusData: "GameLocalMsg_Play_OnResumePlayerCardData",// 恢复玩家手牌数据
        OnResumeShowLastThreeCard: "GameLocalMsg_Play_OnResumeShowLastThreeCard",// 显示底牌
        OnResumeHandPoker: "GameLocalMsg_Play_OnResumeHandPoker",// 恢复手牌
        OnResumeShowLandlordAction: "GameLocalMsg_Play_OnResumeShowLandlordAction",// 显示确定地主动画
        OnResumeWaitLandlordPutCard: "GameLocalMsg_Play_OnResumeWaitLandlordPutCard",// 等待地主出牌
        OnResumePutPokerStatus: "GameLocalMsg_Play_OnResumePutPokerStatus",// 设置出牌的状态
        OnResumeSelfPutCard: "GameLocalMsg_Play_OnResumeSelfPutCard",// 展示自己已经出的牌
    },
    Login: {
        OnWebSdkLoginError: "GameMsg_Login_OnSdkLogin",//SDK 登录成功
        OnWebSdkRegisterUserError: "GameMsg_Login_OnSdkRegisterUser",// SDK注册成功
        OnWebSdkTimeOut: "GameMsg_Login_OnWebSdkTimeOut",// web sdk 超时
        OnSdk_IOSLogin: "GameLocalMsg_Login_OnSdk_IOSLogin",// ios登录成功
        OnSdk_AndroidLogin: "GameLocalMsg_Login_OnSdk_AndroidLogin",// 安卓登录
    },
    SOCKET: {
        SEND: "GameMsg_SOCKET_SEND",
        RECV: "GameMsg_SOCKET_RECV",
        CLOSE: "GameMsg_SOCKET_CLOSE",// 被动断开socket
        OPEN: "GameMsg_SOCKET_OPEN",
        ERROR: "GameMsg_SOCKET_ERROR",
        CertSuccess: "GameMsg_SOCKET_CertSuccess",// socket认证成功
        Change: "GameMsg_SOCKET_Change",// 网络发生变化,主要是为了解决IPhone7S的网络问题
    },
    GameScene: {
        OnSelectChatWord: "GameLocalMsg_GameScene_OnSelectChatWord",//选择聊天item
    }
};
