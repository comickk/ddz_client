var GameCfg = require('GameCfg');
var Observer = require('Observer');
var SDK = require('SDK');
var ObserverMgr = require('ObserverMgr');
var Utils = require('Utils');
var NetSocketMgr = require('NetSocketMgr');
var NetHttpMgr = require('NetHttpMgr');
var GameLocalStorage = require('GameLocalStorage');
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var AudioPlayer = require('AudioPlayer');
var RouterMgr = require('RouterMgr');
var IconMgr = require('IconMgr');

var centerScene = cc.Class({
	extends: Observer,

	properties: {
		pbTipMsg: { default: null, displayName: '提示消息', type: cc.Prefab },
		pbUserInfo: { default: null, displayName: '用户信息', type: cc.Prefab },
		pbSetup: { default: null, displayName: '设置界面', type: cc.Prefab },
		pbActive: { default: null, displayName: '活动界面界面', type: cc.Prefab },
		pbCreateRole: { default: null, displayName: '创建角色', type: cc.Prefab },
		pbShop: { default: null, displayName: '商城', type: cc.Prefab },

		_rankData: cc.Object,

		racePre: { default: null, displayName: '竞技场Prefab', type: cc.Prefab },
		homePre: { default: null, displayName: '大厅界面', type: cc.Prefab },
		mailPre: { default: null, displayName: '邮件界面', type: cc.Prefab },
		goldModePre: { default: null, displayName: '金币场', type: cc.Prefab },
		gameModeNode: { default: null, displayName: '游戏模式节点', type: cc.Node },
		rulePre: { default: null, displayName: 'U钻比赛规则界面', type: cc.Prefab },
		netMaskPrefab: { default: null, displayName: '加载遮罩界面', type: cc.Prefab },

		topNode: { default: null, displayName: '顶部节点', type: cc.Node },
		guideNode: { default: null, displayName: '引导节点', type: cc.Node },
		netNode: { default: null, displayName: '网络节点', type: cc.Node },

		_mode: 0, // 当前模式 1.大厅 2.经典模式 3.夺钻模式

		GuideMask: { default: null, displayName: '引导遮罩', type: cc.Prefab },
		_isBankruptBeforeEnterRoom: false, // 进入房间之前是否受到破产补助

		centerMusic: { default: null, displayName: '大厅Music', type: cc.AudioClip },

		bg: { default: null, displayName: '背景', type: cc.Sprite },
	},
	statics: {
		instance: null,
	},
	_getMsgList() {
		return [
			GameLocalMsg.Race.Apply,
			GameLocalMsg.Classic.QuickBegan,
			GameLocalMsg.Classic.Enter,
			GameLocalMsg.Rank.ShowPlayerInfo,
			GameLocalMsg.Rank.ShowPlayerSelfInfo,

			GameLocalMsg.Center.ChangeMode, // 改变模式
			GameLocalMsg.Center.ShowChargeTips,
			GameLocalMsg.Center.ShowShop,
			GameLocalMsg.Center.ShowActive,

			GameNetMsg.recv.GetSysCfg.msg,
			GameLocalMsg.Center.AddGuideMask,
			GameNetMsg.recv.EnterHome.msg, // 进入游戏
			GameNetMsg.recv.OnBankrupt.msg, // 破产补助
			GameNetMsg.recv.OnMatchService.msg, // 匹配到客服
			GameNetMsg.recv.SetGameScene.msg, // 更换游戏场景			
			GameLocalMsg.Game.OnTriggerReconnect,
			GameLocalMsg.Game.OnForceOutLine,

			GameLocalMsg.Com.OnRouter,
			GameLocalMsg.Com.OnShowTips,
			GameLocalMsg.Game.OnKeyBack,
			GameLocalMsg.Game.OnReconnectFailed,

			GameLocalMsg.Game.OnInitiativeOutLine,
		];
	},
	_onMsg(msg, data) {
		cc.log('------center on msg -------   ' + msg);
		switch (msg){
			case GameLocalMsg.Race.Apply:
				//进入三人经典竞技场
				GameDataUtils.setEnterRoomData(Poker.GameRoomType.Gem, data.id);
				//NetSocketMgr.send(GameNetMsg.send.EnterHome, { room: data.id });
				Utils.addEnterGameLoading(this.netNode);
			break;

			case GameLocalMsg.Classic.QuickBegan:
				// 金币场 快速进入的房间
				var enterRoom = GameDataUtils.getCanEnterMaxGoldRoom();
				if (enterRoom) {
					GameDataUtils.setEnterRoomData(Poker.GameRoomType.Gold, enterRoom.id);
					NetSocketMgr.send(GameNetMsg.send.EnterHome, { room: enterRoom.id });
					Utils.addEnterGameLoading(this.netNode);
				} else {
					ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowChargeTips, null);
				}
				break;
		case GameLocalMsg.Classic.Enter:
			// 进入金币场
			GameDataUtils.setEnterRoomData(Poker.GameRoomType.Gold, data.id);
			//NetSocketMgr.send(GameNetMsg.send.EnterHome, { room: data.id });
			Utils.addEnterGameLoading(this.netNode);
			break;
		
		case	GameNetMsg.recv.EnterHome.msg:
			this._enterRoom();
			break;

		case GameNetMsg.recv.OnBankrupt.msg:
			// 破产
			Utils.destroyChildren(this.topNode);
			Utils.destroyChildren(this.netNode);
			// 提示破产
			this._isBankruptBeforeEnterRoom = true;
			var helpGold = data.getup;
			var str = '恭喜您获得' + helpGold + '金豆补助';
			Utils.showBankOutDlg(str, this.goToGameScene.bind(this));
			break;

		case GameLocalMsg.Rank.ShowPlayerInfo:
			// 显示其他玩家信息
			this.onShowRankPlayerInfo(data);
			break;

		case GameLocalMsg.Center.ChangeMode:
			this.changeMode(data);
			break;

		case GameNetMsg.recv.GetSysCfg.msg:
			// 获取系统配置
			this._onGetSysCfgBack();
			break;

		case GameLocalMsg.Center.ShowChargeTips:
			// 充值提示
			this._showChargeTipLayer();
			break;

		case GameLocalMsg.Center.ShowShop:
			// 商店
			this.onClickShop();
			break;

		case GameLocalMsg.Center.ShowActive:
			// 活动
			this.onClickActive();
			break;

		case GameLocalMsg.Center.AddGuideMask:
			if (this.guideNode) {
				var layer = cc.instantiate(this.GuideMask);
				this.guideNode.addChild(layer);
				var script = layer.getComponent('GuideMaskLayer');
				if (script) {
					script.initMask(data);
				}
			}
			break;	

		case GameLocalMsg.Game.OnForceOutLine:
			// 账号异地登录
			this._onForceOutLine(data);
			break;

		case GameLocalMsg.Rank.ShowPlayerSelfInfo:
			this.onClickHead();
			break;

		case GameLocalMsg.Com.OnRouter:
			this._onRouter(data);
			break;

		case GameNetMsg.recv.OnMatchService.msg:
			// 匹配到客服
			this._onNetMatchService(data);
			break;

		case GameLocalMsg.Com.OnShowTips:
			var title = data.title;
			var content = data.content;
			Utils.destroyChildren(this.netNode);
			var tmp = cc.instantiate(this.pbTipMsg);
			tmp.getComponent('TipMsg').showMsgWithIKnow(title, content);
			this.netNode.addChild(tmp);
			break;

		case GameNetMsg.recv.SetGameScene.msg:
			var sceneId = GameData.getUseSceneId();
			IconMgr.setGameBg(this.bg, sceneId);
			break;

		case GameLocalMsg.Game.OnKeyBack:
			this._onKeyBack();
			break;		

		case GameLocalMsg.Game.OnReconnectFailed:// 重连失败
			this._onReconnectFailed();
			break;

		case GameLocalMsg.Game.OnInitiativeOutLine:
			// 主动退出游戏
			// todo 添加loadingMask
			cc.director.loadScene('Login');

		case GameLocalMsg.Game.OnTriggerReconnect:// 触发重连
			this._onReConnect();
			break;
		}
	},
	_onNetOpen() {
		Utils.destroyChildren(this.netNode);
	},
	_onReconnectFailed(){
        Utils.destroyChildren(this.netNode);
        var tmp = cc.instantiate(this.pbTipMsg);
        tmp.getComponent('TipMsg').showMsgWithOkCancel(
            '友情提示',
            '无法连接网络, 是否继续尝试重连?',
            function () {//ok
                this._onReConnect();
            },
            function () {//cancel
                cc.director.loadScene("Login");
            },
            this);
        this.netNode.addChild(tmp);
    },
	
	_onKeyBack() {
		if (GameData.playData.guide <= 2) {
			// 引导结束响应back按键

			if (GameData.isResponseBackKey == true) {
				// 当正在响应back按键的时候,不做处理
				return;
			}
			Utils.showOkCancelDlg(
				'友情提示',
				'是否返回登录界面?',
				function() {
					//NetSocketMgr.disConnect();
				}.bind(this),
				null
			);
		}
	},
	// 匹配到客服
	_onNetMatchService(data) {
		console.log('匹配到客服');
	},
	// 响应路由
	_onRouter(data) {
		cc.log('--------------');
		var router = RouterMgr.getStepRouter();
		if (router == 'home') {
			this.changeMode(Poker.GameMode.Home);
		}
	},
	_onForceOutLine(data) {
		Utils.destroyChildren(this.netNode);
		var tmp = cc.instantiate(this.pbTipMsg);
		tmp.getComponent('TipMsg').showMsgWithIKnow(
			'友情提示',
			'您的账号在其他地方登陆,请重新登录...',
			function() {
				GameData.isForceOutLine = false;
				cc.director.loadScene('Login');
			},
			this
		);
		this.netNode.addChild(tmp);
	},

	_onReConnect(){
        cc.loader.loadRes("prefab/ReConnectLayer1", function (err, prefab) {
            if (!err) {
                Utils.destroyChildren(this.netNode);
                var layer = cc.instantiate(prefab);
                this.netNode.addChild(layer);
            }
        }.bind(this));
    },
	
	_onError(msg, code, data) {
		if (code == GameErrorMsg.GoldNotEnough) {
			// 金豆不足
			Utils.destroyChildren(this.netNode);
			this._showChargeTipLayer();
		} else if (code == GameErrorMsg.ReturnGame) {
			// 在其他房间对局
			Utils.destroyChildren(this.netNode);
			var curRoomID = GameData.roomData.roomID;
			var enterRoomID = data.room;
			var isSameRoom = curRoomID == enterRoomID;

			var b = GameDataUtils.setRoomDataByRoomID(data.room);
			if (!b) {
				console.log('本地不存在id为' + data.room + '的房间数据...');
			}
			// 房间不同提示一下
			if (isSameRoom) {
				this._reConnectGame();
			} else {
				Utils.destroyChildren(this.topNode);
				var tmp = cc.instantiate(this.pbTipMsg);
				tmp.getComponent('TipMsg').showMsgWithOkCancel(
					'友情提示',
					'您正在其他房间对局中，是否返回？',
					this._reConnectGame,
					null,
					this
				);
				this.topNode.addChild(tmp);
			}
		} else if (code == GameErrorMsg.BeyondMax) {
			// 进入的房间金豆超出上限
			Utils.destroyChildren(this.netNode);
			Utils.destroyChildren(this.topNode);
			var tmp = cc.instantiate(this.pbTipMsg);
			tmp.getComponent('TipMsg').showMsgWithIKnow('友情提示', '您的金豆超出该房间上限\n请去其他房间');
			this.topNode.addChild(tmp);
		}
	},

	// 从游戏中断线重连 ,不要使用this
	_reConnectGame() {
		GameData.roomData.isDisconnect = true;

		Utils.addEnterGameLoading(centerScene.instance.netNode);
		cc.director.preloadScene('GameScene', function() {
			Utils.destroyChildren(centerScene.instance.netNode);
			cc.director.loadScene('GameScene');
		});
	},
	_enterRoom() {
		// 在进入房间之前会受到破产补助
		if (this._isBankruptBeforeEnterRoom) {
			// 补助消息导致这么处理
			this._isBankruptBeforeEnterRoom = false;
			Utils.destroyChildren(this.netNode);
		} else {
			this.goToGameScene();
		}
	},
	onClickRules() {
		var clone = cc.instantiate(this.rulePre);
		this.node.addChild(clone);
	},

	_onGetSysCfgBack() {
		// 创建角色 放在获取系统配置之后的原因是因为引导会直接跳转到U钻场选择界面,需要U钻场配置信息
		var name = GameLocalStorage.getName();
		if (name.length <= 0) {
			let pbRole = cc.instantiate(this.pbCreateRole);
			this.topNode.addChild(pbRole);
			this.changeMode(Poker.GameMode.Home);
		} else {
			var guide = GameData.playData.guide;
			if (guide == 1 || guide == 0) {
				this.changeMode(Poker.GameMode.UStone); // 去U钻场
			} else {
				if (GameCfg.isShowRaceLayer) {
					this.changeMode(Poker.GameMode.UStone); // 去U钻场
				} else {
					this.changeMode(Poker.GameMode.Home);
				}
			}
		}
	},
	// 退回登陆界面
	onExitHome() {
		if (this._mode == Poker.GameMode.Home) {
			if (cc.sys.isBrowser) {
				//console.log('sdk exit');
				//SDK.exit();
				//NetSocketMgr.disConnect();
			} else if (cc.sys.isNative) {
				//NetSocketMgr.disConnect();
			}
		} else {
			this.changeMode(Poker.GameMode.Home);
		}
	},

	// 点击客服
	onClickService() {
		SDK.kefu();
	},
	// 活动
	onClickActive() {
		Utils.destroyChildren(this.topNode);

		var active = cc.instantiate(this.pbActive);
		this.topNode.addChild(active);
	},
	// 商店
	onClickShop() {
		Utils.destroyChildren(this.topNode);

		var shop = cc.instantiate(this.pbShop);
		this.topNode.addChild(shop);
	},
	// 个人信息
	onClickHead() {
		var item = cc.instantiate(this.pbUserInfo);
		this.node.addChild(item);
		item.getComponent('UserInfo').initSelfInfo();
	},
	// 显示排行玩家的信息
	onShowRankPlayerInfo(data) {
		Utils.destroyChildren(this.topNode);

		var item = cc.instantiate(this.pbUserInfo);
		this.topNode.addChild(item);
		item.getComponent('UserInfo').initUserInfo(data);
	},
	// 设置
	onClickSet() {
		Utils.destroyChildren(this.topNode);

		var item = cc.instantiate(this.pbSetup);
		this.topNode.addChild(item);
	},
	onLoad: function() {
		GameData.curScene = Poker.GameScene.Center_Home;
		AudioPlayer.playMusic(this.centerMusic, true);

		//cc.director.setDisplayStats(true);
		centerScene.instance = this;
		this._initMsg();

		// 获取系统配置:普通场,竞技场房间数据
		NetSocketMgr.send(GameNetMsg.send.GetSysCfg, {});
		this._initUI();		
	},
	_initUI() {
		var sceneIndex = GameData.getUseSceneId();
		console.log('背景：sceneIndex: ' + sceneIndex);
		IconMgr.setGameBg(this.bg, sceneIndex);
	},
	// 改变模式
	changeMode: function(mode) {
		this._mode = mode;
		if (this._mode == Poker.GameMode.Home) {
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, false);
			this._addHome();
		} else if (this._mode == Poker.GameMode.Gold) {
			this._addGoldRoom();
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		} else if (this._mode == Poker.GameMode.UStone) {
			this._addRaceRoom();
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		} else if (this._mode == Poker.GameMode.Mail) {
			this._addMail();
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		} else {
			// 进入其他模式(角色,场景)
		}
	},
	// 邮件
	_addMail() {
		Utils.destroyChildren(this.gameModeNode);
		var clone = cc.instantiate(this.mailPre);
		this.gameModeNode.addChild(clone);
	},
	// 大厅
	_addHome() {
		Utils.destroyChildren(this.gameModeNode);
		var clone = cc.instantiate(this.homePre);
		this.gameModeNode.addChild(clone);
	},
	// 金币场
	_addGoldRoom() {
		Utils.destroyChildren(this.gameModeNode);

		var clone = cc.instantiate(this.goldModePre);
		var script = clone.getComponent('ClassicMode');
		if (script) {
			cc.log(GameData.roomInfo.goldRoom);
			script.initData(GameData.roomInfo.goldRoom);
		}
		this.gameModeNode.addChild(clone);
	},
	// 显示三人经典竞技场
	_addRaceRoom() {
		Utils.destroyChildren(this.gameModeNode);
		var gemInfo = GameData.roomInfo.gemRoom;
		if (this.racePre) {
			var race = cc.instantiate(this.racePre);
			race.x = race.y = 0;
			var script = race.getComponent('RaceMode');
			if (script) {
				script.initData(gemInfo);
			}
			this.gameModeNode.addChild(race);
		}
	},
	_showChargeTipLayer() {
		Utils.destroyChildren(this.topNode);
		var tmp = cc.instantiate(this.pbTipMsg);
		var script = tmp.getComponent('TipMsg');
		script.showMsgWithOkCancel(
			'友情提示',
			'您的金豆不足，是否去充值？',
			function() {
				ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, null);
			},
			null,
			this
		);
		this.topNode.addChild(tmp);
	},

	goToGameScene() {
		if (cc.find('EnterGameLoading', this.netNode) == false) {
			Utils.destroyChildren(this.netNode);
			Utils.addEnterGameLoading(this.netNode);
		} else {
			console.log('has EnterGameLoading Layer');
		}
		cc.director.preloadScene(
			'GameScene',
			function() {
				cc.director.loadScene('GameScene');
			}.bind(this)
		);
	},
});
