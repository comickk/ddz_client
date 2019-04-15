var ObserverMgr = require("ObserverMgr");
module.exports = {
    ws: null,

    init: function () {
        this.ws = null;
        var url = "ws://127.0.0.1:2048/ws";
        this.ws = new WebSocket(url);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    },


    //////////////////////Socket 重连/////////////////////////////////////
    reConnect(){
        this.init();
    },
    //////////////////////Socket 打开/////////////////////////////////////
    onOpen: function () {
        cc.log("[Socket Open]");
        ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.OPEN, null);
    },

    //////////////////////////Socket 错误/////////////////////////////////
    onError: function () {
        cc.log("[Socket Error]");
        this.ws = null;
        ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.ERROR, null);
    },
    //////////////////////////Socket关闭//////////////////////////////////
    onClose: function () {
        this.ws = null;
        cc.log("[Socket Close]");
    },
    disConnect(){
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.DISCONNECT, null);
            this.ws.close();
            this.ws = null;
        }
    },
    // [指令编号,提交数据]
    // 例子：[1000,{"name":"zhangsan"}]
    // 返回值表示是否发送成功,方便为断线重连做准备
    send: function (msg, data = "") {
        //  {id: 1, msg: "", desc: ""}
        if (this.ws) {
            if (this.ws.readyState == WebSocket.OPEN) {
                var id = msg['sendId'];
                var sendData = {id: id, data: data};
                var str = JSON.stringify(sendData);
                this.ws.send(str);
                ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.SEND, msg['msg']);
                this._showSendData(id, msg["msg"], data);
                return true;
            } else {
                console.log("网络失去连接...");
                this.onClose();
                return false;
            }
        } else {
            console.log("网络连接出现问题:可能没有初始化网络,或网络失去连接!");
            this.onClose();
            return false;
        }
    },

    _showSendData(id, msg, data){
        var sendData = {id: id, msg: msg, data: data};
        var str = JSON.stringify(sendData);
        cc.log("[Socket 发送数据==>]" + str);
    },

    onMessage: function (event) {
        // 派发事件
        var receiveData = JSON.parse(event.data);
        var id = receiveData['id'];
        var msg = GameHallNetMsg.getReceiveMsgStrByID(id);
        var code = receiveData['code'];
        var data = receiveData['data'];
        this._showRectData(id, code, data);
        ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.RECV, null);
        if (code == 0) {
            ObserverMgr.dispatchMsg(msg, data);
        } else {
            // 派发错误消息事件
            ObserverMgr.dispatchMsg(GameErrorMsg.ErrorString, [msg, code, data]);
        }
    },


    // 对返回的数据进行二次包装
    _showRectData(id, code, data){
        var msg = GameHallNetMsg.getReceiveMsgStrByID(id);
        var recv = {id: id, msg: msg, code: code, data: data};
        var str = JSON.stringify(recv);
        cc.log("[Socket 接收数据<==]" + str);
    }
}
