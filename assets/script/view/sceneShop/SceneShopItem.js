var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var JsonFileMgr = require('JsonFileMgr');
var IconMgr = require('IconMgr');
var ImgMgr = require('ImgMgr');
var SceneShopModule = require('SceneShopModule');
var GameData = require('GameData');

cc.Class({
    extends: Observer,

    properties: {
        sceneName: {default: null, displayName: "场景名字", type: cc.Label},

        useFlag: {default: null, displayName: "使用中", type: cc.Node},
        useTime: {default: null, displayName: "使用期限", type: cc.Node},
        selectFlag: {default: null, displayName: "选择中", type: cc.Node},
        _sceneID: 0,
        _isSelected: null,
        _isUsing: null,
        bgSprite: {default: null, displayName: "背景", type: cc.Sprite},

    },

    _getMsgList(){
        return [
            SceneShopModule.OnSelectItem,
            GameNetMsg.recv.SetGameScene.msg,
        ];
    },

    _onMsg(msg, data){
        if (msg == SceneShopModule.OnSelectItem) {
            var b = data == this._sceneID;
            if (b) {
                this._setSelected(true);
            } else {
                this._setSelected(false);
            }
        } else if (msg == GameNetMsg.recv.SetGameScene.msg) {
            var curScene = GameData.getUseSceneId();
            this._setUsing(this._sceneID == curScene);
        }
    },

    onLoad: function () {
        this._initMsg();

        this._setSelected(false);
        this._setUsing(false);

    },
    getSceneID(){
      return this._sceneID;
    },
    _setSelected(b){
        if (b != this._isSelected) {
            this._isSelected = b;
            this.selectFlag.active = this._isSelected;
        }
    },
    _setUsing(b){
        if (b != this._isUsing) {
            this._isUsing = b;
            this.useFlag.active = this._isUsing;
        }
    },
    setData(sceneID){
        this._sceneID = sceneID;
        var sceneData = JsonFileMgr.getSceneCfgDataBySceneId(sceneID);
        if (sceneData) {
            this.sceneName.string = sceneData['name'];
            var pngUrl = sceneData['png'];
            ImgMgr.setImg(this.bgSprite, pngUrl);
        }
    },
    onClickItem(){
        ObserverMgr.dispatchMsg(SceneShopModule.OnSelectItem, this._sceneID);
    },
});
