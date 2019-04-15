var ImgMgr = require('ImgMgr');
var JsonFileMgr = require('JsonFileMgr');

module.exports = {
    setRoleHead(sprite, roleID){
        var roleHeadUrl = JsonFileMgr.getRoleHeadImgUrl(roleID);
        if (roleHeadUrl) {
            ImgMgr.setImg(sprite, roleHeadUrl);
        } else {
            console.log("找不到玩家头像数据, roleID: " + roleID);
        }
    },
    setGameBg(sprite, sceneId){
        var sceneData = JsonFileMgr.getSceneCfgDataBySceneId(sceneId);
        if (sceneData && sceneData['png']) {
            var pngUrl = sceneData['png'];
            ImgMgr.setImg(sprite, pngUrl);
        } else {
            console.log("找不到场景配置数据, sceneID: " + sceneId);
        }
    },
    // 获取排行榜排行icon
    _getRankIconUrl(rank){
        var rankUrlCfg = {
            '0': 'icon/rank/crown1',
            '1': 'icon/rank/crown2',
            '2': 'icon/rank/crown3',
        };
        return rankUrlCfg[rank.toString()]
    },
    setRankIcon(sprite, rank){
        var rankUrl = this._getRankIconUrl(rank);
        if (rankUrl) {
            ImgMgr.setImg(sprite, rankUrl);
        }

    },
}

