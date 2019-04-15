var GameCfg = require("GameCfg");
var GameData = require('GameData');
var ObserverMgr = require("ObserverMgr");
var Observer = require("Observer");
var NetSocketMgr = require('NetSocketMgr');
var GameLocalStorage = require('GameLocalStorage');
var JsonFileMgr = require('JsonFileMgr');

cc.Class({
    extends: Observer,

    properties: {
        _roleIndex: 1,// 角色索引
        roleNode1: {default: null, displayName: "角色1", type: cc.Node},
        roleNode2: {default: null, displayName: "角色2", type: cc.Node},
        roleNode3: {default: null, displayName: "角色3", type: cc.Node},
        roleNode4: {default: null, displayName: "角色4", type: cc.Node},
        editBox: {default: null, displayName: "名字框", type: cc.EditBox},

    },
    _getMsgList(){
        return [GameNetMsg.recv.SetNameAndHead.msg]
    },
    _onError(msg, code, data){
        if (code == GameErrorMsg.NameRepeat) {
            this.editBox.string = '';
            this.editBox.placeholder = '名字重复';
        } else if (code == GameErrorMsg.NameToLong) {
            this.editBox.string = '';
            this.editBox.placeholder = '名字太长';
        } else if (code == GameErrorMsg.NameNoStandard) {
            this.editBox.string = '';
            this.editBox.placeholder = '名字不合规范';
        }
    },
    _onMsg(msg, data){
        if (msg == GameNetMsg.recv.SetNameAndHead.msg) {
            var strName = this.editBox.string;
            GameLocalStorage.setName(strName);
            //todo 创建完角色去U钻场
            ObserverMgr.dispatchMsg(GameLocalMsg.Center.ChangeMode, Poker.GameMode.UStone);
            this.close();
        }
    },
    onLoad: function () {
        this._initMsg();
        this.onClickRole(null, "1");
        //this.editBox.string = JsonFileMgr.getRandName();
    },
    onClickEnter(){
        var strName = this.editBox.string;
        if (strName.length < 2) {
            this.editBox.string = '';
            this.editBox.placeholder = JsonFileMgr.getErrString(4001);
            return;
        }
        if (strName.length > 6) {
            this.editBox.string = '';
            this.editBox.placeholder = JsonFileMgr.getErrString(4002);
            return;
        }
        var b = JsonFileMgr.isContentForbidWord(strName);
        if (b) {
            this.editBox.string = '';
            this.editBox.placeholder = JsonFileMgr.getErrString(4003);
            return;
        }

        var nameRule = /^[0-9a-zA-Z\u0800-\u9fa5-]+$/;
        if (strName != '' && nameRule.test(strName) == true) {
            var roleData = JsonFileMgr.getRoleDataById(this._roleIndex);
            var roleId = roleData['roleId'];
            var data = {name: encodeURI(strName), img: roleId};
            NetSocketMgr.send(GameNetMsg.send.SetNameAndHead, data);
        } else {
            this.editBox.string = '';
            this.editBox.placeholder = JsonFileMgr.getErrString(4004);
        }
    },
    onClickRole: function (node, data) {
        var type = data;
        this.roleNode1.color = type == "1" ? cc.Color.WHITE : cc.Color.BLACK;
        this.roleNode2.color = type == "2" ? cc.Color.WHITE : cc.Color.BLACK;
        this.roleNode3.color = type == "3" ? cc.Color.WHITE : cc.Color.BLACK;
        this.roleNode4.color = type == "4" ? cc.Color.WHITE : cc.Color.BLACK;
        this._roleIndex = type;
    },
    // 随机名字
    randName(node){
        var rotate = new cc.RotateBy(0.15, 360);
        node.target.rotation = 0;
        node.target.stopAllActions();
        node.target.runAction(rotate);

        this.editBox.string = JsonFileMgr.getRandName();
    },
    close: function () {
        this.node.destroy();
        GameData.playData.guide = 1;
        // 获取用户信息
        NetSocketMgr.send(GameNetMsg.send.GetUserInfo, {});
    }
});
