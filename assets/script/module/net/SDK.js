var ObserverMgr = require("ObserverMgr");

if (typeof require === 'function') {
    var md5 = require('Md5').md5;
}

(function ($) {
    'use strict'
    let sdk = {

        PLATFORM_HTML5: 1,
        PLATFORM_FLASH: 2,
        PLATFORM_PC: 3,
        PLATFORM_OSX: 4,
        PLATFORM_ANDROID: 5,
        PLATFORM_IOS: 6,
        PLATFORM_OTHER: 10,

        queries: {},
        url: '',
        platform: undefined,
        appversion: '',
        version: '10.0.1',
        app: '',
        appkey: '',
        _store: undefined,
        callback: undefined, //登录回调函数

        randString: function (len) {
            len = len || 32;
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz0123456789';
            var maxPos = chars.length;
            let ret = '';
            for (let i = 0; i < len; i++) {
                ret += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return ret;
        },

        parseUrl: function () {
            var query = window.location.search.substring(1);
            if (!query) {
                return {};
            }
            var queries = {};
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (typeof queries[pair[0]] === "undefined") {
                    queries[pair[0]] = decodeURIComponent(pair[1]);
                } else if (typeof queries[pair[0]] === "string") {
                    queries[pair[0]] = [queries[pair[0]], decodeURIComponent(pair[1])];
                } else {
                    queries[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return queries;
        },

        init: function () {
            if (typeof CC_JSB == 'undefined') {
                window.CC_JSB = false;
            }
            if (typeof window.cc != 'undefined') {
                this._store = cc.sys.localStorage;
                if (CC_JSB) {
                    if (cc.sys.os == cc.sys.OS_ANDROID) this.platform = this.PLATFORM_ANDROID;
                    if (cc.sys.os == cc.sys.OS_WINDOWS) this.platform = this.PLATFORM_PC;
                    if (cc.sys.os == cc.sys.OS_IOS) this.platform = this.PLATFORM_IOS;
                    if (cc.sys.os == cc.sys.OS_OSX) this.platform = this.PLATFORM_OSX;
                } else {
                    this.platform = this.PLATFORM_HTML5;
                    this.queries = this.parseUrl();
                }
            } else {
                this.platform = this.PLATFORM_OTHER;
                this._store = localStorage;
            }
        },

        initData: function (data) {
            this.init();
            if (data.url) {
                this.url = data.url;
            }
            if (data.app) {
                this.app = data.app;
            } else this.app = 100;
            if (data.appkey) {
                this.appkey = data.appkey;
            } else this.appkey = '46FBCD3CBC95692DE58D4CCB3306E5CE';
            if (data.callback) {
                this.callback = data.callback;
            }
            if (data.appversion) {
                this.appversion = data.appversion;
            } else this.appversion = '1.0.1';
            return this;
        },

        //sdk登录调用入口
        login: function () {
            let sid = '', skey = '';
            if (!CC_JSB && this.queries.sid && this.queries.skey) {
                sid = this.queries.sid;
                skey = this.queries.skey;
            } else {
                sid = this._store.getItem("KYLIN_SID");
                skey = this._store.getItem("KYLIN_SKEY");
            }

            if (!sid || !skey) {
                //todo 这里应该弹出用户登陆界面, 目前只做匿名用户登陆
                if (!CC_JSB && typeof showLogin == 'function') {
                    showLogin();
                } else
                    this.registerAnonymous(null, GameLocalMsg.Login.OnWebSdkRegisterUserError);
            } else {
                this.autoLogin(sid, skey, null, GameLocalMsg.Login.OnWebSdkLoginError);
            }
        },

        //根据本地签名自动登录
        autoLogin: function (sid, skey, callback, dispatchMsg) {
            let time = Math.floor(new Date().getTime() / 1000);
            let sign = md5('kylin-start' + this.platform + sid + skey + time + this.version + 'kylin-end');

            this.request(JSON.stringify({
                act: 'autoLogin',
                platform: this.platform,
                version: this.version,
                time: time,
                sid: sid,
                sign: sign
            }), '', callback, dispatchMsg);
        },

        //注册匿名用户
        registerAnonymous: function (callback, dispatchMsg) {
            let time = Math.floor(new Date().getTime() / 1000);
            let sign = md5('kylin-start' + this.platform + time + this.version + 'kylin-end');
            this.request(JSON.stringify({
                act: 'autoReg',
                platform: this.platform,
                version: this.version,
                time: time,
                sign: sign
            }), '', callback, dispatchMsg);
        },

        //根据用户名密码登录
        loginByUp: function (username, password, callback, dispatchMsg) {
            let time = Math.floor(new Date().getTime() / 1000);
            let params = {
                act: 'upSign',
                platform: this.platform,
                version: this.version,
                type: 1,
                username: username,
                password: md5(password),
                time: time,
                sign: ''
            };
            params.sign = md5('kylin-start' + params.platform + params.time + params.type + params.username + params.version + 'kylin-end');
            this.request(JSON.stringify(params), '', callback, dispatchMsg);
        },

        //注册用户名密码
        regByUp: function (username, password, callback, dispatchMsg) {
            let time = Math.floor(new Date().getTime() / 1000);
            let params = {
                act: 'upSign',
                platform: this.platform,
                version: this.version,
                type: 2,
                username: username,
                password: md5(password),
                time: time,
                sign: ''
            };
            params.sign = md5('kylin-start' + params.platform + params.time + params.type + params.username + params.version + 'kylin-end');
            this.request(JSON.stringify(params), '', callback, dispatchMsg);
        },

        //发送http请求
        request: function (data, method, callback, dispatchMsg) {
            let xhr = new XMLHttpRequest();
            let that = this;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 && xhr.status < 400)) {
                    console.log("[SDK.js]: " + xhr.responseText);
                    let ret = JSON.parse(xhr.responseText);
                    if (ret && ret.err == 0) {
                        if (ret.sid) {
                            that._store.setItem("KYLIN_SID", ret.sid);
                        }
                        if (ret.skey) {
                            that._store.setItem("KYLIN_SKEY", ret.skey);
                        }
                    }
                    if (callback) {
                        callback(ret);
                    } else {
                        that.callback(ret);
                    }
                }
            };
            xhr.onerror = function () {
                ObserverMgr.dispatchMsg(dispatchMsg, false);
            };
            xhr.ontimeout = function () {
                ObserverMgr.dispatchMsg(GameLocalMsg.Login.OnWebSdkTimeOut, false);
            };

            if (!method) {
                method = 'POST';
            }
            xhr.open(method, this.url, true);
            xhr.setRequestHeader("Content-type", "text/plain");
            xhr.send(data);
        },

        //调用客服
        kefu: function () {

        },

        //调用充值
        pay: function (data) {
            var productId = data.productId;
            var orderId = data.orderId;
            var money = data.money;
            var callback = data.callback;

            let time = Math.floor(new Date().getTime() / 1000);
            let params = {
                act: 'pay',
                app: this.app,
                platform: this.platform,
                version: this.version,
                productId: productId,
                appno: orderId,
                money: money,
                time: time,
                sign: ''
            };
            params.sign = md5('kylin-start' +
                params.money +
                params.app +
                params.appno +
                params.platform +
                params.productId +
                params.time +
                params.version +
                this.appkey + 'kylin-end');
            this.request(JSON.stringify(params), 'POST', callback);
        },

        //注销用户
        exit: function () {
            this._store.removeItem('KYLIN_SID');
            this._store.removeItem('KYLIN_SKEY');
            if (window.navigator) {
                top.location.reload();
            }
        },

    };

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return sdk;
        })
    } else if (typeof module === 'object' && module.exports) {
        module.exports = sdk;
    } else {
        $.sdk = sdk;
    }
}(this))