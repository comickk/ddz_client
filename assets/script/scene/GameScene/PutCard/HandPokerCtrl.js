var ObserverMgr = require('ObserverMgr');
var Observer = require('Observer');
var GameCardMgr = require('GameCardMgr');
var Utils = require('Utils');
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var CardMap = require('CardMap');
var NetSocketMgr = require('NetSocketMgr');
var CardAlgorithm = require('CardAlgorithm');
var DECK_TYPE = require('Enum').DECK_TYPE;
var GameSceneUtil = require('GameSceneUtil');
var AudioMgr = require('AudioMgr');
var AudioPlayer = require('AudioPlayer');

cc.Class({
	extends: Observer,

	properties: {
		robotNode: { default: null, displayName: '托管节点', type: cc.Node },
		tipBtnNode: { default: null, displayName: '提示按钮节点', type: cc.Node },

		robotLayer: { default: null, displayName: '托管预制体', type: cc.Prefab },
		tipBtnLayer: { default: null, displayName: '提示按钮Layer', type: cc.Prefab },

		selfCardNode: { default: null, displayName: '手牌节点', type: cc.Node },
		putCardNode: { default: null, displayName: '出的牌展示节点', type: cc.Node },
		putCardDescEffectPre: { default: null, displayName: '出牌说明预制体', type: cc.Prefab },
		putCardDescNode: { default: null, displayName: '出的牌说明节点', type: cc.Node },

		cardPre: { default: null, displayName: '扑克牌', type: cc.Prefab },
		smallCardPrefab: { default: null, displayName: '小牌预制体', type: cc.Prefab },

		putCardTipMsgNode: { default: null, displayName: '出牌提示节点', type: cc.Node },
		putCardTipMsgLabel: { default: null, displayName: '出牌提示label', type: cc.Label },
		putCardSound: { default: null, displayName: '发牌声音', type: cc.AudioClip },
		robSound: { default: null, displayName: '托管声音', type: cc.AudioClip },

		_putCardSoundID: null,

		_cardIDArrayFromServer: [], // 从服务端获取到的卡牌id
		_isSendCarding: false, // 是否正在发牌过程中
		_quickPutCardData: null,
		_quickDoubleClickData: null,
		_followCardData: null,
	},
	_getMsgList() {
		return [
			GameLocalMsg.Play.OnClickCancelRobot,
			GameLocalMsg.Play.OnClickRobot,
			GameLocalMsg.Play.OnClickTipPutCard, // 出牌提示
			GameLocalMsg.Play.OnClickPutCardAfter, // 出牌
			GameLocalMsg.Play.OnClickPutCardBegan, // 出牌.
			GameLocalMsg.Play.OnClickNoBig, // 要不起

			GameLocalMsg.Play.OnShowTipBtn,

			GameLocalMsg.Play.OnGamePlay, // 发牌
			GameNetMsg.recv.ReSendPoker.msg, // 重新发牌
			GameNetMsg.recv.EnsureLandlord.msg, // 确定地主

			GameNetMsg.recv.LeaveHome.msg,

			GameLocalMsg.Play.OnTest,
			GameLocalMsg.Play.OnTimeOverWithShowCard, //
			GameLocalMsg.Play.OnClickShowCard,
			GameNetMsg.recv.BeganGame.msg,
			GameLocalMsg.Play.OnGameOver,
			GameLocalMsg.Play.OnTriggerTimeOutPutCard,
			GameLocalMsg.Play.OnResumeHandPoker,
			GameLocalMsg.Play.OnResumeSelfPutCard,
			GameLocalMsg.Game.OnWinHide,
		];
	},
	_onError(msg, code, data) {
		if (code == GameErrorMsg.GoldNotEnough) {
			// 补助后金币不足
			this._reStart();
		} else if (code == GameErrorMsg.BeyondMax) {
			// 金币超出范围
			this._reStart();
		}
	},
	_onMsg(msg, data) {
		if (msg == GameLocalMsg.Play.OnClickTipPutCard) {
			// 出牌提示
			this._onTipPutCard();
		} else if (msg == GameLocalMsg.Play.OnClickPutCardBegan) {
			// 地主开始出牌
			this._onPutHandPokerBegan();
		} else if (msg == GameLocalMsg.Play.OnClickPutCardAfter) {
			// 接着上家出牌
			this._onPutHandPokerAfter();
		} else if (msg == GameLocalMsg.Play.OnClickRobot) {
			var node = cc.instantiate(this.robotLayer);
			this.robotNode.addChild(node);
		} else if (msg == GameLocalMsg.Play.OnShowTipBtn) {
			// 设置自己要显示的按钮
			//TODO 后续需要确定是什么问题导致的 关闭一直发牌的声音 发牌还原牌局会出现声音不停止的情况
			if (this._putCardSoundID != null) {
				cc.audioEngine.stopEffect(this._putCardSoundID);
			}

			var state = data.state;
			var time = data.time || 15; // 默认15秒
			var event = data.event;
			this._addTipBtn(state, time, event);
			this._cleanLastPutCardInfo();
			this._cleanPutCardTipMsg();
		} else if (msg == GameNetMsg.recv.ReSendPoker.msg) {
			// 重新发牌
			this._reStart();
			this._dealSendPoker();
		} else if (msg == GameLocalMsg.Play.OnGamePlay) {
			// 游戏开始 发牌
			this._reStart();
			this._dealSendPoker();
		} else if (msg == GameLocalMsg.Play.OnTest) {
			var testData = CardMap.getDataByServerID(data);
			this._addCard(testData);
		} else if (msg == GameLocalMsg.Play.OnTimeOverWithShowCard) {
			// 明牌倒计时完毕
			Utils.destroyChildren(this.tipBtnNode); // 清理提示按钮
			if (this._isSendCarding == false) {
				this._sendClientSendPokerOverNetMsg();
			}
		} else if (msg == GameLocalMsg.Play.OnClickShowCard) {
			if (this._isSendCarding) {
				// 正在发牌过程中,发完牌会自动处理
			} else {
				// 已经发好牌了,发牌倒计时又没有结束,主动明牌,直接提交发牌结束
				this._sendClientSendPokerOverNetMsg();
			}
		} else if (msg == GameNetMsg.recv.EnsureLandlord.msg) {
			// 确定地主,将底牌加入手牌
			var isLandlord = GameData.roomData.selfPlayData.isLandlord;
			if (isLandlord) {
				var lastThreeCard = GameData.roomData.lastThreeCard;
				for (var k = 0; k < lastThreeCard.length; k++) {
					var serverID = lastThreeCard[k];
					var cardData = CardMap.getDataByServerID(serverID);
					var card = this._addCard(cardData);
					card.runInsertAction();
				}

				// 更新最后一张明牌
				GameCardMgr.updateLastOneCardFlag();
				// 变为地主牌,废弃,在 updateLastOneCardFlag 中已经实现了
				//GameCardMgr.updateToLandlordCard();
			}
		} else if (msg == GameNetMsg.recv.BeganGame.msg) {
			// 重新开始游戏
			this._reStart();
		} else if (msg == GameLocalMsg.Play.OnClickNoBig) {
			// 托管阶段,要不起,不会走GameLocalMsg.Play.OnShowTipBtn,所有也就没有机会清理上次出的牌
			GameData.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
			GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
			this._cleanLastPutCardInfo();
		} else if (msg == GameLocalMsg.Play.OnGameOver) {
			// 游戏结束
			Utils.destroyChildren(this.robotNode); // 清理智能托管节点
			// TODO 游戏结束展示玩家手牌的地方
		} else if (msg == GameLocalMsg.Play.OnTriggerTimeOutPutCard) {
			// 出牌超时
			this._onTriggerTimeOutPutCard(data);
		} else if (msg == GameLocalMsg.Play.OnResumeHandPoker) {
			var cards = GameData.roomData.selfPlayData.cardIDArray;
			this._onResumeHandPoker(cards);
		} else if (msg == GameLocalMsg.Play.OnResumeSelfPutCard) {
			this._resumeShowPutCard(data);
		} else if (msg == GameNetMsg.recv.LeaveHome.msg) {
			// 玩家自己离开房间
			ObserverMgr.removeEventListenerWithObject(this); // 注册自身的所有的消息
			Utils.destroyChildren(this.tipBtnNode); // 清理提示按钮
			Utils.destroyChildren(this.putCardNode); //清理上次出的牌
			Utils.destroyChildren(this.robotNode); // 清理智能托管节点
			Utils.destroyChildren(this.putCardDescNode); // 清理牌型说明节点
			this.unschedule(this._dealAddCard);
			if (this._putCardSoundID != null) {
				cc.audioEngine.stopEffect(this._putCardSoundID);
			}
		} else if (msg == GameLocalMsg.Game.OnWinHide) {
			// 如果正在发牌,把发牌剩余的工作全部处理了
			var playState = GameData.roomData.playState;
			if (playState == Poker.GamePlayState.SendPoker && this._isSendCarding == true) {
				this.unschedule(this._dealAddCard);
				var len = this._cardIDArrayFromServer.length;
				for (var i = 0; i <= len; i++) {
					this._dealAddCard();
					console.log('处理剩余牌张数:' + this._cardIDArrayFromServer.length);
				}
			}
		}
	},
	_onTriggerTimeOutPutCard(data) {
		var isRobot = GameData.roomData.selfPlayData.isRobot;
		if (isRobot == false) {
			var str;
			if (data == 1) {
				AudioPlayer.playEffect(this.robSound, false);
				str = '您超时' + data + '次, 超时2次将由笨笨的机器人代打~';
			} else if (data == 2) {
				AudioPlayer.playEffect(this.robSound, false);
				str = '超时2次,笨笨的机器人代打中~';
			} else {
				str = '超时,笨笨的机器人帮你代打中~';
				console.log('超时 error');
			}
			this._setPutCardTipMsg(str);
		}
	},
	//清理上次出的牌
	_cleanLastPutCardInfo() {
		Utils.destroyChildren(this.putCardNode);
	},
	_reStart() {
		GameCardMgr.cleanAllPoker(); // 清理之前的牌
		Utils.destroyChildren(this.tipBtnNode); // 清理提示按钮
		Utils.destroyChildren(this.putCardNode); //清理上次出的牌
		this._cleanPutCardTipMsg();
		Utils.destroyChildren(this.robotNode); // 清理只能托管节点
	},
	// 提示出牌
	_onTipPutCard() {
		//var gameCardData = GameDataUtils.getAtkCardData();// 上家出的牌
		//var selfCard = GameCardMgr.getAllHandPokerData();
		//CardAlgorithm.calcTipCard(gameCardData, selfCard);
		// 计算出了要出的牌
		var ret = CardAlgorithm.getTipCard();
		if (ret.length > 0) {
			GameCardMgr.setAllHandPokerUnSelect();
			GameCardMgr.setCardSelected(ret);
		} else {
			this._setPutCardTipMsg('没有提示结果');
		}
	},
	// 地主开始出牌
	_onPutHandPokerBegan() {
		var putCardData = GameCardMgr.getSelectHandPokerData();
		var putCardTypeResult = CardAlgorithm.getPokerType(putCardData);
		var putCardType = putCardTypeResult.type;
		var putCardPoint = putCardTypeResult.p;
		if (putCardType == DECK_TYPE.ERROR) {
			// 不符合任何牌型
			console.log('不符合任何牌型');
			this._setPutCardTipMsg('您选择的牌不符合规则');
			GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
		} else {
			this._sendPutPokerToServer(putCardType, putCardPoint, putCardTypeResult);
		}
	},
	// 出牌,接着上家的牌出
	_onPutHandPokerAfter() {
		var gameCardData = GameDataUtils.getAtkCardData(); // 上家出的牌
		var putCardData = GameCardMgr.getSelectHandPokerData();
		if (putCardData.length > 0) {
			// 自由选择的牌需要判断牌
			var putCardTypeResult = CardAlgorithm.getPokerType(putCardData);
			var putCardType = putCardTypeResult.type;
			var putCardPoint = putCardTypeResult.p;
			if (putCardType == DECK_TYPE.ERROR) {
				// 不符合任何牌型
				this._setPutCardTipMsg('您选择的牌不符合规则');
				GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
			} else {
				var gameCardTypeResult = CardAlgorithm.getPokerType(gameCardData);
				var gameCardType = gameCardTypeResult.type;
				if (gameCardType == putCardType) {
					// 牌型相同
					var b1 = CardAlgorithm.isSamePokerTypeBig(putCardTypeResult.p, gameCardTypeResult.p);
					if (b1) {
						this._sendPutPokerToServer(putCardType, putCardPoint, putCardTypeResult);
					} else {
						console.log('牌型符合, 但是没有对方的牌大');
						this._setPutCardTipMsg('您选择的牌不符合规则');
						GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
					}
				} else {
					// 牌型不同
					var b = CardAlgorithm.isDiffPokerTypeBig(putCardType, gameCardType);
					if (b) {
						// 牌型上能压住
						this._sendPutPokerToServer(putCardType, putCardPoint, putCardTypeResult);
					} else {
						// 牌型不能压制
						console.log('牌型不符合, 并且没有对方的牌大');
						this._setPutCardTipMsg('您选择的牌不符合规则');
						GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
					}
				}
			}
		} else {
			this._setPutCardTipMsg('请选择要出的牌');
		}
	},

	// 设置出牌提示信息
	_setPutCardTipMsg(msg) {
		this.putCardTipMsgNode.active = true;
		this.putCardTipMsgNode.opacity = 255;
		this.putCardTipMsgLabel.string = msg;
		this.putCardTipMsgNode.stopAllActions();
		var fadeIn = new cc.FadeIn(0.1);
		var delay = new cc.DelayTime(2);
		var fadeOut = new cc.FadeOut(0.5);
		var seq = new cc.Sequence([fadeIn, delay, fadeOut]);
		this.putCardTipMsgNode.runAction(seq);
	},
	_cleanPutCardTipMsg() {
		this.putCardTipMsgNode.active = false;
		this.putCardTipMsgLabel.string = '';
	},
	// TODO 参数重复, 后期优化
	_sendPutPokerToServer(putCardType, putCardPoint, calcResult) {
		var data = [];
		var putCardData = GameCardMgr.getSelectHandPokerData();
		for (var k = 0; k < putCardData.length; k++) {
			// 数据格式和CardMap保持一致
			var item = putCardData[k];
			data.push(item.serverID);
		}
		NetSocketMgr.send(GameNetMsg.send.PutPoker, data);
		ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerPutCardAction, null);

		var delCardDataArr = GameCardMgr.cleanSelectedHandPoker();
		this._sortHandPoker();
		this._updateWarning();
		// 清理提示消息
		//this._cleanPutCardTipMsg();
		// 新牌出现
		Utils.destroyChildren(this.tipBtnNode);
		Utils.destroyChildren(this.putCardNode);

		// todo 后续优化
		// 对出的牌进行归类(腾讯: 按照牌型加入, uu898: 从大到小排序)
		delCardDataArr.sort(function(a, b) {
			var localIDA = a.localID;
			var localIDB = b.localID;
			return localIDB - localIDA;
		});

		var arr = [];
		for (var i = 0; i < delCardDataArr.length; i++) {
			var itemCardData = delCardDataArr[i];
			var cardServerID = itemCardData.serverID;
			var isLastOne = i == delCardDataArr.length - 1;
			var node = this._addPutCardToShowNode(cardServerID, isLastOne);
			node.setLocalZOrder(i); // 重新设置zorder,保证从大到小
			arr.push(node);
		}
		// 重新计算每张牌的位置
		if (calcResult && putCardType != DECK_TYPE.ERROR) {
			var zOrder = 0;
			var sortArr = [calcResult.main, calcResult.sub]; // 先排序主牌, 再排序副牌
			for (var i = 0; i < sortArr.length; i++) {
				var sortArrItem = sortArr[i];
				for (var k1 = 0; k1 < sortArrItem.length; k1++) {
					var item = sortArrItem[k1];
					var findCard = this._findCardNodeByData(arr, item);
					if (findCard) {
						findCard.setLocalZOrder(zOrder);
						zOrder++;
						//console.log("重新排序: " + JSON.stringify(item));
					}
				}
			}
		}
		this._updatePutCardFootFlag(arr);

		// 出牌说明
		GameSceneUtil.addPutCardDescEffect(putCardType, this.putCardDescEffectPre, this.putCardDescNode, 3);

		// 加入手牌 打牌都要处理明牌下标问题
		GameCardMgr.updateLastOneCardFlag();
		var roleId = GameData.playData.image;
		AudioMgr.playCardSound(roleId, putCardType, putCardPoint);
		// 状态变为等待玩家出牌
		GameData.roomData.playState = Poker.GamePlayState.WaitPlayerSendPoker;
	},
	// 从牌堆里面找到那张牌
	_findCardNodeByData(cardArr, cardData) {
		for (var k = 0; k < cardArr.length; k++) {
			var card = cardArr[k];
			var script = card.getComponent('GameSmallCard');
			if (script && script.cardData == cardData) {
				return card;
			}
		}
		return null;
	},
	// 恢复的时候显示打出的牌
	_resumeShowPutCard(data) {
		// todo 这里可能出现data=[""]的情况
		console.log('恢复的手牌: ' + JSON.stringify(data));
		// todo 按照牌型排列 从大到小排序
		data.sort(function(a, b) {
			var localIDA = CardMap.getLocalIDBySeverID(a);
			var localIDB = CardMap.getLocalIDBySeverID(b);
			return localIDB - localIDA;
		});

		Utils.destroyChildren(this.putCardNode);
		var arr = [];
		for (var i = 0; i < data.length; i++) {
			var serverID = data[i];
			if (serverID != '') {
				var isLastOne = i == data.length - 1;
				var node = this._addPutCardToShowNode(serverID, isLastOne);
				node.setLocalZOrder(i); // 重新设置zorder,保证从大到小
				arr.push(node);
			}
		}
		this._updatePutCardFootFlag(arr);
	},
	// 更新出的牌角标:地主
	_updatePutCardFootFlag(arr) {
		// 按照z进行排序依次,从小到大排序
		arr.sort(function(a, b) {
			var cardA = a.getLocalZOrder();
			var cardB = b.getLocalZOrder();
			return cardA - cardB;
		});

		var len = arr.length;
		for (var i = 0; i < len; i++) {
			var card = arr[i];
			var script = card.getComponent('GameSmallCard');
			if (script) {
				var isLandlord = GameData.roomData.selfPlayData.isLandlord;
				var isLastOne = i == len - 1;
				script.setCardIsLandlord(isLandlord && isLastOne);
			}
		}
	},
	// isLastOne 是不是最后加入的一张牌
	_addPutCardToShowNode(cardServerID, isLastOne) {
		var putCardNode = cc.instantiate(this.smallCardPrefab);
		this.putCardNode.addChild(putCardNode);
		var script = putCardNode.getComponent('GameSmallCard');
		if (script) {
			script.setServerCardID(cardServerID);
			if (isLastOne) {
				var isLandlord = GameData.roomData.selfPlayData.isLandlord;
				script.setCardIsLandlord(isLandlord);
			}
		}
		return putCardNode;
	},
	// 更新warning
	_updateWarning() {
		var handPokerLen = GameCardMgr.handPokerArray.length;
		if (handPokerLen <= 2) {
			ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnTriggerPutCardWarning, handPokerLen);
			var roleID = GameData.playData.image;
			// 判断是否报过1张牌/2张牌(只有牌减少才会触发,所以不用判断)
			if (handPokerLen == 1) {
				AudioMgr.playActionSound(roleID, Poker.Json.Warning1);
			} else if (handPokerLen == 2) {
				AudioMgr.playActionSound(roleID, Poker.Json.Warning2);
			}
		}
	},
	////////////////////////////// 添加提示按钮Prefab//////////////////////////////////
	_addTipBtn(state, time, event) {
		Utils.destroyChildren(this.tipBtnNode);
		var node = cc.instantiate(this.tipBtnLayer);
		this.tipBtnNode.addChild(node);

		// 设置提示按钮的状态
		var script = node.getComponent('PutPokerTipBtn');
		if (script) {
			script.setBtnByState(state, time, event);
		}
	},
	// 显示明牌提示按钮
	_addTipBtnWithShowCard() {
		Utils.destroyChildren(this.tipBtnNode);
		var node = cc.instantiate(this.tipBtnLayer);
		this.tipBtnNode.addChild(node);
		// 设置提示按钮的状态
		var script = node.getComponent('PutPokerTipBtn');
		if (script) {
			script.showSelectShowCardBtn();
		}
	},
	onLoad: function() {
		this._quickDoubleClickData = [];
		this._followCardData = {};

		this._initMsg();
		this._cleanPutCardTipMsg();
		Utils.destroyChildren(this.putCardDescNode);
		Utils.destroyChildren(this.putCardNode);

		this.selfCardNode.on(cc.Node.EventType.TOUCH_START, this._onTouchBegan, this);
		this.selfCardNode.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
		this.selfCardNode.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
		this.selfCardNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
	},
	/////////////////////////////滑动选牌////////////////////////////////
	_onTouchBegan(event) {
		GameCardMgr.slideSelectPokerArray = [];
		var point = event.getLocation();
		var touchPoker = GameCardMgr.getTouchPokerCard(point);
		if (touchPoker) {
			GameCardMgr.curTouchPoker = touchPoker;
			GameCardMgr.pushSlideSelectCard(touchPoker);
		}
		//console.log("end x:" + point.x + ",y:" + point.y);

		// 滑动出牌
		this._quickPutCardData = {};
		this._quickPutCardData.beganCard = touchPoker;
		this._quickPutCardData.beganPos = point;
		this._quickPutCardData.beganTime = new Date();
		this._quickPutCardData.isAction = false; // 是否完成快速出牌
	},
	_onTouchMove(event) {
		var isSlidAction = this._quickPutCardData.isAction;
		var point = event.getLocation();
		var touchPoker = GameCardMgr.getTouchPokerCard(point);
		if (isSlidAction == false && touchPoker && touchPoker != GameCardMgr.curTouchPoker) {
			// 滑到了一张新牌
			GameCardMgr.curTouchPoker = touchPoker;
			GameCardMgr.updatePushCard(touchPoker); // 全部又重新加入了一次
			//return;
			//var isInArr = GameCardMgr.isCardInSelectedPutCardArray(touchPoker);
			//if (isInArr) {// 这张牌在滑动选择的扑克牌里面,删除在这张牌之后加入的牌
			//    GameCardMgr.removeAfterJoinCardInSlideSelectArray(touchPoker);
			//} else {
			//    // 中间的牌也要加入进去
			//    GameCardMgr.pushSlideSelectCard(touchPoker);
			//}
		}

		// 滑动出牌
		this._onDealSlideMovePutCard(event);
	},
	_onDealSlideMovePutCard(event) {
		if (this._quickPutCardData.isAction == false) {
			var point = event.getLocation();
			this._quickPutCardData.movePos = point;
			this._quickPutCardData.moveTime = new Date();
			var difTime = this._quickPutCardData.moveTime.getTime() - this._quickPutCardData.beganTime.getTime();
			var difX = Math.abs(point.x - this._quickPutCardData.beganPos.x);
			var difY = point.y - this._quickPutCardData.beganPos.y;

			if (difX < 40 && difTime < 500) {
				if (difY > 80) {
					// 提牌
					console.log('time:' + difTime + ', difX:' + difX + ', difY:' + difY);
					console.log('滑动出牌');
					this._quickPutCardData.isAction = true;
					this._onSlidePutCardAction(event);
				} else if (difY < -60) {
					// 退牌
					this._quickPutCardData.isAction = true;

					var touchPoker = GameCardMgr.getTouchPokerCard(this._quickPutCardData.beganPos);
					if (touchPoker) {
						// 退单张牌
						GameCardMgr.setAllHandPokerSlideUnSelect();
					} else {
						// 退所有牌
						GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
					}
				} else {
				}
			}
		}
	},
	// 完成了滑动出牌动作
	_onSlidePutCardAction(event) {
		GameCardMgr.setAllHandPokerSlideUnSelect();
		// 控制出牌的时机,不然会乱出牌

		// 如果滑动的牌符合牌型,能够打出去,就打出去
		var beganCard = this._quickPutCardData.beganCard;
		if (beganCard) {
			var isInSelectCardArray = GameCardMgr.isCardInSelectedPutCardArray(beganCard);
			if (isInSelectCardArray) {
				// 滑动的是选择的牌
				console.log('滑动的是选择的牌');
				// 出选择的牌
				this._onSlideFinished();
			} else {
				// 滑动的是未选择的牌
				console.log('滑动的是未选择的牌');
				GameCardMgr.onAddSlideCard(beganCard);
				this._onSlideFinished();
			}
		} else {
			console.log('没有从牌开始滑动');
			this._onSlideFinished();
		}
	},
	_onSlideFinished() {
		// 要判断出牌的时机,
		// 错误思路: 派发定时器身上的事件, 因为定时器身上的逻辑:不是出当前选择的牌
		var state = GameData.roomData.playState;
		if (state == Poker.GamePlayState.PutPokerWithAfter) {
			// 接着出
			ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardAfter, null);
		} else if (state == Poker.GamePlayState.PutPokerWithBegan) {
			// 开始出
			ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan, null);
		} else if (state == Poker.GamePlayState.PutPokerWithLandlordBegan) {
			// 地主先出
			ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnClickPutCardBegan, null);
		} else {
			console.log('时机不对');
		}
	},
	_onTouchEnd(event) {
		GameCardMgr.curTouchPoker = null;
		if (this._quickPutCardData.isAction) {
			// 完成了滑动出牌的动作
			// do nothing
		} else {
			// 完成了普通的选牌操作
			this._followCardData.preSelectCardNum = GameCardMgr.getSelectCardData().length;
			GameCardMgr.changeSlideSelectCardState();
			GameCardMgr.setAllHandPokerUnTouch();

			var point = event.getLocation();
			//console.log("end x:" + point.x + ",y:" + point.y);
		}
		this._onDealFollowAutoCard(event);
		this._onDealDoubleClick(event);

		this._quickPutCardData.endPos = null;
		this._quickPutCardData.beganCard = null;
		this._quickPutCardData.beganPos = null;
		this._quickPutCardData.beganTime = null;
		this._quickPutCardData.endPos = null;
		this._quickPutCardData.endTime = null;
	},
	// 自动跟牌
	_onDealFollowAutoCard(event) {
		var selectCardData = GameCardMgr.getSelectCardData();

		var state = GameData.roomData.playState;
		//state = Poker.GamePlayState.PutPokerWithAfter;
		if (state == Poker.GamePlayState.PutPokerWithAfter) {
			// 跟牌
			//跟牌：上家出对时，点单牌且该单牌在大于上家的对牌里，则提起该对牌（比如：上家出对3，你手里有对4，你单点4时，会提起一对4）
			//跟牌：上家三带X时，点单牌且该单牌在大于对方的三张牌里，则提起该三张牌带牌组里最小的X（比如：上家出对3带1，你手里有三张4，你单点4时，会提起三张4加最小的X）
			//跟牌：上家四带二时，同上“上家出三带X”逻辑
			//跟牌：如果有提起的牌，且提起的牌中有压住上家的牌，则留下最小的能压住的牌，其余自动退牌（比如：上家出对4时，你提的牌中有对5，对6和单8，则对6和单8自动退牌）

			var gameCardData = GameDataUtils.getAtkCardData(); // 上家出的牌
			var result = CardAlgorithm.getPokerType(gameCardData);
			//result.type = DECK_TYPE.DOUBLE;
			//result.p = 4;
			if (result.type == DECK_TYPE.CONTINUE) {
				// 跟顺子

				// 跟顺子牌的条件
				if (selectCardData.length == 2 && this._followCardData.preSelectCardNum < 2) {
				} else {
					return;
				}

				var continueLen = gameCardData.length;
				//continueLen = 5;
				this._dealFollowContinue(selectCardData, continueLen, result.p);
			} else if (
				result.type == DECK_TYPE.FOUR_TWO || // 跟四张
				result.type == DECK_TYPE.FOUR_TWO4
			) {
				// 四带二
				// 跟4张牌的条件
				if (selectCardData.length == 1 && this._followCardData.preSelectCardNum < 1) {
				} else {
					return;
				}

				// 当前点击的这张牌符合4张的要求
				var selectCardPoint = selectCardData[0].point;
				var cardArr = GameCardMgr.getAllHandPokerByPoint(selectCardPoint);

				// 选择的牌可以压制
				selectCardPoint = selectCardPoint == 1 ? 14 : selectCardPoint;
				selectCardPoint = selectCardPoint == 2 ? 15 : selectCardPoint;
				var b1 = selectCardPoint > result.p;

				if (cardArr.length == 4 && b1) {
					// 弹出4张
					for (var k = 0; k < cardArr.length; k++) {
						var followCard = cardArr[k];
						GameCardMgr.onAddSlideCard(followCard);
					}
				}
				var b1 = selectCardPoint > result.p;
			} else if (result.type == DECK_TYPE.DOUBLE) {
				// 对儿
				if (selectCardData.length == 1 && this._followCardData.preSelectCardNum < 1) {
				} else {
					return;
				}
				// 当前点击的这张牌符合2张的要求
				var selectCardPoint = selectCardData[0].point;
				var cardArr = GameCardMgr.getAllHandPokerByPoint(selectCardPoint);

				// 选择的牌可以压制
				selectCardPoint = selectCardPoint == 1 ? 14 : selectCardPoint;
				selectCardPoint = selectCardPoint == 2 ? 15 : selectCardPoint;
				var b1 = selectCardPoint > result.p;

				// 选择的牌有三张
				if (cardArr.length >= 2 && b1) {
					// 一共弹起3张牌
					var upNum = 0;
					// 再弹起来1张
					var selectCardScript = GameCardMgr.getHandPokerNodeByData(selectCardData[0]);
					var selectCardZorder = selectCardScript.node.getLocalZOrder();
					cardArr.sort(function(a, b) {
						var za = a.getLocalZOrder();
						var zb = b.getLocalZOrder();
						var diffA = Math.abs(za - selectCardZorder);
						var diffB = Math.abs(zb - selectCardZorder);
						return diffA - diffB;
					});
					for (var k = 0; k < cardArr.length; k++) {
						var followCard = cardArr[k];
						var script = followCard.getComponent('GameCard');
						var isSelected = script.getIsSelected();
						if (isSelected == false && upNum < 1) {
							upNum++;
							GameCardMgr.onAddSlideCard(followCard);
						}
					}
				}
			} else if (
				result.type == DECK_TYPE.TREBLE ||
				result.type == DECK_TYPE.TREBLE_ONE ||
				result.type == DECK_TYPE.TREBLE_TWO
			) {
				// 三张

				// 跟三张牌的条件
				if (selectCardData.length == 1 && this._followCardData.preSelectCardNum < 1) {
				} else {
					return;
				}
				// 当前点击的这张牌符合三张的要求
				var selectCardPoint = selectCardData[0].point;
				var cardArr = GameCardMgr.getAllHandPokerByPoint(selectCardPoint);

				// 选择的牌可以压制
				selectCardPoint = selectCardPoint == 1 ? 14 : selectCardPoint;
				selectCardPoint = selectCardPoint == 2 ? 15 : selectCardPoint;
				var b1 = selectCardPoint > result.p;

				// 选择的牌有三张
				if (cardArr.length >= 3 && b1) {
					// 一共弹起3张牌
					var upNum = 0;
					//GameCardMgr.setAllHandPokerUnSelect();
					//for (var i = 0; i < 3; i++) {
					//    var followCard = cardArr[i];
					//    GameCardMgr.onAddSlideCard(followCard);
					//}
					// 再弹起来2张
					var selectCardScript = GameCardMgr.getHandPokerNodeByData(selectCardData[0]);
					var selectCardZorder = selectCardScript.node.getLocalZOrder();
					cardArr.sort(function(a, b) {
						// 有选择的节点向两边排序(比如1,2,3,4,5)以3为基准排序结果(3,2,4,1,5)
						var za = a.getLocalZOrder();
						var zb = b.getLocalZOrder();
						var diffA = Math.abs(za - selectCardZorder);
						var diffB = Math.abs(zb - selectCardZorder);
						return diffA - diffB;
					});
					// 为了4张的时候也能弹出的牌连在一起,思路:开头结尾放在最后
					var beganItem = cardArr.splice(0, 1);
					var endItem = cardArr.splice(cardArr.length - 1, 1);
					cardArr.push(beganItem[0]);
					cardArr.push(endItem[0]);
					for (var k = 0; k < cardArr.length; k++) {
						var followCard = cardArr[k];
						var script = followCard.getComponent('GameCard');
						var isSelected = script.getIsSelected();
						if (isSelected == false && upNum < 2) {
							upNum++;
							GameCardMgr.onAddSlideCard(followCard);
						}
					}
				}
			}
		} else if (
			state == Poker.GamePlayState.PutPokerWithBegan ||
			state == Poker.GamePlayState.PutPokerWithLandlordBegan
		) {
			// 出牌

			// 跟牌的条件
			if (selectCardData.length == 2 && this._followCardData.preSelectCardNum < 2) {
			} else {
				return;
			}

			//出牌：点第二张单牌时，如果有其他牌能构成顺子，提起其他牌（提五张，跟牌则提相应张数）
			//出牌：点第二张单牌时，提示四带二牌组，优先级低于顺子
			// 先连5张,腾讯的其实能够一直连到头
			this._dealFollowContinue(selectCardData, 5, 0);
			// 找出所有的顺子
		} else {
		}
	},
	// 处理跟顺子牌
	_dealFollowContinue(selectCardData, followNum, basePoint) {
		var resultArray = CardAlgorithm.isCardPointContinue(selectCardData, followNum, basePoint);
		console.log('需要的点数: ' + JSON.stringify(resultArray));

		if (resultArray.length > 0) {
			var oneResult = this._getOneResultAllPointInHand(resultArray);
			if (oneResult) {
				for (var key = 0; key < oneResult.length; key++) {
					var followCard = GameCardMgr.getUnSelectedHandPokerByPoint(oneResult[key]);
					GameCardMgr.onAddSlideCard(followCard);
				}
			} else {
				console.log('找到的顺子牌,手里都不能凑出来');
			}
		} else {
			console.log('没有可以顺子牌可以跟');
		}
	},
	// 指定的点数都能从手牌中找到
	_getOneResultAllPointInHand(result) {
		var ret = null;
		for (var k = 0; k < result.length; k++) {
			var resultItem = result[k];
			var isAllIn = true;
			for (var j = 0; j < resultItem.length; j++) {
				var num = resultItem[j];
				var card = GameCardMgr.getUnSelectedHandPokerByPoint(num);
				if (card == null) {
					isAllIn = false;
					break;
				}
			}
			if (isAllIn) {
				ret = resultItem;
				break;
			}
		}
		return ret;
	},
	// 判断双击
	_onDealDoubleClick(event) {
		// 点击空白区域
		var point = event.getLocation();
		var touchPoker = GameCardMgr.getTouchPokerCard(point);
		if (touchPoker) {
			return;
		}

		var curDate = new Date();
		var curTime = curDate.getTime();
		var beganTime = this._quickPutCardData.beganTime.getTime();
		if (curTime - beganTime < 200) {
			// 一次按下抬起间隔小于200才算一次快速点击
			// 双击退牌的逻辑
			this._quickDoubleClickData.push(curDate);
			var len = this._quickDoubleClickData.length;
			if (len >= 2) {
				var preClickTime = this._quickDoubleClickData[len - 2].getTime();
				var lastClickTime = this._quickDoubleClickData[len - 1].getTime();
				var diffTime = lastClickTime - preClickTime;
				console.log('diff: ' + diffTime);
				if (diffTime <= 260) {
					GameCardMgr.setAllHandPokerUnSelect(); // 所有的牌降下去
				}
			}
		}
	},
	/////////////////////////发牌处理////////////////////////////////////
	_dealSendPoker() {
		GameCardMgr.cleanAllPoker(); // 清理之前的牌
		Utils.destroyChildren(this.tipBtnNode); // 清理提示按钮
		ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnUpdateTicketVisible, false); // 隐藏门票
		// 明牌提示
		var isShowCard = GameData.roomData.selfPlayData.isShowCard;
		if (isShowCard == false) {
			this._addTipBtnWithShowCard();
		}

		this._cardIDArrayFromServer = GameData.roomData.selfPlayData.cardIDArray;
		// 发牌速度
		// todo 发牌开始
		if (this._putCardSoundID != null) {
			cc.audioEngine.stopEffect(this._putCardSoundID);
		}
		this._putCardSoundID = AudioPlayer.playEffect(this.putCardSound, true);
		this._isSendCarding = true;
		// 如果这是在隐藏界面,不能使用定时器
		var isShowGame = require('GameReady').isShowGame;
		if (isShowGame) {
			this.schedule(this._dealAddCard, 0.2);
		} else {
			var len = this._cardIDArrayFromServer.length;
			for (var i = 0; i <= len; i++) {
				this._dealAddCard();
				console.log('处理剩余牌张数:' + this._cardIDArrayFromServer.length);
			}
		}
	},
	// 返回值代表是否处理完毕
	_dealAddCard() {
		var len = this._cardIDArrayFromServer.length;
		if (len > 0) {
			this._isSendCarding = true;
			var serverID = this._cardIDArrayFromServer.splice(0, 1);
			var cardData = CardMap.getDataByServerID(serverID);
			this._addCard(cardData);
			// 其他玩家同步更新牌的数量
			var cardNum = GameCardMgr.handPokerArray.length;
			ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnSendPokerWithSyncCardNum, cardNum);
			return false;
		} else {
			// todo 发牌结束,
			this._isSendCarding = false;
			this.unschedule(this._dealAddCard);
			cc.audioEngine.stopEffect(this._putCardSoundID);
			this._putCardSoundID = null;
			// 因为时间问题,所以发完牌必须提交
			this._sendClientSendPokerOverNetMsg();
			return true;
			var isShowCard = GameData.roomData.selfPlayData.isShowCard;
			if (isShowCard) {
				// 发牌过程中选择了明牌,发完牌直接提交发牌验证
				this._sendClientSendPokerOverNetMsg();
			} else {
				// 发牌过程中没有选择明牌,等待倒计时完毕,可能在剩余时间会选择明牌
			}
		}
	},
	_sendClientSendPokerOverNetMsg() {
		Utils.destroyChildren(this.tipBtnNode); // 清除明牌提示按钮
		this.unschedule(this._dealAddCard);
		//var date = new Date();
		//console.log("发牌校验..." + date.toISOString());
		NetSocketMgr.send(GameNetMsg.send.SendPokerOver, {});
		//  发完牌,重新设置一下明牌数据,因为发牌过程中是可以设置明牌的
		GameCardMgr.updateLastOneCardFlag();
	},
	// 恢复手牌
	_onResumeHandPoker(data) {
		this.unschedule(this._dealAddCard);
		GameCardMgr.cleanAllPoker();
		for (var k = 0; k < data.length; k++) {
			var serverID = data[k];
			var cardData = CardMap.getDataByServerID(serverID);
			this._addCard(cardData);
		}
		// 设置明牌
		GameCardMgr.updateLastOneCardFlag();
	},

	_addCard(data) {
		var pokerCard = cc.instantiate(this.cardPre);
		var script = pokerCard.getComponent('GameCard');
		if (script) {
			script.initData(data);
		}
		this.selfCardNode.addChild(pokerCard);
		GameCardMgr.pushCard(pokerCard);
		// 每次加入一张手牌就需要及时更新最后一张明牌
		// 发牌过程中会选择明牌
		GameCardMgr.updateLastOneCardFlag();
		// y 坐标
		pokerCard.y = 0;
		// x 坐标和最后一张牌位置重复
		var len = GameCardMgr.handPokerArray.length;
		var posXArray = GameCardMgr.getCardPositionXArr(len);
		pokerCard.x = posXArray[len - 1];

		this._sortHandPoker();
		return script;
	},
	// 对手牌进行排序
	_sortHandPoker() {
		var len = GameCardMgr.handPokerArray.length;
		var posXArray = GameCardMgr.getCardPositionXArr(len);
		for (var i = 0; i < len; i++) {
			var poker = GameCardMgr.handPokerArray[i];
			poker.zIndex = i;
			var x = posXArray[i];
			var script = poker.getComponent('GameCard');
			if (script) {
				script.runMovePositionXAction(x);
			}
		}
	},
});
