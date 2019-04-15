var GameStaticCfg = require('GameStaticCfg');
var MD5 = require("Md5").md5;
var Utils = require("Utils");
var ObserverMgr = require('ObserverMgr');

module.exports = {
    //向游戏服务器签名
    certToGameServer() {
        var time = Utils.getUnixTime();
        var randStr = Utils.makeRdmStr(8);
        var token = GameStaticCfg.sdkToken;
        var sign = this._sign(randStr, time, token);

        var url = GameStaticCfg.certUrl +
            "?platform=" + GameStaticCfg.getGamePlatform() +
            "&version=" + GameStaticCfg.version +
            "&channel=" + GameStaticCfg.getChannel() +
            "&time=" + time +
            "&randstr=" + randStr +
            "&sign=" + sign +
            "&token=" + token;


        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log("游戏服务器签名返回: " + response);
                var res = JSON.parse(response);
                var code = res['err'];
                if (code == 0) {
                    GameStaticCfg.updateServerCertData(res);
                    ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnCertGameServer, true);
                } else {
                    ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnCertGameServer, false);
                }
            }
            // todo 超时处理
        }.bind(this);
        xhr.open("GET", url, true);
        xhr.send();
    },

    userLogin(id){
        var url ='http://192.168.0.126:8080/login?userid='+id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log("用户登录返回数据");
                var res = JSON.parse(response);
                var code = res['err'];
                if (code == 0) {
                  //取出用户信息
                  ObserverMgr.dispatchMsg(GameNetMsg.recv.GetUserInfo.msg, res);
                } else {
                   //返回错误                   
                   ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.ERROR, res['err']);
                   console.log(response)
                }
            }
            // todo 超时处理
        }.bind(this);
        xhr.open("GET", url, true);
        xhr.send();
    },

    // 签名规则
    _sign(randStr, time, token){
        return MD5(randStr.substr(-5) + randStr.substr(0, 5) + time + token).toLowerCase();
    },

    HttpReq(url,msg){
        url = 'http://192.168.0.126:8080/'+url;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                cc.log(response);               
                var res = JSON.parse(response);
                cc.log(res);
               if(!res['err']) {
                    ObserverMgr.dispatchMsg(msg, res);    
               }else{
                    cc.log('错误'+ msg);
               }
            }
            // todo 超时处理
        }.bind(this);
        xhr.open("GET", url, true);
        xhr.send();
    }
}