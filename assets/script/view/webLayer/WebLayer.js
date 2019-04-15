cc.Class({
    extends: cc.Component,

    properties: {
        webView: {default: null, displayName: "WebView", type: cc.WebView},

    },

    onLoad: function () {

    },

    onClickClose(){
        this.node.destroy();
    },
    setWebUrl(url){
        this.webView.url = url;
    },
});
