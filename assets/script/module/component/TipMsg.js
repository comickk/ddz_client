// bind知识点

// 例子:
//var obj = {x: 81,};
//var foo = {
//    getX: function() {
//        return this.x;
//    }
//}
//
//console.log(foo.getX.bind(obj)());  //81
//console.log(foo.getX.call(obj));    //81
//console.log(foo.getX.apply(obj));   //81

//三个输出的都是81，但是注意看使用 bind() 方法的，他后面多了对括号。
//apply 、 call 、bind 三者都是用来改变函数的this对象的指向的；
//apply 、 call 、bind 三者第一个参数都是this要指向的对象，也就是想指定的上下文；
//apply 、 call 、bind 三者都可以利用后续参数传参；
// bind 是返回对应函数，便于稍后调用；apply 、call 则是立即调用 。
var Observer = require('Observer');
var GameData = require('GameData');

cc.Class({
    extends: Observer,

    properties: {
        titleLabel: {default: null, displayName: "标题", type: cc.Label},
        contentLabel: {default: null, displayName: "内容", type: cc.Label},

        btnOk: {default: null, displayName: "OK按钮", type: cc.Node},
        btnCancel: {default: null, displayName: "取消按钮", type: cc.Node},
        btnIKnow: {default: null, displayName: "我知道了按钮", type: cc.Node},

        _callbackIKnow: null,
        _callbackOK: null,
        _callbackCancel: null,
    },
    _onMsg(msg, data){
        if (msg == GameLocalMsg.SOCKET.CLOSE) {
            if (GameData.isReConnectServer == false) {//正在重新连接服务器,重连过程中不销毁这个dialog
                this.node.destroy();
            }
        } else if (msg == GameLocalMsg.Game.OnKeyBack) {// 再次按下back按键,销毁dialog
            if (this._callbackCancel) {
                this._callbackCancel();
            }else if (this._callbackIKnow) {
                this._callbackIKnow();
            }
            this.node.destroy();
        }
    },
    _getMsgList(){
        return [
            GameLocalMsg.SOCKET.CLOSE,
            GameLocalMsg.Game.OnKeyBack,
        ];
    },
    onLoad: function () {
        GameData.isResponseBackKey = true;
        this._initMsg();
    },
    onDestroy(){
        this._super();
        GameData.isResponseBackKey = false;
    },

    showMsgWithIKnow(title, content, callback, _this){
        this._initTitleContent(title, content);
        this.btnIKnow.active = true;

        this.btnCancel.active = false;
        this.btnOk.active = false;

        if (typeof callback == "function") {
            this._callbackIKnow = _this ? callback.bind(_this) : callback;
        }
    },
    showMsgWithOkCancel(title, content, callbackOK, callbackCancel, _this){
        this._initTitleContent(title, content);
        this.btnOk.active = true;
        this.btnCancel.active = true;

        this.btnIKnow.active = false;

        if (typeof callbackOK == "function") {
            this._callbackOK = _this ? callbackOK.bind(_this) : callbackOK;
        }
        if (typeof  callbackCancel == "function") {
            this._callbackCancel = _this ? callbackCancel.bind(_this) : callbackCancel;
        }
    },
    showMsgWithOk(title, content, callbackOK, _this){
        this._initTitleContent(title, content);
        this.btnOk.active = true;

        this.btnIKnow.active = false;
        this.btnCancel.active = false;

        if (typeof callbackOK == "function") {
            this._callbackOK = _this ? callbackOK.bind(_this) : callbackOK;
        }
    },
    onClickIKnow(){
        if (this._callbackIKnow) {
            this._callbackIKnow();
        }
        this.node.destroy();
    },
    onClickOk(){
        if (this._callbackOK) {
            this._callbackOK();
        }
        this.node.destroy();
    },
    onClickCancel(){
        if (this._callbackCancel) {
            this._callbackCancel();
        }
        this.node.destroy();
    },

    _initTitleContent(title, content){
        this.titleLabel.string = title;
        this.contentLabel.string = content;
    },
});
