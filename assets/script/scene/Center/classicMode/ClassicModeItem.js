var ObserverMgr = require("ObserverMgr");
var Utils = require('Utils');
var Observer = require('Observer');
var GameCfg = require("GameCfg");

cc.Class({
    extends: Observer,

    properties: {
        score: {default: null, displayName: "底分", type: cc.Label},
        beanSection: {default: null, displayName: "豆", type: cc.Label},
        peopleNum: {default: null, displayName: "在线人数", type: cc.Label},
        _roomData: null,
        _peopleNum: 0,
    },
    _getMsgList(){
        return [
            GameNetMsg.recv.UpdateDeskPeople.msg,// 更新场次人数
        ]
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.UpdateDeskPeople.msg) {
            for (var k = 0; k < data.length; k++) {
                var roomID = k;
                var roomPeople = data[k];
                if (this._roomData && roomID == this._roomData.id) {
                    this.peopleNum.string = roomPeople.toString();
                }
            }
        }
    },
    onLoad: function () {
        this._initMsg();
    },
    initData(data){
        this._roomData = data;
        this.score.string = data.underPoint;
        var minBean = '(' + Utils.formatNum(data.minEnterPoint);
        var maxBean = this.fmtStr2(data.maxEnterPoint) + ')';
        this.beanSection.string = minBean + maxBean;
    },

    fmtStr2: function (num) {
        var retStr = '';
        if (num == 0) {
            retStr = '以上';
        } else {
            retStr = '-' + Utils.formatNum(num);
        }
        return retStr;
    },
    onClick(){
        ObserverMgr.dispatchMsg(GameLocalMsg.Classic.Enter, this._roomData);
        return;
        // 这部分逻辑交给了服务端
        //  应该是客户端先判断豆是否充足
        var minBean = this._roomData.minEnterPoint;

        var maxBean = this._roomData.maxEnterPoint;
        var b = GameCfg.isBeyondBean(maxBean);
        if (b) {
            // 超出上限
            ObserverMgr.dispatchMsg(GameLocalMsg.Classic.BeyondMax, null);
        } else {
            ObserverMgr.dispatchMsg(GameLocalMsg.Classic.Enter, this._roomData);
            return;
            // 因为补助的情况在,所以这么做
            var b1 = GameCfg.isEnoughBean(minBean);
            if (b1) {
                // 在范围之内
                ObserverMgr.dispatchMsg(GameLocalMsg.Classic.Enter, this._roomData);
            } else {
                // 金豆不足
                ObserverMgr.dispatchMsg(GameLocalMsg.Center.ShowChargeTips, null);
            }
        }
    }
});
