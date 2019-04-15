var ObserverMgr = require('ObserverMgr');
var GameStaticCfg = require('GameStaticCfg');
var GameData = require('GameData');
var Utils = require('Utils');
//var RSA = require('node-rsa');
var DataEncrypt = require('DataEncrypt');
var NativeSdk = require('NativeSdk');

module.exports = {
	ws: null,
	heartID: null, // 心跳ID
	isNetOpen: false,

	init: function() {
		ObserverMgr.addEventListener(GameLocalMsg.SOCKET.Change, this.onNetChange, this);
		GameData.isInitiativeOutLine = false;
		this.isNetOpen = false;

		this.ws = null;
		this.wsKeyNum++;
		this._clearHearBeat();
		this._cleanCallBack();

		//var url = this.getSocketAddress();
		//var url = "ws://121.40.165.18:8088";// 测试的url
		var url = 'ws://192.168.0.126:8765'; // 测试的url
		this.ws = new WebSocket(url);
		console.log('[NetSocketMgr] 连接地址:' + url);
		//this.ws.binaryType = 'arraybuffer';
		this.ws.onopen = this.onOpen.bind(this);
		this.ws.onmessage = this.onMessage.bind(this);
		this.ws.onerror = this.onError.bind(this);
		this.ws.onclose = this.onClose.bind(this);
	},
	_cleanCallBack() {
		if (this.ws) {
			this.ws.onopen = null;
			this.ws.onmessage = null;
			this.ws.onerror = null;
			this.ws.onclose = null;
		}
	},

	//////////////////////网络状态发生改变/////////////////////////////////////
	onNetChange(msg, data) {
		if (msg == GameLocalMsg.SOCKET.Change) {
			if (data == false) {
				// 网络失去连接
				this.onClose();
			}
		}
	},

	//////////////////////Socket 重连/////////////////////////////////////
	reConnect() {
		if (this.ws) {
			if (this.ws.readyState == WebSocket.OPEN) {
				console.log('[NetSocket]重连: 网络已经打开,正在认证中...');
			} else if (this.ws.readyState == WebSocket.CONNECTING) {
				console.log('[NetSocket]重连: 网络已经建立,正在握手中... state:' + this.ws.readyState);
			} else {
				console.log('[NetSocket]重连: 网络已经建立,state:' + this.ws.readyState);
			}
		} else {
			console.log('[NetSocket]重连: socket = null, 重新初始化网络');
			this.init();
		}
	},
	//////////////////////Socket 打开/////////////////////////////////////
	onOpen: function() {
		console.log('[Socket Open]');
		this.isNetOpen = true;
		ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.OPEN, null);
	},

	//////////////////////Socket 心跳/////////////////////////////////////
	// 开启心跳
	openHeartBeat() {
		if (this.heartID) {
			this._clearHearBeat();
		}
		this.heartID = setInterval(this.onHeartBeat.bind(this), 5000);
	},
	// 心跳
	onHeartBeat() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			//this.ws.send('[1100]');
			var data = { scene: 2 };
			if (this.ws && this.ws.readyState == WebSocket.OPEN) {
				this.ws.send(DataEncrypt.dataEncode(1100, {}));
			}
		} else {
			// 网络出现问题
			console.log('[NetSocketMgr] on heart beat, but no connection net or net is enable');
			this._clearHearBeat();
		}
	},
	// 清除心跳
	_clearHearBeat() {
		if (this.heartID != null) {
			console.log('[NetSocketMgr] clean beat: success to clean id = ' + this.heartID);
			clearInterval(this.heartID);
			this.heartID = null;
		} else {
			console.log('[NetSocketMgr] clean beat: failed, no heart to stop');
		}
	},
	//////////////////////////Socket 错误/////////////////////////////////
	onError: function() {
		console.log('[Socket Error]');
		this._clearHearBeat();
		this._cleanCallBack();
		this.ws = null;
		this.isNetOpen = false;
		ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.ERROR, null);
	},
	//////////////////////////Socket关闭//////////////////////////////////
	onClose: function() {
		this._clearHearBeat();
		this._cleanCallBack();
		this.ws = null;
		this.isNetOpen = false;

		console.log('[NetSocketMgr] Socket Close');

		if (
			GameData.isForceOutLine == false && // 没有被单点登录下线,真正的网络问题导致的下线
			GameData.isInitiativeOutLine == false && // 不是主动退出导致的断线
			GameData.isReConnectServer == false
		) {
			// 需要重连
			ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnTriggerReconnect, null);
		} else if (GameData.isForceOutLine == true) {
			// 单点登录强制下线
			console.log('[NetSocketMgr] onSocket close: user force out line');
			ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnForceOutLine, null);
		} else if (GameData.isForceOutLine == false && GameData.isInitiativeOutLine == true) {
			// 主动下线
			console.log('[NetSocketMgr] onSocket close: user initiative OutLine');
			ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnInitiativeOutLine, null);
		} else {
			console.log('[NetSocketMgr] onSocket close: do nothing');
			ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.CLOSE, null);
		}
	},
	disConnect() {
		if (this.ws && this.ws.readyState == WebSocket.OPEN) {
			// 调用sdk的登出
			if (GameData.visitorAccount) {
				console.log('[NetSocketMgr] 访客账号无需退出call exit sdk');
			} else {
				NativeSdk.onSdkExit();
			}
			GameData.isInitiativeOutLine = true;
			this.ws.close();
		}
	},
	// sdk切换账号,不需要调用sdk的退出,这一步sdk自己会做
	changeAccount() {
		if (this.ws && this.ws.readyState == WebSocket.OPEN) {
			GameData.isInitiativeOutLine = true;
			this.ws.close();
		}
	},
	// [指令编号,提交数据]
	// 例子：[1000,{"name":"zhangsan"}]
	// 返回值表示是否发送成功,方便为断线重连做准备
	send: function(msg, data = '') {
		//  {id: 1, msg: "", desc: ""}
		if (this.ws) {
			if (this.ws.readyState == WebSocket.OPEN) {				
				var str =this._showSendData(msg['sendId'], msg['msg'], data);				
				this.ws.send(str);
				//this.ws.send(DataEncrypt.dataEncode(id, data));
				ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.SEND, msg['msg']);
				return true;
			} else {
				console.log('网络失去连接...');
				this.onClose();
				return false;
			}
		} else {
			console.log('网络连接出现问题:可能没有初始化网络,或网络失去连接!');
			this.onClose();
			return false;
		}
	},

	_showSendData(id, msg, data) {
		var sendData = { id: id, msg: msg, data: data };
		var str = JSON.stringify(sendData);
		console.log('[Socket 发送数据==>]' + str);
		return str;
	},

	onMessage: function(event) {
		// 派发事件
		var time = new Date();
		var sec = time.getSeconds();
		var min = time.getMinutes();
		var hour = time.getHours();
		console.log('[Socket] onMessage time: ' + hour + ':' + min + ':' + sec);
		//var recvData = DataEncrypt.dataDecode(event.data) // 解密
		console.log('接收 <== '+ event.data);
		var recvData = JSON.parse(event.data);
		var order = recvData['order'];
		var msg = GameNetMsg.getReceiveMsgStrByID(order);
		var code = recvData['code'];
		var data = recvData['data'];
		this._showRectData(order, code, data);
		ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.RECV, null);
		if (code == 0) {			
			ObserverMgr.dispatchMsg(msg, data);
		} else {
			// 派发错误消息事件
			ObserverMgr.dispatchMsg(GameErrorMsg.ErrorString, [msg, code, data]);
		}
	},

	// 对返回的数据进行二次包装
	_showRectData(id, code, data) {
		var msg = GameNetMsg.getReceiveMsgStrByID(id);
		var recv = { id: id, msg: msg, code: code, data: data };
		var str = JSON.stringify(recv);
		console.log('[Socket 接收数据<==]' + str);
	},

	testsend(){
		var str ='{"cmd":"login","unionid":"haha"}';
		this.ws.send(str);
	}
};
