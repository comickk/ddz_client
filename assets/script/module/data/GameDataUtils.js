var GameData = require('GameData');
var CardMap = require('CardMap');
var ObserverMgr = require('ObserverMgr');

module.exports = {
    // 获取房间名字
    getGoldRoomName(goldRoomId){
        var nameArr = {
            "1": "金豆新手场",
            "2": "金豆初级场",
            "3": "金豆中级场",
            "4": "金豆高级场",
        };
        return nameArr[goldRoomId];
    },
    //设置进入房间的数据
    setEnterRoomData(roomType, roomID){
        GameData.roomData.type = roomType;
        GameData.roomData.roomID = roomID;
        if (roomType == Poker.GameRoomType.Gem) {
            var gemRooms = GameData.roomInfo.gemRoom;
            for (var k = 0; k < gemRooms.length; k++) {
                var item = gemRooms[k];
                if (item.id == roomID) {
                    this._setGameRoomData(item);
                    break;
                }
            }
        } else if (roomType == Poker.GameRoomType.Gold) {
            var goldRooms = GameData.roomInfo.goldRoom;
            for (var k = 0; k < goldRooms.length; k++) {
                var item = goldRooms[k];
                if (item.id == roomID) {
                    this._setGameRoomData(item);
                    break;
                }
            }
        }
    },
    _getGemRoomDataByID(roomID){
        var gemRooms = GameData.roomInfo.gemRoom;
        for (var k = 0; k < gemRooms.length; k++) {
            var genItem = gemRooms[k];
            if (genItem.id == roomID) {
                return genItem;
            }
        }
        return null;
    },
    _getGoldRoomDataByID(roomID){
        var goldRoom = GameData.roomInfo.goldRoom;
        for (var k = 0; k < goldRoom.length; k++) {
            var genItem = goldRoom[k];
            if (genItem.id == roomID) {
                return genItem;
            }
        }
        return null;
    },
    // 更换场次, 刷新房间数据,金币场
    updateRoomData(roomID){
        var type = GameData.roomData.type;
        var id = GameData.roomData.roomID;
        var roomInfo = null;
        if (type == Poker.GameRoomType.Gem) {// 在金币场
            if (roomID == id) {
                return;
            }
            roomInfo = this._getGemRoomDataByID(roomID);
            if (roomInfo) {
                this._setGameRoomData(roomInfo);
            } else {
                console.log("没有找到比赛场房间配置数据,roomID: " + roomID);
            }
        } else if (type == Poker.GameRoomType.Gold) {// 在金豆场
            if (roomID == id) {
                return;
            }
            roomInfo = this._getGoldRoomDataByID(roomID);
            if (roomInfo) {
                this._setGameRoomData(roomInfo);
            } else {
                console.log("没有找到金豆场房间配置数据,roomID: " + roomID);
            }
        }
    },
    // 根据进入的房间id设置房间数据
    setRoomDataByRoomID(roomID){
        var roomInfo = null;
        var gemRooms = GameData.roomInfo.gemRoom;
        for (var k = 0; k < gemRooms.length; k++) {
            var genItem = gemRooms[k];
            if (genItem.id == roomID) {
                roomInfo = genItem;
                GameData.roomData.type = Poker.GameRoomType.Gem;
                break;
            }
        }
        var goldRooms = GameData.roomInfo.goldRoom;
        for (var k = 0; k < goldRooms.length; k++) {
            var goldItem = goldRooms[k];
            if (goldItem.id == roomID) {
                roomInfo = goldItem;
                GameData.roomData.type = Poker.GameRoomType.Gold;
                break;
            }
        }
        if (roomInfo) {
            this._setGameRoomData(roomInfo);
            return true;
        } else {
            return false;
        }
    },
    _setGameRoomData(roomInfo){
        GameData.roomData.roomID = roomInfo.id;
        GameData.roomData.roomInfo = roomInfo;
        GameData.roomData.mul.init = roomInfo.initMul;
        ObserverMgr.dispatchMsg(GameLocalMsg.Play.OnUpdateMul, null);
    },
    // 获取最高场次, 只推荐2场
    getHeightGemMatchArr(roomID){
        var arr = [];
        for (var k = 0; k < GameData.roomInfo.gemRoom.length; k++) {
            var item = GameData.roomInfo.gemRoom[k];
            if (item.id > roomID && arr.length < 2) {
                arr.push(item);
            }
        }
        return arr;
    },
    // 获取可以进入的最高金币场
    getCanEnterMaxGoldRoom(){
        var roomInfo = GameData.roomInfo.goldRoom;
        var curGold = GameData.playData.gold;
        var enterGoldRoom = null;
        var max = 0;
        for (var i = 0; i < roomInfo.length; i++) {
            var roomItem = roomInfo[i];
            var minEnterPoint = roomItem.minEnterPoint;
            if (curGold >= minEnterPoint && minEnterPoint > max) {
                max = minEnterPoint;
                enterGoldRoom = roomItem;
            }
        }
        if (enterGoldRoom == null) {
            // 当所有房间都不能进入的时候,我就尝试进入最低的房间,还是因为补助的情况在,
            // TODO 处理本地的补助数据
            // 有补助可以领取就会进入,如果没有补助可以领取,会在网络消息返回中处理
            enterGoldRoom = roomInfo[0];
        }
        return enterGoldRoom;
    },
    // 是否有足够的豆
    isEnoughBean(num){
        var curGold = this.selfInfo.gold;
        return curGold >= num;
    },
    // 是否超出上限
    isBeyondBean(num){
        var curGold = this.selfInfo.gold;
        if (num.toString() == "0") {
            return false;// 没有上限
        } else {
            if (curGold <= num) {
                return false;
            } else {
                return true;
            }
        }
    },
    // 获取要压制的牌的数据
    getAtkCardData(){
        var ret = [];
        var atkCardServerIDArray = GameData.roomData.attackPoker.card;
        //atkCardServerIDArray = [114,214];
        for (var k = 0; k < atkCardServerIDArray.length; k++) {
            var cardData = CardMap.getDataByServerID(atkCardServerIDArray[k]);
            ret.push(cardData);
        }
        return ret;
    },
    // 获取游戏结算公共倍率
    getComMul(){
        var roomDataMul = GameData.roomData.mul;
        var comMul = roomDataMul.init * //  -- init: 初始倍数
            roomDataMul.vc *//  -- vc: 明牌倍数
            roomDataMul.grab *//  -- grab: 抢地主倍数
            roomDataMul.bc *//  -- bc: 底牌倍数
            roomDataMul.bomb *//  -- bomb: 炸弹倍数
            roomDataMul.spring;//  -- spring: 春天倍数
        //roomDataMul.lo;//  -- lo: 地主倍数
        return comMul;
    },
    getSelfMul(){
        var lo = GameData.roomData.mul.lo;
        return this.getComMul() * lo * GameData.roomData.mul.u3;
    },
    getLeftMul(){
        var lo = GameData.roomData.mul.lo;
        return this.getComMul() * lo * GameData.roomData.mul.u1;
    },
    getRightMul(){
        var lo = GameData.roomData.mul.lo;
        return this.getComMul() * lo * GameData.roomData.mul.u2;
    },
};