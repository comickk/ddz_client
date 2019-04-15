module.exports = {
    router: [],
    // 设置路由
    setRouter(router){
        this._cleanRouter();
        if (this.router) {
            this.router = router.split('/');
        }
    },
    // 获取当前router
    getStepRouter(){
        var router = null;
        if (this.router.length > 0) {
            router = this.router[0];
            this._passRouter();
        }
        return router;
    },
    _passRouter(){
        this.router.splice(0, 1);
    },
    _cleanRouter(){
        this.router = [];
    }
}