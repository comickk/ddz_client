//var NetHttpMgr = require('NetHttpMgr');
var NetSocketMgr = require('NetSocketMgr');
var GameStaticCfg = require('GameStaticCfg');
var GameReady = require('GameReady');
var GameData = require('GameData');
var GameLocalStorage = require('GameLocalStorage');
var Utils = require('Utils');
var JsonFileCfg = require('JsonFileCfg');
var AudioPlayer = require('AudioPlayer');


var Login = cc.Class({
	extends: require('Observer'),

	properties: {
		versionLabel: { default: null, displayName: '版本号', type: cc.Label },
		maskPrefab: { default: null, displayName: '遮罩', type: cc.Prefab },
		tipMsgPrefab: { default: null, displayName: '消息提示预制体', type: cc.Prefab },

		topNode: { default: null, displayName: '顶部节点', type: cc.Node },

		loginMusic: { default: null, displayName: '登录Music', type: cc.AudioClip },

		loginBtn: { default: null, displayName: '登录按钮节点', type: cc.Node },

		tipsLabel: { default: null, displayName: '提示label', type: cc.Label },
		_isError: false,
	},
	statics: {
		instance: null,
	},
	_getMsgList() {
		return [
			GameNetMsg.recv.GetUserInfo.msg,
			GameNetMsg.recv.AnonymityLogin.msg,
				
			GameLocalMsg.SOCKET.OPEN,
            GameLocalMsg.SOCKET.SEND,
            GameLocalMsg.SOCKET.RECV,
            GameLocalMsg.SOCKET.ERROR,
			GameLocalMsg.SOCKET.CLOSE,

			GameLocalMsg.Game.OnTriggerReconnect,
			GameLocalMsg.Game.OnForceOutLine,
			
			//GameLocalMsg.SOCKET.ERROR,//登录界面无socket 连接,此处只是用于显示登录失败
			GameLocalMsg.Game.OnKeyBack,	
		];
	},
	_onLoginFailed(tipsContent) {
		Utils.destroyChildren(this.topNode);
		this._showTipsLabel(tipsContent);

		Utils.showIKnowDlg(
			'提示',
			tipsContent,
			function() {
				this.loginBtn.active = true;
				this.tipsLabel.node.active = false;
			}.bind(this)
		);
	},
	// 网络真正可用了
	_onNetOpen() {},
	_onMsg(msg, data) {
		switch (msg) {
			case GameNetMsg.recv.GetUserInfo.msg:
				// 获取用户信息		
				cc.log(GameData.playData);		
				cc.director.preloadScene('Center', this._onGoToCenter.bind(this));
				break;						

			case GameNetMsg.recv.AnonymityLogin.msg:// 登录成功
				this._showTipsLabel("登录游戏成功,正在获取用户信息...");
				GameLocalStorage.save();
				NetSocketMgr.send(GameNetMsg.send.GetUserInfo, {});
				break;
			
			case GameLocalMsg.SOCKET.RECV:
				break;

			case GameLocalMsg.SOCKET.OPEN:// 网络连接成功
				this._showTipsLabel("连接服务器成功...");				
				this._onLoginWithUser();
				break;

			case GameLocalMsg.SOCKET.SEND:
				this.loginBtn.active = false;
				break;

			case GameLocalMsg.SOCKET.ERROR:
				this.loginBtn.active = true;
				Utils.destroyChildren(this.topNode);
				Utils.showIKnowDlg("提示", "连接服务器失败,请重试...");
				break;			

			case GameLocalMsg.SOCKET.CLOSE:// 网络断开
				this.loginBtn.active = true;
				this._isError = true;
				this._onSocketClose();
				break;

			case GameLocalMsg.Game.OnTriggerReconnect:// 网络错误
				this.loginBtn.active = true;
				this._isError = true;
				this._onNetSocketDisconnect();
				break;
			
			case GameLocalMsg.Game.OnForceOutLine:// 强制下线
				this.loginBtn.active = true;
				this._isError = true;
				this._onForceOutLine(data);
				break;

			case GameLocalMsg.Game.OnKeyBack:
				this._onKeyBack();
				break;			

			default:
				cc.log(msg);
				break;			
		}
	},
	_onKeyBack() {
		if (GameData.isResponseBackKey == true) {
			// 当正在响应back按键的时候,不做处理
			return;
		}
		Utils.showOkCancelDlg(
			'友情提示',
			'是否退出游戏?',
			function() {				
				cc.director.end();
			}.bind(this),
			null
		);
	},
	_addNetMask() {
		Utils.destroyChildren(this.topNode);
		var node = cc.instantiate(this.maskPrefab);
		this.topNode.addChild(node);
	},
	_showTipsLabel(str) {
		console.log(str);
		this.tipsLabel.node.active = true;
		this.tipsLabel.string = str;
	},
	_cleanTipsLabel() {
		this.tipsLabel.node.active = false;
		this.tipsLabel.string = '';
	},
	
	_onGoToCenter() {
		Utils.destroyChildren(this.topNode);
		if (this._isError) {
			this.loginBtn.active = true;
			console.log('进入游戏过程中网络断开...');
		} else {
			cc.director.loadScene('Center');
		}
	},

	onLoad: function() {
		//cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;// 设置纹理坐标计算方式
		
		GameData.curScene = Poker.GameScene.Login;
		this.loginBtn.active = false;
		this.tipsLabel.node.active = false;

		this._initMsg();
		this._enterGame();

		//从地址栏中取出id
		var id = this.GetQueryString('id');
		if (id != null && id.toString().length > 1) {
			GameData.id = id;
		}				
	},

	// 开始正式进入游戏
	_enterGame() {
		this.loginBtn.active = true;
		this.tipsLabel.node.active = false;

		GameLocalStorage.initStorageData(); // 读取保存到本地的配置
		// 加载json配置文件
		JsonFileCfg.init();

		GameData.initGameDataEvent(); // 本地缓存Data事件注册
		GameReady.initShowHideWindowEvent();
		GameReady.initVoice();
		AudioPlayer.playMusic(this.loginMusic, true);
	},

	
	// 点击登录
	onClickLogin(event) {
		this._addNetMask();
		this.loginBtn.active = false;
		this._isError = true;
		GameData.visitorAccount = false;
		NetSocketMgr.init();// Socket网络初始化
		//NetHttpMgr.userLogin(GameData.id);
	},		
	// 登录请求
    _onLoginWithUser(){
        if (NetSocketMgr.isNetOpen) {
            //GameData.visitorAccount = true;
            this._isError = false;
            this.loginBtn.active = false;
            cc.director.preloadScene("Center");          
            NetSocketMgr.send(GameNetMsg.send.AnonymityLogin, {id:GameData.id});            
        } else {
            Utils.showIKnowDlg("提示", "网络出现问题,请重新连接", function () {
                NetSocketMgr.init();// Socket网络初始化
            }.bind(this));
        }
	},

	_onForceOutLine(data){
        Utils.destroyChildren(this.topNode);
        Utils.showIKnowDlg("友情提示", "您的账号在其他地方登陆,请重新登录...",
            function () {
                GameData.isForceOutLine = false;
                cc.director.loadScene("Login");
            }.bind(this));
	},
	
	_onSocketClose(){
        Utils.destroyChildren(this.topNode);
        Utils.showIKnowDlg("友情提示", "网络断开链接,请重新登录...",
            function () {
                cc.director.loadScene("Login");
            }.bind(this));
    },
    _onNetSocketDisconnect(){
        this.tipsLabel.node.active = false;
        Utils.destroyChildren(this.topNode);
        Utils.showOkCancelDlg("友情提示", "网络断开链接,请重新登录...",
            function () {
                Utils.destroyChildren(this.topNode);
                this.onClickLogin();
            }.bind(this),
            function () {
                if (cc.sys.isNative) {
                    cc.director.end();
                } else if (cc.sys.isBrowser) {
                    this.tipsLabel.node.active = false;
                    Utils.destroyChildren(this.topNode);
                }
            }.bind(this));
    },

	//取出url后缀字符
	GetQueryString(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
		var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
		if (r != null) return unescape(r[2]);
		return null;
	},
});
