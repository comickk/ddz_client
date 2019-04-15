var Observer = require('Observer');
var GameSceneUtil = require('GameSceneUtil');
var Utils = require('Utils');
var ImgMgr = require('ImgMgr');
var GamePokerType = require('GamePokerType');
var JsonFileCfg = require('JsonFileCfg');

cc.Class({
    extends: Observer,

    properties: {
        addNode: {default: null, displayName: "添加节点", type: cc.Node},
        moveNode: {default: null, displayName: "移动节点", type: cc.Node},
        roleSpine: {default: null, displayName: "角色spine", type: sp.Skeleton},


        textLabel: {default: null, displayName: "文本", type: cc.Label},

        pre: {default: null, displayName: "预制体", type: cc.Prefab},
    },
    _getMsgList(){
        return [GameLocalMsg.Play.OnShowIdentity];
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.Play.OnShowIdentity) {
        }
    },
    onLoad: function () {
        this._initMsg();
        //GameSceneUtil.onRoleThinkAni(this.roleSpine);
        //this._initTouch();
    },
    _addPrefab(){
        var node = cc.instantiate(this.pre);
        this.node.addChild(node);
        var script = node.getComponent("BoomEffect");
        if (script) {
            script.onBoomWithDirection(1);
        }
    },
    _initTouch(){
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.moveNode.x += event.getDeltaX();
            this.moveNode.y += event.getDeltaY();
            this.onClick(event);
            return true;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.moveNode.x += event.getDeltaX();
            this.moveNode.y += event.getDeltaY();
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.moveNode.x += event.getDeltaX();
            this.moveNode.y += event.getDeltaY();
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.moveNode.x += event.getDeltaX();
            this.moveNode.y += event.getDeltaY();
        }, this);
    },
    onClickNoMusic(){
        this._setVolume(0.001);
    },
    _setVolume(volume){
        var url = cc.url.raw("resources/audio/chat/woman/chat01.mp3");
        cc.audioEngine.setEffectsVolume(volume);
        var id = cc.audioEngine.playEffect(url, false);
        console.log("id: " + id);
    },
    onClickOpenMusic(){
        this._setVolume(1);
    },
    onClickPutCardBtn(){
        GameSceneUtil.onRoleRobLandlord(this.roleSpine);
    },
    onClick1(){
        var node = cc.instantiate(this.pre);
        this.node.addChild(node);
        var script = node.getComponent("BoomEffect");
        if (script) {
            script.onBoomWithDirection(1);
        }
        return;
        /*
         * cc.loader.load('a.png', function (err, tex) {
         cc.log('Result should be a texture: ' + (tex instanceof cc.Texture2D));
         });

         cc.loader.load('http://example.com/a.png', function (err, tex) {
         cc.log('Should load a texture from external url: ' + (tex instanceof cc.Texture2D));
         });

         cc.loader.load({url: 'http://example.com/getImageREST?file=a.png', type: 'png'}, function (err, tex) {
         cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
         });
         * */
        cc.loader.load({
            url: "http://tidy.coding.me/majiang/web-mobile/res/import/01/01192f469.json",
            type: "json"
        }, function (err, txt) {
            if (!err) {
                console.log(txt);
            } else {
                console.log(err);
            }
        });
    },
    onClick2(){
        var node = cc.instantiate(this.pre);
        this.node.addChild(node);
        var script = node.getComponent("BoomEffect");
        if (script) {
            script.onBoomWithDirection(2);
        }
    },
    onClick3(){
        var node = cc.instantiate(this.pre);
        this.node.addChild(node);
        var script = node.getComponent("BoomEffect");
        if (script) {
            script.onBoomWithDirection(3);
        }
    },
});
