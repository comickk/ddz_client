var JsonFileCfg = require('JsonFileCfg');
var Utils = require('Utils');

module.exports = {
    // 预加载声音资源
    preLoadAudio(){
        var audioCfg = JsonFileCfg.file.audio.data.json;
        for (var k = 0; k < audioCfg.length; k++) {
            var itemCfg = audioCfg[k];
            var mp3File = itemCfg['mp3'];
           // var url = cc.url.raw("resources/" + mp3File + ".mp3");//老版本
            var url = "resources/" + mp3File;
            cc.loader.loadRes(url, this._onLoadProgress, this._onLoadOver);
        }
    },
    // 获取牌面的点数
    getCardPointImg(type, color, point){
        var cardViewData = JsonFileCfg.file.cardView.data.json;
        for (var k = 0; k < cardViewData.length; k++) {
            var item = cardViewData[k];
            var itemType = item.type;
            var itemColor = item.color;
            var itemPoint = item.point;
            if (itemType == type && itemColor == color && itemPoint == point) {
                return item.pointPng;
            }
        }
        return null;
    },
    // 获取牌的花色图片
    getCardSuitImg(type, suit){
        var cardViewData = JsonFileCfg.file.cardView.data.json;
        for (var k = 0; k < cardViewData.length; k++) {
            var item = cardViewData[k];
            var itemType = item.type;
            var itemSuit = item.suit;
            if (itemType == type && itemSuit == suit) {
                return item.pointPng;
            }
        }
        return null;
    },
    getRandName(){
        var jsonData = JsonFileCfg.file.randName.data.json;
        var index1 = Utils.randomByMaxValue(jsonData.length);
        var index2 = Utils.randomByMaxValue(jsonData.length);
        return jsonData[index1].name1 + jsonData[index2].name2;
    },
    getRoleHeadImgUrl(roleId){
        var jsonData = JsonFileCfg.file.roleCfg.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var id = itemData['roleId'];
            var headUrl = itemData['head'];
            if (id && roleId == id) {
                return headUrl;
            }
        }
        return null;
    },
    getRoleDataById(id){
        var jsonData = JsonFileCfg.file.roleCfg.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var itemId = itemData['id'];
            if (itemId && itemId == id) {
                return itemData;
            }
        }
        return null;
    },
    getRoleDataByRoleId(roleId){
        var jsonData = JsonFileCfg.file.roleCfg.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var id = itemData['roleId'];
            if (id && roleId == id) {
                return itemData;
            }
        }
        return null;
    },
    getRoleSex(roleId){
        var sex = Poker.RoleSex.Man;
        var roleData = this.getRoleDataByRoleId(roleId);
        if (roleData) {
            var roleSex = roleData['sex'];
            if (roleSex == 0) {
                sex = Poker.RoleSex.WoMan;
            } else if (roleSex == 1) {
                sex = Poker.RoleSex.Man;
            }
        }
        return sex;
    },
    getSceneCfgDataBySceneId(sceneId){
        var jsonData = JsonFileCfg.file.sceneCfg.data.json;        
       
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];           
            var id = itemData['sceneId'];
            if (id && sceneId == id) {
                return itemData;
            }
        }
        return null;
    },
    // 获取默认的场景id
    getDefaultSceneID(){
        var jsonData = JsonFileCfg.file.sceneCfg.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var id = itemData['sceneId'];
            if (id) {
                return id;
            }
        }
        return 0;
    },
    getChatWordArrBySex(sex){
        var arr = [];
        var jsonData = JsonFileCfg.file.chatSound.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var itemSex = itemData['sex'];
            if (sex == itemSex) {
                arr.push(itemData);
            }
        }
        return arr;
    },
    getChatAudioUrl(chatId, sex){
        var jsonData = JsonFileCfg.file.chatSound.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var itemSex = itemData['sex'];
            var itemId = itemData['chatId'];
            var itemUrl = itemData['mp3'];
            if (itemId == chatId && sex == itemSex) {
                return itemUrl;
            }
        }
        return null;
    },
    getChatDesc(chatId, sex){
        var jsonData = JsonFileCfg.file.chatSound.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var itemSex = itemData['sex'];
            var itemId = itemData['chatId'];
            var itemDesc = itemData['desc'];
            if (itemId == chatId && sex == itemSex) {
                return itemDesc;
            }
        }
        return null;
    },
    isContentForbidWord(strName){
        // 敏感词汇
        var wordArr = JsonFileCfg.file.forbidWord.data.json;
        for (var i = 0; i < wordArr.length; i++) {
            var word = wordArr[i]["forbid"];
            var index = strName.toString().indexOf(word);
            if (index >= 0) {
                return true;
            }
        }
        return false;
    },
    getErrString(errCode){
        var jsonData = JsonFileCfg.file.errString.data.json;
        for (var k = 0; k < jsonData.length; k++) {
            var itemData = jsonData[k];
            var itemSex = itemData['id'];
            var str = itemData['errStr'];
            if (errCode == itemSex) {
                return str;
            }
        }
        return null;
    },
}