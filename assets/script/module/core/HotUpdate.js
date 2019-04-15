var ObserverMgr = require('ObserverMgr');

module.exports = {
	_assetsMgr: null,
	_checkListener: null,
	_updateListener: null,
	// --------------------------------检查更新--------------------------------
	_compareVersion(versionA, versionB) {
		console.log('客户端版本: ' + versionA + ', 当前最新版本: ' + versionB);
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnGetVersionInfo, { curVersion: versionA, newVersion: versionB });
		var vA = versionA.split('.');
		var vB = versionB.split('.');
		for (var i = 0; i < vA.length; ++i) {
			var a = parseInt(vA[i]);
			var b = parseInt(vB[i] || 0);
			if (a === b) {
				continue;
			} else {
				return a - b;
			}
		}
		if (vB.length > vA.length) {
			return -1;
		} else {
			return 0;
		}
	},
	reCheckVersion: function() {
		this._assetsMgr.downloadFailedAssets();
	},
	// 检查更新
	checkUpdate() {
		if (!this._assetsMgr.getLocalManifest().isLoaded()) {
			console.log('加载本地 manifest 失败 ...');
			return;
		}
		cc.eventManager.removeListener(this._checkListener);
		this._checkListener = null;

		this._checkListener = new jsb.EventListenerAssetsManager(this._assetsMgr, this._checkCallBack.bind(this));
		cc.eventManager.addListener(this._checkListener, 1);
		console.log('[HotUpdate] checkUpdate');
		this._assetsMgr.checkUpdate();
	},
	_checkCallBack(event) {
		console.log('eventData: ' + JSON.stringify(event));
		cc.log('热更新检查结果: ' + event.getEventCode());
		var remoteManifest = this._assetsMgr.getRemoteManifest();
		var v = remoteManifest.getSearchPaths();
		for (var k = 0; k < v.length; k++) {
			var item = v[k];
			console.log(JSON.stringify(v[k]));
		}

		var code = event.getEventCode();
		switch (event.getEventCode()) {
			case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
				console.log('没有发现本地的manifest, 跳过热更新.');
				break;
			case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
				console.log('下载 manifest 失败, 跳过热更新.');
				break;
			case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
				console.log('解析 manifest 失败, 跳过热更新.');
				break;
			case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
				console.log('已经和远程版本一致');
				break;
			case jsb.EventAssetsManager.NEW_VERSION_FOUND:
				console.log('发现新版本,请更新');
				break;
			default:
				return;
		}
		cc.eventManager.removeListener(this._checkListener);
		this._checkListener = null;
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnTipUpdateVersion, code);
	},
	// --------------------------------开始更新--------------------------------
	hotUpdate() {
		if (this._assetsMgr) {
			this._updateListener = new jsb.EventListenerAssetsManager(
				this._assetsMgr,
				this._hotUpdateCallBack.bind(this)
			);
			cc.eventManager.addListener(this._updateListener, 1);
			this._assetsMgr.update();
		}
	},
	_hotUpdateCallBack: function(event) {
		console.log('hotUpdate Code: ' + event.getEventCode());
		switch (event.getEventCode()) {
			case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
				console.log('没有发现本地的 manifest, 跳过热更新.');
				this._onUpdateFailed();

				break;
			case jsb.EventAssetsManager.UPDATE_PROGRESSION: // 下载成功
				var data = {};
				data.fileProgress = event.getPercentByFile() / 100;
				data.byteProgress = event.getPercent() / 100;
				data.msg = '';
				var msg = event.getMessage();
				if (msg) {
					console.log('Updated file: ' + msg);
					cc.log(event.getPercent().toFixed(2) + '% : ' + msg);
					data.msg = msg;
				}
				ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnUpdateProgress, data);
				break;
			case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
			case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
				console.log('下载 manifest 失败, 跳过热更新.');
				this._onUpdateFailed();
				break;
			case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
				console.log('已经和远程版本一致 ');
				this._onUpdateFailed();
				break;
			case jsb.EventAssetsManager.UPDATE_FINISHED:
				console.log('更新完成 ' + event.getMessage());
				this._onUpdateFinished();
				break;
			case jsb.EventAssetsManager.UPDATE_FAILED:
				console.log('更新失败. ' + event.getMessage());
				this._onUpdateFailed();
				break;
			case jsb.EventAssetsManager.ERROR_UPDATING:
				console.log('资源更新发生错误: ' + event.getAssetId() + ', ' + event.getMessage());
				this._onUpdateFailed();
				break;
			case jsb.EventAssetsManager.ERROR_DECOMPRESS:
				console.log(event.getMessage());
				this._onUpdateFailed();
				break;
			default:
				//this._onUpdateFailed();
				break;
		}
	},
	_onUpdateFailed() {
		cc.eventManager.removeListener(this._updateListener);
		this._updateListener = null;
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnUpdateVersionResult, false);
	},
	// 更新完成
	_onUpdateFinished() {
		cc.eventManager.removeListener(this._updateListener);
		this._updateListener = null;
		// Prepend the manifest's search path
		var searchPaths = jsb.fileUtils.getSearchPaths();
		var newPaths = this._assetsMgr.getLocalManifest().getSearchPaths();
		console.log(JSON.stringify(newPaths));
		Array.prototype.unshift(searchPaths, newPaths);
		cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

		jsb.fileUtils.setSearchPaths(searchPaths);
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnUpdateVersionResult, true);
	},
	// ------------------------------初始化------------------------------
	init(manifestUrl) {
		if (!cc.sys.isNative) {
			return;
		}
		var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset';
		console.log('热更新资源存放路径 : ' + storagePath);
		console.log('本地 manifest 路径 : ' + manifestUrl);
		this._assetsMgr = new jsb.AssetsManager(manifestUrl, storagePath);
		if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
			this._assetsMgr.retain();
		}

		// 比较版本
		this._assetsMgr.setVersionCompareHandle(this._compareVersion.bind(this));

		// Setup the verification callback, but we don't have md5 check function yet, so only print some message
		// Return true if the verification passed, otherwise return false
		this._assetsMgr.setVerifyCallback(function(path, asset) {
			// When asset is compressed, we don't need to check its md5, because zip file have been deleted.
			var compressed = asset.compressed;
			// Retrieve the correct md5 value.
			var expectedMD5 = asset.md5;
			// asset.path is relative path and path is absolute.
			var relativePath = asset.path;
			// The size of asset file, but this value could be absent.
			var size = asset.size;
			if (compressed) {
				//console.log("path : " + relativePath);
				return true;
			} else {
				//console.log("path : " + relativePath + ' (' + expectedMD5 + ')');
				return true;
			}
		});

		// 安卓手机设置 最大并发任务数量限制为2
		if (cc.sys.os === cc.sys.OS_ANDROID) {
			this._assetsMgr.setMaxConcurrentTask(2);
		}
	},
};
