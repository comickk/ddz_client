var ObserverMgr = require('ObserverMgr');
var GameCfg = require('GameCfg');

module.exports = {
    isShowGame: true,// 因为会触发2次show/hide事件导致的
    _isInit: false,// 是否初始化过
    // 切换前后台事件
    initShowHideWindowEvent(){
        if (this._isInit == false) {
            this._isInit = true;
            this.isShowGame = true;
            cc.game.off(cc.game.EVENT_HIDE, this._onWinHide.bind(this));
            cc.game.off(cc.game.EVENT_SHOW, this._onWinShow.bind(this));
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

            cc.game.on(cc.game.EVENT_HIDE, this._onWinHide.bind(this));// 游戏进入后台
            cc.game.on(cc.game.EVENT_SHOW, this._onWinShow.bind(this));// 游戏恢复
            //cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
        } else {
            console.log("[GameReady] has init");
        }
    },
    // 声音大小
    initVoice(){
        var effectVolume = GameCfg.getSoundVolume();
        cc.audioEngine.setEffectsVolume(effectVolume);

        var musicVolume = GameCfg.getMusicVolume();
        cc.audioEngine.setMusicVolume(musicVolume);
    },
    _onHideVoice(){
        cc.audioEngine.setEffectsVolume(GameCfg.volumeZero);
        cc.audioEngine.setMusicVolume(GameCfg.volumeZero);
    },
    _onWinShow(){
        if (this.isShowGame == false) {
            this.isShowGame = true;
            console.log(">>>>>>>>>>>>>>>win show<<<<<<<<<<<<<<<<<");
            cc.sys.garbageCollect();//强制一次垃圾回收
            cc.audioEngine.resumeAll();
            cc.audioEngine.resumeAllEffects();
            this.initVoice();
            ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnWinShow, null);
        }
    },
    _onWinHide(){
        if (this.isShowGame == true) {
            this.isShowGame = false;
            console.log(">>>>>>>>>>>>>>>win hide<<<<<<<<<<<<<<<<<");
            cc.audioEngine.pauseAll();
            cc.audioEngine.pauseAllEffects();
            this._onHideVoice();
            ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnWinHide, null);
        }
    },
    _onKeyDown(event){
        console.log("[Key] 按下: " + event.keyCode.toString());
    },
    _onKeyUp(event){
        console.log("[Key] 弹起: " + event.keyCode.toString());
        if (event.keyCode == cc.KEY.backspace || event.keyCode == cc.KEY.back) {
            ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnKeyBack, null);
        }
    }
};