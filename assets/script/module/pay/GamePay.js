var SDK = require("SDK");
var GameData = require('GameData');
var Utils = require('Utils');
var GameStaticCfg = require('GameStaticCfg');
var ActionAnalyze = require('ActionAnalyze');

module.exports = {
    _isUseAnySdk: true,// 是否使用anySdk
    _curPayData: null,
    //////////////// init ////////////////////////////////////////////////
    init(){
        Utils.log("[运行平台]: " + cc.sys.platform);
        if (cc.sys.isNative) {
            if (GameStaticCfg.isLocalVersion) {
                Utils.log("局域网环境无需进行支付初始化...");
            } else {
                if (cc.sys.platform == cc.sys.ANDROID) {
                    this._initWithAndroid();
                } else if (Utils.isApplePlatform()) {
                    this._initWithIPhone();
                }
                Utils.log("[Pay init_手游猪] ... ");
            }
        } else if (cc.sys.isBrowser) {
            Utils.log("[Pay init_Browser] ... ");
        }
    },

    _initWithIPhone(){
        var iap_plugin = anysdk.agentManager.getIAPPlugin();
        iap_plugin.setListener(this.onPayResultWithNative, this);
        Utils.log("[Pay init_IOS] ... ");
    },
    _initWithAndroid(){
        Utils.log("[Pay init_Android] 手游猪 ");
        return;
        var iap_plugin = anysdk.agentManager.getIAPPlugin();
        iap_plugin.setListener(this.onPayResultWithNative, this);
    },
    /////////////////////支付结果///////////////////////////////////////////
    onPayResultWithNative: function (code, msg, info) {
        Utils.log("[Pay 结果] code:" + code + ", msg: " + msg);
        //根据返回的 code 和 msg 来做相对应的处理和操作。
        if (code == anysdk.PayResultCode.kPaySuccess) {

            Utils.log('支付成功');
            var gold = this._curPayData[1];// 购买的金豆
            var money = this._curPayData[2];// 花费的人民币
            ActionAnalyze.onPaySuccess(money);

        } else if (code == anysdk.PayResultCode.kPayCancel) {
            Utils.log('支付取消');

        } else if (code == anysdk.PayResultCode.kPayFail) {
            Utils.log('支付失败');

        } else if (code == anysdk.PayResultCode.kPayNetworkError) {
            Utils.log('支付网络出现错误');

        } else if (code == anysdk.PayResultCode.kPayProductionInforIncomplete) {
            Utils.log('支付信息提供不完全');
        }
    },
    _onPaySuccess(){

    },
    /////////////////////发起支付///////////////////////////////////////////
    pay(data, ext){
        this._curPayData = data;
        if (cc.sys.isNative) {
            if (cc.sys.platform == cc.sys.ANDROID) {
                Utils.log("[Pay in_ANDROID] ... ");
                if (GameStaticCfg.isLocalVersion) {
                    Utils.log("[GamePay] 局域网环境支付 ");
                    this._payWithWebTest(data, ext);
                } else {
                    var isVisitor = GameData.visitorAccount;
                    if (isVisitor) {// 游客账号
                        Utils.log("[GamePay] 游客账号支付 ");
                        //this._payWithWebTest(data, ext);
                        this._payWithAndroid(data, ext);
                    } else {// uu账号
                        Utils.log("[GamePay] 898账号支付 ");
                        this._payWithAndroid(data, ext);
                    }
                }
            } else if (Utils.isApplePlatform()) {
                Utils.log("[Pay in_IPHONE] ... ");
                // ios 使用anysdk支付,地址必须是外网地址
                if (GameStaticCfg.isLocalVersion) {
                    Utils.log("IOS 不能在内网进行支付");
                } else {
                    //this._payWithIOS(data, ext);
                    this._payWithOC(data);
                }
            }
        } else if (cc.sys.isBrowser) {// 在web环境运行
            Utils.log("[Pay in_Browser] ... ");
            if (window.gameRunMode == 1) {// 线上web环境
                this._payWithWebTest(data, ext);
            } else {// 本地web环境
                this._payWithWebTest(data, ext);
            }
        }
    },
    // 支付测试
    _payWithWebTest(data, orderId){
        var productId = data[0];
        var gold = data[1];
        var money = data[2];

        var payData = {
            productId: productId,
            orderId: orderId,
            money: money,
            callback: function () {
                //console.log("-----------------web订单完成---------------------");
            },
        };
        SDK.pay(payData);
    },
    _payWithAndroid(data, ext){
        Utils.log("[Pay in_手游猪] ... ");
        // ["10","100000","1000","1","0"]
        // 商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
        var orderNo = ext;
        var productID = data[0];
        var beanNum = data[1];
        var money = data[2]
        require('NativeSdk').onPayWithAndroid(money, productID, orderNo, beanNum, GameData.visitorAccount);
        //this._payWithWebTest(data, ext);
    },
    // 直接调用oc的支付
    _payWithOC(data){
        var id = data[0].toString();
        require('NativeSdk').onPayWithOC(parseInt(id));
    },
    _payWithIOS(data, ext){
        // 商品ID + | + 金币 + | + 对应人民币 + | + 是否热卖 + | + 多送百分比
        var buyData = JSON.stringify(data);
        var id = data[0].toString();
        var name = data[1].toString() + "金豆";
        var price = data[2].toString();

        var rate = (data[1] / data[2]).toFixed(0);

        var roleName = GameData.playData.name;
        var info = {
            Product_Id: id,//商品 ID
            Product_Name: name,//商品名
            Product_Price: price,//商品价格（元）
            Product_Count: "1",//商品份数
            Product_Desc: "游戏商品描述",//商品描述
            Coin_Name: "金豆",//虚拟币名称
            Coin_Rate: rate.toString(),//虚拟币兑换比例 （例如 100，表示 1 元购买 100 虚拟币）
            Role_Id: "123456",//游戏角色 ID
            Role_Name: roleName.toString(),//游戏角色名
            Role_Grade: "1",//游戏角色等级
            Role_Balance: "1",//用户游戏内虚拟币余额
            Vip_Level: "1",//VIP 等级
            Party_Name: "1",//帮派、公会等
            Server_Id: "1",//服务器 ID
            Server_Name: "test",//服务器名
            EXT: ext.toString(),//扩展字段 字符串，可以使用 JSON 型字符串。
        };
        Utils.log("[Pay] 购买商品详细信息: " + JSON.stringify(info));
        var iap_plugin = anysdk.agentManager.getIAPPlugin();
        iap_plugin.payForProduct(info);
    },
}