module.exports = {
    /* ==========================================================================
     * 单牌：单个牌（如红桃 5 ）。
     * 对牌：数值相同的两张牌（如梅花 4+ 方块 4 ）。
     * 三张牌：数值相同的三张牌（如三个 J ）。
     * 三带一：数值相同的三张牌 + 一张单牌或一对牌。例如： 333+6 或 444+99
     * 顺子：五张或更多的连续单牌（如： 45678 或 78910JQK ）。不包括 2 点和双王。
     * 双顺：三对或更多的连续对牌（如： 334455 、 7788991010JJ ）。不包括 2 点和双王。
     * 三顺：二个或更多的连续三张牌（如： 333444 、 555666777888 ）。不包括 2 点和双王。
     * 飞机带翅膀：三顺＋同数量的单牌（或同数量的对牌）。如： 444555+79 或 333444555+7799JJ
     * 四带二：四张牌＋两手牌。（注意：四带二不是炸弹）。如： 5555 ＋ 3 ＋ 8 或 4444 ＋ 55 ＋ 77 
     * 炸弹：四张同数值牌（如四个 7 ）。
     * 火箭：即双王（大王和小王），最大的牌。
     * ==========================================================================*/
    DECK_TYPE: cc.Enum({
        ERROR: 0,           // 牌不合规则
        SINGL: 1,           // 单张
        DOUBLE: 2,          // 一对
        TREBLE: 3,          // 三张
        TREBLE_ONE: 4,      // 三带一
        TREBLE_TWO: 5,      // 三带二
        CONTINUE: 6,        // 顺子
        DB_CONTINUE: 7,     // 双顺
        TB_CONTINUE: 8,     // 三顺
        AIRPLANE_1: 9,      // 飞机带翅膀--二连飞机带翅膀
        AIRPLANE_2: 10,     // 飞机带翅膀--二连飞机带二对
        AIRPLANE_3: 11,     // 飞机带翅膀--三连飞机带翅膀
        AIRPLANE_4: 12,     // 飞机带翅膀--三连飞机带三对
        AIRPLANE_5: 13,     // 飞机带翅膀--四连飞机带翅膀
        AIRPLANE_6: 14,     // 飞机带翅膀--四连飞机带四对
        AIRPLANE_7: 15,     // 飞机带翅膀--五连飞机带翅膀
        FOUR_TWO: 16,       // 四带二(4张牌)
        FOUR_TWO4:19,       // 四带二(8张牌)
        BOMB: 17,           // 炸弹
        ROCKET: 18          // 火箭
    }),

    /**服务器推送数据类型 */
    SERVER_PUSH_TYPE: cc.Enum({
        // 获取角色信息
        GET_SELF_INFO: 2001,
        // 创建角色成功
        CREATE_ROLE: 2002,
        // 游戏信息
        SYSTEM_INFO: 2010,
        // 游戏人数
        PLAYER_NUMBER: 2011,
        // 进房间
        ENTER_ROOM: 2021,
        // 自己离开房间
        SELF_EXIT: 2022,
        // 开始搜索对手
        SEARCH_OTHER_PLAYER: 2030,
        // 匹配到其他玩家
        GET_OTHER_PLAYER: 2031,
        // 发牌
        SERVER_PUSH_CARD: 2032,
        // 玩家明牌
        PLAYER_SHOW_CARD: 2033,
        // 玩家准备
        PLAYER_READY: 2034,
        // 玩家叫地主
        CALL_LANDLORD: 2035,
        // 通知叫地主信息
        NEXT_CALL_LANDLORD: 2036,
        // 通知抢地主信息
        NEXT_ROB_LANDLORD: 2037,
        // 发送底牌
        BACK_CARD: 2038,
        // 玩家加倍
        PLAYER_DOUBLE: 2039,
        // 玩家出牌
        PLAYER_PUSH_CARD: 2040,
        // 游戏结算
        GAME_SUBTOTAL: 2041,
        // 重新发牌
        PUSH_CARD_AGAIN: 2042,
        // 用户退出房间
        USER_EXIT: 2043,
        // 恢复游戏
        RESUME_GAME: 2045,
        // 触发抽牌
        DRAW_CARD: 2046,
        // 抽牌信息
        DRAW_CARD_INFO: 2047,
        // 比赛场获取U钻统计
        GET_UUGEM: 2048,
        // 托管信息
        PLAYER_AUTO_PLAY: 2049,
        // 商品信息
        GOODS_INFO: 2050,
        // 购买商品
        BUY_PRODUCT: 2051,
        // 购买成功
        BUY_SUCCESS: 2052,
        // 排行榜
        RANK: 2055,
        // 破产奖励
        FREE_CHARGE: 2060,
        // 固定聊天
        KEEP_CHAT: 2061,
        // 重复登陆强制下线
        KICK_OFFLINE: 2070,
    }),
}