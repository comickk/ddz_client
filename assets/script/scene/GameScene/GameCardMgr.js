var GameData = require('GameData');

module.exports = {
    handPokerArray: [],// 手牌数组
    slideSelectPokerArray: [],// 选择的手牌,仅仅在touch阶段使用
    curTouchPoker: null,// 当前触摸的牌
    exitRoom(){
        this.cleanAllPoker();
        this.slideSelectPokerArray = [];
        this.curTouchPoker = null;
        this.cleanAllPoker();
    },
    cleanAllPoker(){
        this.slideSelectPokerArray = [];
        this.curTouchPoker = [];
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            item.destroy();
        }
        this.handPokerArray = [];
    },

    //最后一张明牌/地主
    updateLastOneCardFlag(){
        var isShowCard = GameData.roomData.selfPlayData.isShowCard;
        var isLandlord = GameData.roomData.selfPlayData.isLandlord;
        var len = this.handPokerArray.length;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                var item = this.handPokerArray[i];
                var script = item.getComponent('GameCard');
                if (script) {
                    if (i == len - 1) {
                        script.onTurnShowCard(isShowCard);
                        script.onTurnLandlordCard(isLandlord);
                    } else {
                        script.onTurnShowCard(false);
                        script.onTurnLandlordCard(false);
                    }
                }
            }
        }
    },
    // 更新为地主牌
    updateToLandlordCard(){
        // todo 这种方式需要重新思考下怎么处理
        var isLandlord = GameData.roomData.selfPlayData.isLandlord;
        if (isLandlord) {
            for (var k = 0; k < this.handPokerArray.length; k++) {
                var item = this.handPokerArray[k];
                var script = item.getComponent('GameCard');
                script.onTurnLandlordCard(true);
            }
        }
    },
    // 获取手牌的数据
    getAllHandPokerData(){
        var ret = [];
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            ret.push(script.cardData);
        }
        return ret;
    },

    // 获取手中指定点数的所有牌
    getAllHandPokerByPoint(point){
        var card = [];
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script.cardData.point == point) {
                card.push(item);
            }
        }
        return card;
    },
    // 获取一张指定点数的没有选择的牌
    getUnSelectedHandPokerByPoint(point){
        var card = null;
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            var isSelected = script.getIsSelected();
            if (isSelected == false && script.cardData.point == point) {
                card = item;
                break;
            }
        }
        return card;
    },
    // 获取选择的手牌Data
    getSelectHandPokerData(){
        var ret = [];
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            var isSelected = script.getIsSelected();
            if (isSelected) {
                ret.push(script.cardData);
            }
        }
        return ret;
    },
    // 设置所有的手牌未选中
    setAllHandPokerUnSelect(){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            script.onSlideUnSelect();// 牌的颜色变过来
            var isSelected = script.getIsSelected();
            if (isSelected) {
                script.unSelect();
            }
        }
    },
    // 设置手牌处于选中
    setCardSelected(tipCardData){
        for (var k = 0; k < tipCardData.length; k++) {
            var nodeScript = this.getHandPokerNodeByData(tipCardData[k]);
            if (nodeScript) {
                var isSelected = nodeScript.getIsSelected();
                if (isSelected == false) {
                    nodeScript.select();
                }
            } else {
                console.log("error");
            }
        }
    },
    // 根据data获取指定的cardNode
    getHandPokerNodeByData(cardData){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script.cardData == cardData) {
                return script;
            }
        }
        return null;
    },
    // 清除选择的手牌,
    cleanSelectedHandPoker(){
        var ret = [];
        for (var i = 0; i < this.handPokerArray.length;) {
            var item = this.handPokerArray[i];
            var script = item.getComponent('GameCard');
            var isSelected = script.getIsSelected();
            if (isSelected) {
                script.putOut();
                var delArr = this.handPokerArray.splice(i, 1);
                ret.push(script.cardData);
            } else {
                i++;
            }
        }
        return ret;
    },
    // 随机选择一张手牌
    randomSelectHandPoker(){
        var len = this.handPokerArray.length;
        if (len > 0) {
            var item = this.handPokerArray[len - 1];
            var script = item.getComponent('GameCard');
            var isSelected = script.getIsSelected();
            if (isSelected == false) {
                script.select();
            }
        }
    },
    // 是否
    isSlideCardContinue(){

    },
    // 获取被选择的牌的数量
    getSelectCardData(){
        var ret = [];
        for (var i = 0; i < this.handPokerArray.length; i++) {
            var item = this.handPokerArray[i];
            var script = item.getComponent('GameCard');
            var isSelected = script.getIsSelected();
            if (isSelected) {
                ret.push(script.cardData);
            }
        }
        return ret;
    },
    pushSlideSelectCard(card){
        var script = card.getComponent('GameCard');
        script.setIsTouchFlag(true);
        script.onSlideSelect();
        this.slideSelectPokerArray.push(card);
    },
    updatePushCard(card){
        // 0,1,2,3,4,5,6,7,8,9
        var len = this.slideSelectPokerArray.length;
        if (len > 0) {
            var curZ = card.getLocalZOrder();
            var beganZ = this.slideSelectPokerArray[0].getLocalZOrder();
            this._resetSliderArr();
            if (curZ > beganZ) {//向右滑动
                this._pushCardByZOrder1(beganZ, curZ);
            } else if (curZ < beganZ) {// 向左滑动
                this._pushCardByZOrder2(beganZ, curZ);
            } else if (curZ == beganZ) {// 又滑动到了自己
                this.pushSlideSelectCard(card);
            }
        } else if (len == 0) {
            this.pushSlideSelectCard(card);
        }
    },

    // 滑动出单张牌
    // 其他牌降下去, 这张牌升上去 出这张滑动的牌
    onSlidePutOneCard(slideCard){
        this.setAllHandPokerUnSelect();// 所有的牌降下去
        this._resetSliderArr();// slider重置
        this.pushSlideSelectCard(slideCard);// 滑动的牌加入到sliderArr
        this.changeSlideSelectCardState();
    },
    onAddSlideCard(slideCard){
        this.pushSlideSelectCard(slideCard);// 滑动的牌加入到sliderArr
        var script = slideCard.getComponent('GameCard');
        script.select();
        script.onSlideUnSelect();
    },
    _resetSliderArr(){
        for (var k = 0; k < this.slideSelectPokerArray.length; k++) {
            var item = this.slideSelectPokerArray[k];
            var script = item.getComponent('GameCard');
            script.setIsTouchFlag(false);
            script.onSlideUnSelect();
        }
        this.slideSelectPokerArray = [];
    },
    _pushCardByZOrder1(min, max){
        for (var i = min; i <= max; i++) {
            var card = this._getCardByZOrder(i);
            if (card) {
                this.pushSlideSelectCard(card);
            }
        }
    },
    _pushCardByZOrder2(max, min){
        for (var i = max; i >= min; i--) {
            var card = this._getCardByZOrder(i);
            if (card) {
                this.pushSlideSelectCard(card);
            }
        }
    },
    _getCardByZOrder(ZOrder){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var card = this.handPokerArray[k];
            var z = card.getLocalZOrder();
            if (z == ZOrder) {
                return card;
            }
        }
        return null;
    },
    // 卡牌选中状态翻转
    changeSlideSelectCardState(){
        for (var k = 0; k < this.slideSelectPokerArray.length; k++) {
            var item = this.slideSelectPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script) {
                script.changeSelect();
            }
        }
        this.slideSelectPokerArray = [];
    },
    setAllHandPokerUnTouch(){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script) {
                script.setIsTouchFlag(false);
            }
        }
    },
    // 设置所有的手牌滑动没有被选择,清除掉黑色的选择状态
    setAllHandPokerSlideUnSelect(){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script) {
                script.onSlideUnSelect();
            }
        }
    },
    removeAfterJoinCardInSlideSelectArray(card){
        var len = this.slideSelectPokerArray.length;
        for (var i = 0; i < len; i++) {
            var item = this.slideSelectPokerArray[i];
            if (item == card) {
                var delArr = this.slideSelectPokerArray.splice(i + 1, len - 1);
                for (var k = 0; k < delArr.length; k++) {
                    var delItem = delArr[k];
                    var script = delItem.getComponent('GameCard');
                    script.setIsTouchFlag(false);
                    script.onSlideUnSelect();
                }
                return true;
            }
        }
        return false;
    },
    // 是否指定牌在选择出牌里面
    isCardInSelectedPutCardArray(card){
        for (var k = 0; k < this.handPokerArray.length; k++) {
            var item = this.handPokerArray[k];
            var script = item.getComponent('GameCard');
            if (script) {
                var isSelected = script.getIsSelected();
                if (isSelected && item == card) {
                    return true;
                }
            }
        }
        return false;
    },

    // card为Node
    pushCard(card){
        this.handPokerArray.push(card);
        // 调整下顺序
        this.handPokerArray.sort(function (a, b) {
            var localIDA = a.getComponent('GameCard').cardData.localID;
            var localIDB = b.getComponent('GameCard').cardData.localID;
            return localIDB - localIDA;
        });
    },
    // 重新计算手牌的坐标X
    getCardPositionXArr(len){
        var cardSpace = 55;// 牌间距
        var posXArray = [];
        // 计算坐标
        if (len % 2 == 0) {
            // 偶数 (-10 10)
            for (var i = 0; i < len / 2; i++) {
                var x = cardSpace / 2 + cardSpace * i;
                posXArray.push(x);
                posXArray.push(-x);
            }
        } else {
            // 奇数 (-20, 0, 20)
            posXArray.push(0);
            for (var i = 1; i <= len / 2; i++) {
                var x = cardSpace * i;
                posXArray.push(x);
                posXArray.push(-x);
            }
        }
        // 坐标由小到大排序
        posXArray.sort(function (a, b) {
            return a - b;
        });
        return posXArray;
    },
    // 获取触摸的卡牌
    getTouchPokerCard(point){
        for (var i = this.handPokerArray.length - 1; i >= 0; i--) {
            var item = this.handPokerArray[i];
            var rectWord = item.getBoundingBoxToWorld();
            if (rectWord.contains(point)) {
                return item;
            }
        }
        return null;
    },


};