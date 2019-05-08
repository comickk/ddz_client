var Observer = require('Observer');
var ObserverMgr = require("ObserverMgr");
var Utils = require("Utils");
var GameData = require('GameData');
var GameDataUtils = require('GameDataUtils');
var NetSocketMgr = require("NetSocketMgr");
var ToggleMarkUtil = require('ToggleMarkUtil');
var GameDataRank = require('GameDataRank');
var JsonFileMgr = require('JsonFileMgr');

cc.Class({
    extends: Observer,

    properties: {
        scrollView: {default: null, displayName: "滚动视图", type: cc.ScrollView},
        rankItem: {default: null, displayName: "排行Item", type: cc.Prefab},
        roleNode: {default: null, displayName: "角色节点", type: cc.Node},
        enterRoomLabel: {default: null, displayName: "可进入房间Label", type: cc.Label},

        _rankData: null,
        _spine: null,// spine动画

    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.GetRank.msg) {
            GameDataRank.updateRankData(data);
            this._rankData = data;
            this._showRank(this._rankData.gold);
        } else if (msg == GameNetMsg.recv.GetUserInfo.msg) {
            // 创建人的spine动画,创建角色会调用
            this.playRoleAnimate();
            this._updateEnterRoomTips();
        } else if (msg == GameNetMsg.recv.GetSysCfg.msg) {
            this._updateEnterRoomTips();
        } else if (msg == GameLocalMsg.Com.UpdateMoney) {
            this._updateEnterRoomTips();
        }
    },
    _onNetOpen(){
        if (this.scrollView.content.children.length <= 0) {// 断线重连
            this._onUpdateRankDate();
        }
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.GetRank.msg,
            GameNetMsg.recv.GetUserInfo.msg,
            GameNetMsg.recv.GetSysCfg.msg,
            GameLocalMsg.Com.UpdateMoney,
        ];
    },
    onLoad: function () {
        this._initMsg();
        // 获取排行榜  type 0 为所有榜单  1为只有金币榜  2是只有U钻榜
        //NetSocketMgr.send(GameNetMsg.send.GetRank, {type: 0});
        this._onUpdateRankDate();
        this.playRoleAnimate();
        this._updateEnterRoomTips();
    },

    _onUpdateRankDate(){
        var b = GameDataRank.isCanGetRankData();
        if (b) {// 从服务器获取排行数据
            //console.log("[缓存数据失效] 主动请求排行数据中...");
            GameDataRank.sendGetRankNetMsg();
        } else {// 使用本地缓存数据
            var data = GameDataRank.getRankData();
            if (data) {
                //console.log("[缓存数据有效] 使用本地缓存排行数据, 显示中...");
                this._rankData = data;
                this._showRank(this._rankData.gold);
            } else {
                //console.log("[缓存数据有效] 本地没有缓存排行数据, 主动请求中...");
                GameDataRank.sendGetRankNetMsg();
            }
        }
    },

    _updateEnterRoomTips(){
        // TODO 判断并显示可以快速进入的场次(Room.id 方式不妥)
        // 当身上的钱不能进入所有场次的时候,这里的快速进入现实的有问题,其实哪个也进不去,但是提示新手场是没问题的,引导充值
        var enterRoom = GameDataUtils.getCanEnterMaxGoldRoom();        
        if (enterRoom) {
            var roomName = GameDataUtils.getGoldRoomName(enterRoom.id);
            this.enterRoomLabel.string = roomName;
        } else {
            this.enterRoomLabel.string = "";
        }
    },

    playRoleAnimate () {
        var img = GameData.playData.image;
        var roleData = JsonFileMgr.getRoleDataByRoleId(img);
        if (roleData && roleData['spine']) {
        var spine = roleData['spine'];
            cc.loader.loadRes(spine, function (err, prefab) {
                if (!err) {
                    if (this._spine == null) {
                        var animate = cc.instantiate(prefab);
                        Utils.destroyChildren(this.roleNode);
                        this.roleNode.addChild(animate);
                        animate.getComponent(sp.Skeleton).setAnimation(0, 'center', true);
                        this._spine = animate;
                    } else {
                        //console.log("已经创建过spine动画了");
                    }
                }
            }.bind(this));
        }
    },
    onSelectRankItem(node, data){
        ToggleMarkUtil.onToggle(node);
        if (this._rankData) {
            if (data == "1") {
                this._showRank(this._rankData.gold);
            } else if (data == "2") {
                this._showRank(this._rankData.ud);
            }
        }
    },

    // U钻排行榜
    _showRank(data){
        //this.scrollView.content.removeAllChildren();
        Utils.destroyChildren(this.scrollView.content);

        for (var i = 0; i < data.length; i++) {
            var item = cc.instantiate(this.rankItem);
            var script = item.getComponent("RankItem");
            if (script) {
                script.initData(data[i]);
                script.setRank(i);
            }
            this.scrollView.content.addChild(item);
        }
        this.scrollView.scrollToTop();
    },

    // 快速开始游戏
    onQuickGame(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Classic.QuickBegan, null);
    },

    // 金币模式
    onClickGoldMode(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.Gold);
    },
    // U钻模式
    onClickUStoneMode(){
        var data = {title: '友情提示', content: '抱歉, 功能尚未开放!'};
		ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnShowTips, data);
        //ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.UStone);
    },
    // 查看详情
    onClickSeeDesc(){
        //ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowShop, null);
    },
});
