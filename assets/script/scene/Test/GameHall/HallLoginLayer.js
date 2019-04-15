var Observer = require('Observer');
var HallNet = require('HallNet');
var GameHallStorage = require('GameHallStorage');
cc.Class({
    extends: Observer,

    properties: {
        userName: {default: null, displayName: "用户名", type: cc.EditBox},
        pwd: {default: null, displayName: "密码", type: cc.EditBox},
    },

    onLoad: function () {
        var userName = GameHallStorage.storageData.userName;
        if (userName) {
            this.userName.string = userName;
        }
        var pwd = GameHallStorage.storageData.pwd;
        if (pwd) {
            this.pwd.string = pwd;
        }
    },

    onClickLogin(){
        var userName = this.userName.string;
        var pwd = this.pwd.string;
        var data = {u: userName, p: pwd};
        HallNet.send(GameHallNetMsg.send.Login, data);

        GameHallStorage.setUserAndPwd(userName, pwd);
        GameHallStorage.save();
    },

    onClickRegister(){
        var userName = this.userName.string;
        var pwd = this.pwd.string;
        var data = {u: userName, p: pwd};
        HallNet.send(GameHallNetMsg.send.Register, data);

        GameHallStorage.setUserAndPwd(userName, pwd);
        GameHallStorage.save();

    },

});
