var MD5 = require("Md5").md5;
var Utils = require("Utils");

module.exports = {
    version: '1.0.0',

    // isLocalVersion: false,// 是否是本地版本
    // certUrl: "http://wddz.haoxiaow.com:9700/cert",
    // sdkUrl: "http://wddz.haoxiaow.com:9901/api.php",
    // activityUrl: "http://cdn.haoxiaow.com/ddz/event/activity.json",
    isLocalVersion: true,// 是否是本地版本
    certUrl: "http://192.168.0.222:9700/cert",
    sdkUrl: "http://192.168.0.222:9901/api.php",
    activityUrl: "http://192.168.0.222:9901/ddz/event/activity.json",


    platform: 1, // 1 页游， 2 pc客户端， 3 android， 4 ios

    sdkToken: null,// sdk服务器返回的token
    gameServerCertData: {// 游戏服务器返回的签证数据
        key: null,
        urlArr: null,
        token: null,
    },
    getGameKey(){
        var key = this.gameServerCertData.key;
        var pemKey = Utils.formatPEMString(key, '\n', 64);
        var retKey = '-----BEGIN RSA PUBLIC KEY-----\n' + pemKey +
            '-----END RSA PUBLIC KEY-----';
        return retKey;
    },
    getGameToken(){
        return this.gameServerCertData.token;
    },
    // 渠道id,游客为1000, 898账号为1001
    getChannel(){
        var channel = "1000";
        var isVisitor = require("GameData").visitorAccount;
        if (isVisitor) {
            channel = "1000";
        } else {
            channel = "1001";
        }
        console.log("[GameStaticCfg] channel = " + channel);
        return channel;
    },
    // 获取游戏平台
    getGamePlatform(){
        var platform = Poker.GamePlatform.None;
        if (cc.sys.isBrowser) {
            platform = Poker.GamePlatform.Android;//cocos creater web 使用android平台
        } else if (cc.sys.isNative) {
            if (cc.sys.platform == cc.sys.ANDROID) {
                platform = Poker.GamePlatform.Android;
            } else if (Utils.isApplePlatform()) {
                platform = Poker.GamePlatform.Ios;
            } else if (cc.sys.platform == cc.sys.WIN32) {
                platform = Poker.GamePlatform.Android;
            } else {
                console.log("初始化平台: 其他平台");
            }
        }
        this.platform = platform;
        return this.platform;
    },
    // 设置重连的token
    setReconnectGameToken(token){
        this.gameServerCertData.token = token;
    },
    getSocketUrl(){
        var url = "";
        var urlArr = this.gameServerCertData.urlArr;
        if (urlArr && urlArr.length > 0) {
            url = urlArr[0];
        }
        return "ws://" + url;
    },
    updateServerCertData(data){
        this.gameServerCertData.key = data['key'];
        this.gameServerCertData.token = data['token'];

        var urlArr = data['url'].split(',');
        if (urlArr.length > 0) {
            this.gameServerCertData.urlArr = urlArr;
        } else {
            console.log("游戏证书返回的url有问题:" + data['url']);
        }
    },
    sid: 'nil',
    key: 'nil',

    isShowLog: true, // 是否显示Log信息


    // 游戏时间配置
    time: {
        shoutLandlord: 15,// 叫地主
        robLandlord: 15,// 抢地主
        double: 10,// 加倍
        putCard: 25,// 出牌
        noBig: 10,// 要不起
        findPlayer: 20,// 匹配对手
        reconnect: 32,// 断线重连
        reconnectNum: 3,// 重连次数
        chat: 4,// 聊天
        gameOver: 5,// 游戏结束结算时间
        extractCard: 10,// 抽卡
    },
    // 游戏规则
    gemRule: "" +
    "1、比赛开始时每位玩家获5000积分，结束后积分清零。\n" +
    "2、比赛三局，打满三局或每局结束后有玩家积分为0时，比赛结束。\n" +
    "3、比赛结束后积分最高的玩家得U钻。若积分最高的玩家不止一位，则进入抽牌环节，抽得牌的牌面最大的玩家得U钻。"
};
