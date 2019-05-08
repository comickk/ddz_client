var Utils = require('Utils');
var GameCfg = require('GameCfg');
var AudioMgr = require('AudioMgr');
var AudioPlayer = require('AudioPlayer');
var Observer = require('Observer');
var ObserverMgr = require('ObserverMgr');

var GamePlayMusicState = {
	None: 0,
	Normal: 1,
	Warning: 2,
	GameOver: 3,
};
// 游戏内music
cc.Class({
	extends: Observer,
	properties: {
		normalPlay: { default: null, displayName: '正常游戏', type: cc.AudioClip },

		warning1: { default: null, displayName: '报警1', type: cc.AudioClip },
		warning2: { default: null, displayName: '报警2', type: cc.AudioClip },
		win: { default: null, displayName: '胜利', type: cc.AudioClip },
		lose: { default: null, displayName: '失败', type: cc.AudioClip },

		_state: 0,
	},
	_getMsgList() {
		return [GameLocalMsg.Play.OnGameOverWithResult, GameLocalMsg.Play.OnGameOverWithResultWithForce];
	},
	_onMsg(msg, data) {
		if (msg == GameLocalMsg.Play.OnGameOverWithResult) {
			// 游戏结算
			this._onGameOverWithResult(data);
		} else if (msg == GameLocalMsg.Play.OnGameOverWithResultWithForce) {
			this.forcePlayGameOverMusic(data);
		}
	},
	_onGameOverWithResult(data) {
		if (data == Poker.GameOverResult.Win) {
			this.playGameOverMusic(true);
		} else if (data == Poker.GameOverResult.Lose) {
			this.playGameOverMusic(false);
		} else if (data == Poker.GameOverResult.Deuce) {
			//比赛场一局结束的时候调用
			AudioPlayer.stopCurBg();
		}
	},
	onLoad() {
		this.playNormalPlayMusic();
		this._initMsg();
	},
	// 正常游戏
	playNormalPlayMusic() {
		if (this._state != GamePlayMusicState.Normal) {
			AudioPlayer.playMusic(this.normalPlay, true);
			this._state = GamePlayMusicState.Normal;
		} else {
			//console.log('music normal is playing');
		}
	},
	// 报牌music,有2中音乐,随机选择一种
	playWarningMusic() {
		if (this._state != GamePlayMusicState.Warning) {
			if (this._state == GamePlayMusicState.GameOver) {
				//console.log('游戏已经结束,但是触发了播放报警声音的动作');
			} else {
				this._state = GamePlayMusicState.Warning;

				var randNum = Math.floor(Math.random() * 100) % 2;
				if (randNum == 1) {
					AudioPlayer.playMusic(this.warning1, true);
				} else {
					AudioPlayer.playMusic(this.warning2, true);
				}
			}
		} else {
			//console.log('music warning is playing');
		}
	},
	// 播放游戏结束music
	playGameOverMusic(isWin) {
		if (this._state != GamePlayMusicState.GameOver) {
			this._state = GamePlayMusicState.GameOver;
			if (isWin) {
				AudioPlayer.playMusic(this.win, false);
			} else {
				AudioPlayer.playMusic(this.lose, false);
			}
		} else {
			//console.log('music gameOver is playing');
		}
	},
	forcePlayGameOverMusic(result) {
		this._state = GamePlayMusicState.GameOver;
		if (result == Poker.GameOverResult.Win) {
			AudioPlayer.playMusic(this.win, false);
		} else if (result == Poker.GameOverResult.Lose) {
			AudioPlayer.playMusic(this.lose, false);
		}
	},
});
