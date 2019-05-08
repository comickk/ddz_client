module.exports = {
    isApplePlatform(){
        var platform = cc.sys.platform;
        if (platform == cc.sys.IPHONE ||
            platform == cc.sys.MACOS ||
            platform == cc.sys.IPAD) {
            return true;
        } else {
            return false;
        }
    },
    // 格式化num为
    formatNum(num){
        //num = parseInt(num.toString());
        num =num-0;
        var str = "";
        if (num > 100000000) {
            str = this.getNumBySplit(num / 100000000, 2) + '亿'
        } else if (num > 10000) {
            str = this.getNumBySplit(num / 10000, 2) + '万';
        } else {
            str = num.toString();
        }
        return str;
    },
    // 从数组中删除指定元素,不能用于for循环中
    removeElementsFromArray: function (arr, element) {
        var index = -1;
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (arr[i] == element) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            arr.splice(index, 1);
        }
    },
    // 方便查看log
    log(str){
        //console.log("-----------------------------------------------");
        //console.log(str);
        //console.log("-----------------------------------------------");
    },
    destroyChildren(node){
        if (node) {
            if (node.destroyAllChildren) {
                // 1.5
                node.destroyAllChildren();
            } else {
                // 1.4
                var children = node.children;
                for (var k = 0; k < children.length; k++) {
                    children[k].destroy();
                }
            }
        }
    },
    // 自动补0
    prefix(num, length) {
        return (Array(length).join('0') + num).slice(-length);
    },
    sortPutCard(node){
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var script = child.getComponent("GameSmallCard");
            if (script) {
                script.setCardIsLandlord(false);
            }
            child.zIndex =i;
        }
    },
    addLoadingMaskLayer(node){
        if (node) {
            cc.loader.loadRes("prefab/LoadingMask", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = layer.y = 0;
                    node.addChild(layer);
                }
            });
        }
    },
    // 显示浮动提示框
    showTips(str) {
        var scene = cc.director.getScene();
        if (scene) {
            var w = cc.view.getVisibleSize().width;
            var h = cc.view.getVisibleSize().height;
            cc.loader.loadRes("prefab/ShowTipsLayer", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = w / 2;
                    layer.y = h / 2;
                    scene.addChild(layer);
                    var script = layer.getComponent("ShowTipsLayer");
                    if (script) {
                        script.setTips(str);
                    }
                }
            });
        }
    },
    // 显示确定取消对话框
    showOkCancelDlg(title, content, okCB, cancelCB){
        var scene = cc.director.getScene();
        if (scene) {
            var w = cc.view.getVisibleSize().width;
            var h = cc.view.getVisibleSize().height;
            cc.loader.loadRes("prefab/TipsDialog", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = w / 2;
                    layer.y = h / 2;
                    scene.addChild(layer);
                    // todo 后期优化掉TipMsg
                    var script = layer.getComponent("TipMsg");
                    if (script) {
                        script.showMsgWithOkCancel(title, content, okCB, cancelCB);
                    }
                }
            });
        }
    },
    // 显示我知道了对话框
    showIKnowDlg(title, content, okCB){
        var scene = cc.director.getScene();
        if (scene) {
            var w = cc.view.getVisibleSize().width;
            var h = cc.view.getVisibleSize().height;
            cc.loader.loadRes("prefab/TipsDialog", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = w / 2;
                    layer.y = h / 2;
                    scene.addChild(layer);
                    // todo 后期优化掉TipMsg
                    var script = layer.getComponent("TipMsg");
                    if (script) {
                        script.showMsgWithIKnow(title, content, okCB);
                    }
                }
            });
        }
    },
    addEnterGameLoading(addNode){
        if (addNode) {
            var w = cc.view.getVisibleSize().width;
            var h = cc.view.getVisibleSize().height;
            cc.loader.loadRes("prefab/EnterGameLoading", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = 0;
                    layer.y = 0;
                    if (addNode) {
                        addNode.addChild(layer);
                    }
                }
            });
        }
    },
    showBankOutDlg(content, okCB){
        var scene = cc.director.getScene();
        if (scene) {
            var w = cc.view.getVisibleSize().width;
            var h = cc.view.getVisibleSize().height;
            cc.loader.loadRes("prefab/BankOutDlg", function (err, prefab) {
                if (!err) {
                    var layer = cc.instantiate(prefab);
                    layer.x = w / 2;
                    layer.y = h / 2;
                    scene.addChild(layer);
                    var script = layer.getComponent("BankOutDlg");
                    if (script) {
                        script.setContent(content, okCB);
                    }
                }
            });
        }
    },
    makeRdmStr: function (len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (var i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },

    getUnixTime: function () {
        var timestamp = Math.round(new Date().getTime() / 1000);
        return timestamp;
    },
    // 格式化为PEM格式
    formatPEMString(str, insetStr, num){
        var pemStr = "";
        for (var i = 0; i < str.length; i += num) {
            var tmp = str.substr(i, num);
            pemStr += tmp + insetStr;
        }
        return pemStr;
    },


    /**获得区间内的随机数
     * max - 期望的最大值
     * min - 期望的最小值*/
    random: function (min, max) {

        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    // 返回[0,maxNum)的数值
    randomByMaxValue(maxNum){
        return Math.floor(Math.random() * maxNum);
    },
    /**获取中英混排字符串长度 */
    getStringLength: function (str) {
        var l = str.length;
        var blen = 0;
        for (var i = 0; i < l; i++) {
            if ((str.charCodeAt(i) & 0xff00) != 0) {
                blen++;
            }
            blen++;
        }
        return blen;
    },

    /**获取保留n位小数点的数字，不要四舍五入
     * target: 对象
     * keep: 保留几位小数 */
    getNumBySplit: function (target, keep) {
        let list = target.toString().split('.');
        let result;
        if (list[1]) {
            result = list[0] + '.' + list[1].substring(0, keep);
        } else {
            result = list[0];
        }
        return result;
    },


};
