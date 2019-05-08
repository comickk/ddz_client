// 本地缓存全部做成一个字符串
var GameCfg = require('GameCfg');

module.exports = {
    // todo 通用存储,账号存储
    catchKey: "catchKey",
    catchData: {
        // 仅仅只是缓存
        userName: null,// 用户名
        showRaceRuleCount: 0,// 展示比赛场游戏规则次数
        localVersion: "",
        remoteVersion: "",

        // 跟游戏设置有关缓存
        musicVoice: 0,
        musicIsOn: true,
        soundVoice: 0,
        soundIsOn: true,
        putCardBtnSeq: 1,// 出牌按钮顺序

        catchUserName: null,// 缓存的用户名
        catchPwd: null,// 缓存的密码
    },
    ///////////////////////////////////////////////////////////
    setName(name){
        this.catchData.userName = name;
        this.save();
    },
    getName(){
        return this.catchData.userName;
    },
    addShowRaceRleCount(){
        var num = this.catchData.showRaceRuleCount++;
        this.catchData.showRaceRuleCount = num;
        this.save();
    },
    getIsShowRaceRuleCount(){
        return this.catchData.showRaceRuleCount;
    },

    getLocalVersion(){
        return this.catchData.localVersion.toString();
    },
    getRemoteVersion(){
        return this.catchData.remoteVersion.toString();
    },
    setVersion(local, remote){
        this.catchData.localVersion = local;
        this.catchData.remoteVersion = remote;
        this.save();
    },
    setCatchUserName(user){
        this.catchData.catchUserName = user;
    },
    getCatchUserName(){
        return this.catchData.catchUserName;
    },
    setCatchPwd(pwd){
        this.catchData.catchPwd = pwd;
    },
    getCatchPwd(){
        return this.catchData.catchPwd;
    },

    ///////////////////////////////////////////////////////////
    _isInit: false,
    initStorageData(){
        if (this._isInit == false) {
            this._isInit = true;
            var saveStr = cc.sys.localStorage.getItem(this.catchKey);
            if (saveStr) {
                var saveObj = JSON.parse(saveStr);

                this.catchData.userName = saveObj.userName || "";
                this.catchData.showRaceRuleCount = saveObj.showRaceRuleCount;
                this.catchData.localVersion = saveObj.localVersion || "";
                this.catchData.remoteVersion = saveObj.remoteVersion || "";

                GameCfg.music.volume = saveObj.musicVoice || 0.5;// 音乐音量大小
                GameCfg.music.isON = saveObj.musicIsOn;// 音乐开关
                GameCfg.sound.volume = saveObj.soundVoice || 0.5;// 音效音量大小
                GameCfg.sound.isON = saveObj.soundIsOn;// 音效开关
                GameCfg.btnOrderType = saveObj.putCardBtnSeq || 2;// 出牌顺序
            } else {// 第一次玩
                GameCfg.music.volume = 0.5;
                GameCfg.music.isON = true;
                GameCfg.sound.volume = 0.5;
                GameCfg.sound.isON = true;
                GameCfg.btnOrderType = 2;
            }
        } else {
            //console.log("[GameLocalStorage] has init");
        }
    },


    save(){
        this.catchData.musicIsOn = GameCfg.music.isON; // 声音开关
        this.catchData.musicVoice = GameCfg.music.volume;    // 声音大小

        this.catchData.soundIsOn = GameCfg.sound.isON;  // 音效开关
        this.catchData.soundVoice = GameCfg.sound.volume;// 音效大小

        this.catchData.putCardBtnSeq = GameCfg.btnOrderType;// 出牌按钮顺序

        var saveStr = JSON.stringify(this.catchData);
        cc.sys.localStorage.setItem(this.catchKey, saveStr);
    },
};
