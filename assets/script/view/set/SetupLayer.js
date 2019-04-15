var GameCfg = require('GameCfg');
var SDK = require("SDK");
var GameLocalStorage = require('GameLocalStorage');
var ObserverMgr = require('ObserverMgr');
var RouterMgr = require('RouterMgr');
var GameData = require('GameData');
var NetSocketMgr = require('NetSocketMgr');
var IconMgr = require('IconMgr');
var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        musicProgress: {default: null, displayName: "音乐滑动条", type: cc.ProgressBar},
        soundProgress: {default: null, displayName: "音效滑动条", type: cc.ProgressBar},

        musicSlider: {default: null, displayName: "音乐滑动器", type: cc.Slider},
        soundSlider: {default: null, displayName: "音效滑动器", type: cc.Slider},

        musicToggle: {default: null, displayName: "音乐复选框", type: cc.Toggle},
        soundToggle: {default: null, displayName: "音效复选框", type: cc.Toggle},

        pos1Toggle: {default: null, displayName: "pos1复选框", type: cc.Toggle},
        pos2Toggle: {default: null, displayName: "pos2复选框", type: cc.Toggle},

        topNode: {default: null, displayName: "顶部节点", type: cc.Node},
        webLayer: {default: null, displayName: "web界面", type: cc.Prefab},

        tipDlg: {default: null, displayName: "提示界面", type: cc.Prefab},

        bg: {default: null, displayName: "背景", type: cc.Sprite},
    },

    onLoad: function () {
        GameLocalStorage.initStorageData();

        // 音乐
        this.musicToggle.isChecked = GameCfg.music.isON;
        var musicProgress = 0;
        musicProgress = GameCfg.music.volume;
        this.musicSlider.progress = musicProgress;
        //this.onMusicSlider({progress: musicProgress});

        // 音效
        this.soundToggle.isChecked = GameCfg.sound.isON;
        var soundProgress = 0;
        soundProgress = GameCfg.sound.volume;
        this.soundSlider.progress = soundProgress;
        //this.onSoundSlider({progress: soundProgress});

        // 出牌按钮
        var order = GameCfg.btnOrderType;
        if (order == 1) {
            this.pos1Toggle.isChecked = true;
            this.pos2Toggle.isChecked = false;

        } else if (order == 2) {
            this.pos1Toggle.isChecked = false;
            this.pos2Toggle.isChecked = true;
        }

        // 背景
        var sceneIndex = GameData.getUseSceneId();
        IconMgr.setGameBg(this.bg, sceneIndex);
    },

    onMusicSlider(sliderNode){
        var value = sliderNode.progress;
        this.musicProgress.progress = value;
        //console.log(value);
        GameCfg.music.volume = value;
        cc.audioEngine.setMusicVolume(GameCfg.music.volume);
    },
    onSoundSlider(sliderNode){
        var value = sliderNode.progress;
        this.soundProgress.progress = value;
        //console.log(value);
        GameCfg.sound.volume = value;
        cc.audioEngine.setEffectsVolume(GameCfg.sound.volume);
    },

    // 打开音乐
    onClickMusicOpen(node){
        GameCfg.music.isON = node.isChecked;
        if (GameCfg.music.isON) {
            cc.audioEngine.setMusicVolume(GameCfg.music.volume);
        } else {
            cc.audioEngine.setMusicVolume(GameCfg.volumeZero);
        }
        GameLocalStorage.save();
    },
    // 打开音效
    onClickSoundOpen(node){
        GameCfg.sound.isON = node.isChecked;
        if (GameCfg.sound.isON) {
            cc.audioEngine.setEffectsVolume(GameCfg.sound.volume);
        } else {
            cc.audioEngine.setEffectsVolume(GameCfg.volumeZero);
        }
        GameLocalStorage.save();
    },
    // 出牌位置
    onClickPutCardPos(node, data){
        GameCfg.btnOrderType = parseInt(data);
        GameLocalStorage.save();
    },
    // 关闭
    onClickClose(){
        this.node.destroy();
    },
    onLogout(){
        SDK.exit();
    },
    onKefu(){
        SDK.kefu();
    },

    // 更换场景
    onClickChangeScene(){
        if (GameData.curScene == Poker.GameScene.Play) {
            Utils.showTips("游戏中无法更换场景");
            return;
            //var data = {
            //    title: "提示",
            //    content: "游戏中无法更换场景",
            //};
            //ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
        } else {
            RouterMgr.setRouter('home/changeScene');
            ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnRouter, null);
            this.onClickClose();
        }
    },
    // 更换账号
    onClickChangeAccount(){
        //if (GameData.curScene == Poker.GameScene.Play) {
        //    return;
        //    var data = {
        //        title: "提示",
        //        content: "游戏中无法更换账号",
        //    };
        //    ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
        //} else {
        //}
        //NetSocketMgr.disConnect();
        //cc.director.loadScene('Login');
        var tipDlglayer = cc.instantiate(this.tipDlg);
        this.topNode.addChild(tipDlglayer);
    },
    // 官网
    onClickHomePage(){
        this._addWebLayer("http://ddz.uu661.com");
    },
    // 帮助
    onClickHelp(){
        this._addWebLayer("http://ddz.uu661.com/doc/help.html");
    },
    // 反馈
    onFankui(){
        this._addWebLayer("http://ddz.uu661.com/doc/feedback.html");
    },
    _addWebLayer(url){
        if (cc.sys.platform == cc.sys.WIN32) {
            console.log('win32 平台不支持 webView');
            return;
        }

        if (this.topNode) {
            var layer = cc.instantiate(this.webLayer);
            this.topNode.addChild(layer);

            var script = layer.getComponent("WebLayer");
            if (script) {
                script.setWebUrl(url);
            }
        }
    },
    // 隐私政策
    onClickWeb1(){
        this._addWebLayer("http://ddz.uu661.com/doc/privacy.html");
    },
    // 服务条款
    onClickWeb2(){
        this._addWebLayer("http://ddz.uu661.com/doc/service.html");
    },
    // 游戏许可服务协议
    onClickWeb3(){
        this._addWebLayer("http://ddz.uu661.com/doc/permig.html");
    },
});
