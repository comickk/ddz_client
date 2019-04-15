var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');
var Utils = require('Utils');
var RouterMgr = require('RouterMgr');

cc.Class({
	extends: Observer,

	properties: {
		sceneLayer: { default: null, displayName: '场景界面', type: cc.Prefab },
		roleShopLayer: { default: null, displayName: '角色商城界面', type: cc.Prefab },
		homeCenterLayer: { default: null, displayName: '大厅中心界面', type: cc.Prefab },
		addNode: { default: null, displayName: '添加节点', type: cc.Node },
		giftLayer: { default: null, displayName: '兑换礼物界面', type: cc.Prefab },

		roleBg: { default: null, displayName: '角色背景框', type: cc.Sprite },
		sceneBg: { default: null, displayName: '场景背景框', type: cc.Sprite },
		mailBg: { default: null, displayName: '邮件背景框', type: cc.Sprite },
		activeBg: { default: null, displayName: '活动背景框', type: cc.Sprite },
		exchangeBg: { default: null, displayName: '兑换背景框', type: cc.Sprite },
		shopBg: { default: null, displayName: '商店背景框', type: cc.Sprite },

		_clickIndexArr: [], // 点击的index记录
	},
	_onMsg(msg, data) {
		if (msg == GameLocalMsg.Center.OnClickCloseHomeItemLayer) {
			var len = this._clickIndexArr.length;
			var index = 0;
			if (len >= 0) {
				index = this._clickIndexArr[len - 1];
			}
			this._changeItemBg(index);
		}
	},
	_getMsgList() {
		return [GameLocalMsg.Center.OnClickCloseHomeItemLayer];
	},
	onLoad: function() {
		this._initMsg();
		this._changeItemBg(0);
		var router = RouterMgr.getStepRouter();
		if (router == 'changeScene') {
			this._addSceneLayer();
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
			ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Scene);
		} else {
			this._addHomeCenterLayer();
		}
	},

	_addHomeCenterLayer() {
		Utils.destroyChildren(this.addNode);
		var pre = cc.instantiate(this.homeCenterLayer);
		this.addNode.addChild(pre);
	},
	_addRoleSelectLayer() {
		Utils.destroyChildren(this.addNode);
		var pre = cc.instantiate(this.roleShopLayer);
		this.addNode.addChild(pre);
	},
	_addSceneLayer() {
		Utils.destroyChildren(this.addNode);
		var pre = cc.instantiate(this.sceneLayer);
		this.addNode.addChild(pre);
	},
	_changeItemBg(index) {
		this.roleBg.setVisible(false);
		this.sceneBg.setVisible(false);
		this.mailBg.setVisible(false);
		this.activeBg.setVisible(false);
		this.exchangeBg.setVisible(false);
		this.shopBg.setVisible(false);

		if (index == 1) {
			// 角色
			this._clickIndexArr.push(index);
			this.roleBg.setVisible(true);
		} else if (index == 2) {
			// 场景
			this.sceneBg.setVisible(true);
			this._clickIndexArr.push(index);
		} else if (index == 3) {
			// 邮件
			this.mailBg.setVisible(true);
			this._clickIndexArr.push(index);
		} else if (index == 4) {
			// 活动, 活动的index不记录
			this.activeBg.setVisible(true);
		} else if (index == 5) {
			// 兑换
			this.exchangeBg.setVisible(true);
			this._clickIndexArr.push(index);
		} else if (index == 6) {
			// 商城
			this.shopBg.setVisible(true);
		}
	},
	// 角色
	onClickRole() {
		//if (cc.sys.isNative) {
		//    var data = {title: '友情提示', content: '抱歉, 功能尚未开放!'};
		//    ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
		//} else if (cc.sys.isBrowser) {
		//}
		this._addRoleSelectLayer();
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Role);
		this._changeItemBg(1);
	},

	// 场景
	onClickScene() {
		//if (cc.sys.isNative) {
		//    var data = {title: '友情提示', content: '抱歉, 功能尚未开放!'};
		//    ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
		//} else if (cc.sys.isBrowser) {
		//}
		this._addSceneLayer();
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Scene);
		this._changeItemBg(2);
	},
	// 邮件
	onClickMail() {
		//if (cc.sys.isNative) {
		//    var data = {title: '友情提示', content: '抱歉, 功能尚未开放!'};
		//    ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
		//} else if (cc.sys.isBrowser) {
		//}
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Mail);
		this._changeItemBg(3);
	},
	// 活动
	onClickActive() {
		//if (cc.sys.isNative) {
		//    var data = {title: '友情提示', content: '抱歉, 功能尚未开放!'};
		//    ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
		//} else if (cc.sys.isBrowser) {
		//}
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowActive, null);
		this._changeItemBg(4);
	},
	// 兑换
	onClickConvert() {
		var data = { title: '友情提示', content: '抱歉, 功能尚未开放!' };
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
		return;
		Utils.destroyChildren(this.addNode);
		var pre = cc.instantiate(this.giftLayer);
		this.addNode.addChild(pre);

		ObserverMgr.dispatchMsg(GameLocalMsg.Center.EnterSubLayer, true);
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Convert);
		this._changeItemBg(5);
	},
	// 商店
	onClickShop() {
		ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, null);
		this._changeItemBg(6);
	},
});
