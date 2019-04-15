var ObserverMgr = require("ObserverMgr");
var Utils = require("Utils");
module.exports = {
    onLoginWithWeChat(){
        if (cc.sys.platform == cc.sys.ANDROID) {
            var className = "org/cocos2dx/javascript/AppActivity";
            var methodName = "onWeChatLogin";
            var sign = "(Ljava/lang/String;)V";
            var para = "test";
            jsb.reflection.callStaticMethod(className, methodName, sign, para);
        } else {
            console.log("登陆平台不是Android,无法完成微信登录!");
        }
    },
    /////////////////////////////////////////Android////////////////////////////////////////////////////////
    // 对应的java层代码？
    // public static void loginSdk(String parm) {
    //     UGSdk.getInstance().login(new UGLoginListener() {
    //     @Override
    //         public void onSuccess(String token, String userId) {
    //             // Toast.makeText(app,
    //             // "token & userId = " + token + "\r\n" + userId,
    //             // Toast.LENGTH_SHORT).show();
    //             // 通知js层
    //             String jsPara = "\"" + token + "\"" + "," + "\"" + userId
    //                 + "\"";
    //             String jsCallStr = "require(\"NativeSdk\").onSdkLoginSuccess("
    //                 + jsPara + ")";
    //             // 输出调用的js字符串
    //             Log.e("CallJs: ", jsCallStr);
    //             Cocos2dxJavascriptJavaBridge.evalString(jsCallStr);
    //         }
    //     });
    // }
    // android 登录
    onLoginWithAndroid(){
        if (cc.sys.platform == cc.sys.ANDROID) {
            var className = "org/cocos2dx/javascript/AppActivity";
            var methodName = "loginSdk";
            var sign = "(Ljava/lang/String;)V";
            var para = "test";
            jsb.reflection.callStaticMethod(className, methodName, sign, para);
        } else {
            console.log("登陆平台不是Android,无法完成登录!");
        }
    },
    // 登录返回
    onLoginWithAndroidCallBack(token, userId){
        console.log("skd返回结果: token:" + token + ", userId:" + userId);
        var data = {
            token: token,
            err: 0,
            msg: "login success",
        };
        ObserverMgr.dispatchMsg(GameLocalMsg.Login.OnSdk_AndroidLogin, data);
    },
    // 安卓切换账号
    onChangeAccount(){
        console.log("[NativeSdk] Android 切换账号...");
        //ObserverMgr.dispatchMsg(GameLocalMsg.Game.OnSdkChangeAccount, null);
        var NetSocket = require("NetSocketMgr");
        NetSocket.changeAccount();
    },
    onPayWithAndroid(money, productID, orderNo, beanNum, isVisitor){
        var desc = "充值" + beanNum + "金豆";
        if (cc.sys.platform == cc.sys.ANDROID) {
            var className = "org/cocos2dx/javascript/AppActivity";
            var methodName = "pay";
            var sign = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V";
            var para = "test";
            jsb.reflection.callStaticMethod(className, methodName, sign,
                money.toString(),
                productID.toString(),
                orderNo.toString(),
                desc.toString(),
                isVisitor
            );
        } else {
            console.log("登陆平台不是Android,无法完成支付!");
        }
    },
    onPayWithAndroidCallBack(code, msg){
        if (code == 0) {
            console.log("安卓支付成功: " + msg);
        } else {
            console.log("安卓支付失败: " + msg);
        }
    },
    /////////////////////////////////////sdk退出////////////////////////////////
    onSdkExit(){
        console.log("[NativeSdk] onSdkExit");
        if (Utils.isApplePlatform()) {
            jsb.reflection.callStaticMethod("OCBridge", "userLoginOut:", 0);
        } else if (cc.sys.platform == cc.sys.ANDROID) {
            var className = "org/cocos2dx/javascript/AppActivity";
            var methodName = "exitSdk";
            var sign = "(Z)V";
            var para = false;
            jsb.reflection.callStaticMethod(className, methodName, sign, para);
        }

    },
    /////////////////////////////////////sdk登出/////////////////////////////////////////////
    // sdk 主动触发改操作
    // state 0 登出成功 非0失败
    onSdkLogout(state){
        // 用户切换账号,到登录界面去
        var NetSocket = require("NetSocketMgr");
        NetSocket.changeAccount();
    },
    onSetScreenBright(b){
        try {
            if (Utils.isApplePlatform()) {
                jsb.reflection.callStaticMethod("OCBridge", "setScreenAlwaysBright");
            }
        } catch (error) {
            console.log("调用OC<设置屏幕常亮>出现问题: " + error);
        }
    },
    /////////////////////////////////////////ios/////////////////////////////////////////////////////////////
    /*
     ScriptingCore::getInstance()->evalString("js string code");
     */
    // ios登录
    onLoginWithIPhone(){
        try {
            jsb.reflection.callStaticMethod("OCBridge", "userLogin");
        } catch (error) {
            console.log("调用OC<登录>出现问题: " + error);
        }
    },
    onPayWithOC(productID){
        try {
            jsb.reflection.callStaticMethod("OCBridge", "payWithOC:", productID);
        } catch (error) {
            console.log("调用OC<支付>出现问题: " + error);
        }
    },
    // 内购成功
    onIAPSuccess(token){
        console.log("=======================js 内购成功=====================");
        console.log("token: " + token);
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnIAPSuccess, token);
    },
    onIAPFailed(err){
        console.log("=======================js 内购失败=====================");
        console.log("err: " + err);
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnIAPFailed, err);
    },
    // 更新支付状态
    onIAPUpdatePayState(str){
        ObserverMgr.dispatchMsg(GameLocalMsg.Com.OnPayingUpdate, str.toString());
    },
    onLoginWithIPhoneCallBack(code, token){
        console.log("-------------从OC返回的数据-------------");
        console.log("OC返回数据：code = " + code.toString());
        console.log("OC返回数据: token = " + token);
        console.log("-------------从OC返回的数据-------------");
        var loginData = {err: code, token: token, msg: "ios login msg"};
        ObserverMgr.dispatchMsg(GameLocalMsg.Login.OnSdk_IOSLogin, loginData);
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // 支付成功
    onSdkPaySuccess(code){
        if (code == 0) {
            console.log("支付成功!...");
        }
    },
    ///////////////////////////////////////////////////////////
    // 0 无网, 1 有网
    // sdk 主动 通知游戏
    onPhoneNetIsChange(state){
        console.log("[Native sdk] net state : " + state);
        if (state.toString() == "0") {
            ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.Change, false);
        } else if (state.toString == "1") {
            ObserverMgr.dispatchMsg(GameLocalMsg.SOCKET.Change, true);
        }
    },

    // 获取网络类型
    getNetWorkType(){
        if (cc.sys.platform == cc.sys.ANDROID) {
            return Poker.PhoneSignalType.None;
        } else if (Utils.isApplePlatform()) {
            try {
                // NONE:无信号, 2G, 3G, 4G, WIFI, nil:获取失败
                var type = jsb.reflection.callStaticMethod("OCBridge", "getNetworkType");
                if (type == "2G" || type == "3G" || type == "4G") {
                    return Poker.PhoneSignalType.Mobile;
                } else if (type == "WIFI") {
                    return Poker.PhoneSignalType.WiFi;
                } else {
                    return Poker.PhoneSignalType.None;
                }
            } catch (error) {
                console.log("调用OC<获取网络类型>出现问题: " + error);
                return Poker.PhoneSignalType.None;
            }
        } else {
            return Poker.PhoneSignalType.None;
        }
    },
    // 获取信号强度
    getNetSignalStrength(){
        var ret = 0;
        if (cc.sys.platform == cc.sys.ANDROID) {
            return ret;
        } else if (Utils.isApplePlatform()) {
            try {
                //string类型 wifi信号,最大值为3, 蜂窝信号,最大值为5
                var strength = jsb.reflection.callStaticMethod("OCBridge", "signalStrength");
                var type = this.getNetWorkType();
                if (type == Poker.PhoneSignalType.WiFi) {
                    if (strength == "1") {
                        ret = 1;
                    } else if (strength == "2") {
                        ret = 3;
                    } else if (strength == "3") {
                        ret = 4;
                    }
                } else if (type == Poker.PhoneSignalType.Mobile) {
                    if (strength == "1") {
                        ret = 1;
                    } else if (strength == "2") {
                        ret = 2;
                    } else if (strength == "3") {
                        ret = 3;
                    } else if (strength == "4") {
                        ret = 4;
                    } else if (strength == "5") {
                        ret = 4;
                    }
                }
                console.log("信号强度: " + ret);
                return ret;
            } catch (error) {
                console.log("调用OC<获取网络类型>出现问题: " + error);
                return ret;
            }
        }
    },
}
