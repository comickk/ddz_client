// U钻场准备开始游戏数据
module.exports = {
    data: null,// 缓存数据
    setSendPokerCacheData(data){
        this.data = data;
    },
    getSendPokerCacheData(){
        return this.data;
    },
};
