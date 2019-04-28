// 缓存排行数据
var NetSocketMgr = require('NetSocketMgr');
module.exports = {
    rankData: {
        time: 0,// 获取时间
        data: null,// 获取数据
    },
    // 是否可以获取
    isCanGetRankData(){
        var curTime = new Date().getTime();
        var diff = curTime - this.rankData.time;// 毫秒差
        var diffSecond = diff / 1000;
        var diffMin = diff / 1000 / 60;
        var diffHour = diff / 1000 / 60 / 60;
        console.log("距离上次获取排行数据时间差: " + diffSecond + " 秒");
        if (diffSecond > 60 * 5) {
            return true;
        }
        return false;
    },
    sendGetRankNetMsg(){
        this.rankData.time = new Date().getTime();
        // 获取排行榜  type 0 为所有榜单  1为只有金币榜  2是只有U钻榜
        NetSocketMgr.send(GameNetMsg.send.GetRank, {type: 0});
        //NetHttpMgr.HttpReq('rank',GameNetMsg.recv.GetRank.msg);
    },
    updateRankData(data){
        if (data) {
            this.rankData.time = new Date().getTime();
            this.rankData.data = data;
        }
    },
    getRankData(){
        return this.rankData.data;
    }
}
