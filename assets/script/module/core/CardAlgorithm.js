var DECK_TYPE = require('Enum').DECK_TYPE;
var CardMap = require('CardMap');

module.exports = {

    // 对象的深拷贝
    deepCopy (obj) {
        var out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
            if (obj[i] instanceof Array) {
                out[i] = this.deepCopy(obj[i]);
            }
            else out[i] = obj[i];
        }
        return out;
    },

    // 获取相同的牌,相同的牌放在一起
    getSamePokerByList(list){
        // [[],[]]
        var sameArr = [];
        //var list = [  {localID: 1, point: 1},
        //              {localID: 2, point: 4},
        //              {localID: 3, point: 3},
        //              {localID: 4, point: 2}];
        list.sort(function (a, b) {// 先排序一下
            // TODO 按照id排序这个需要注意
            return a.localID - b.localID;
        });

        for (var i = 0; i < list.length;) {
            var arr = [];
            var count = 0;
            for (var j = i; j < list.length; j++) {
                if (list[i].point == list[j].point) {
                    count++;
                    arr.push(list[j]);
                }
            }
            sameArr.push(arr);
            i += count;
        }
        return sameArr;
    },
    // 检查列表里是否为: 指定数量的itemList,每个ItemList包含指定数量的牌
    // listCount 列表的个数
    // itemLen 每个列表的长度
    isFindItemList(sameList, listCount, itemLen, obj){
        var numArr = [];
        var count = 0;
        for (var k = 0; k < sameList.length; k++) {
            var item = sameList[k];
            if (item.length == itemLen) {
                var itemPoint = item[0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;
                itemPoint = itemPoint == 2 ? 15 : itemPoint;
                numArr.push(itemPoint);
                count++;
            }
        }
        if (count == listCount) {
            if (obj) {
                numArr.sort();
                obj.p = numArr[0];
            }
            return true;
        } else {
            return false;
        }
    },

    // 是否包含大小王
    isContainJoker(list, jokerPoint){
        for (var k = 0; k < list.length; k++) {
            var itemList = list[k];
            for (var j = 0; j < itemList.length; j++) {
                if (itemList[j].point == jokerPoint) {
                    return true;
                }
            }
        }
        return false;
    },
    ////////////////////////////////顺子的处理/////////////////////////////////////////
    isSameNumInSameList(list, sameNum){// 列表里面每一列是否都是同样个数的牌
        for (var k = 0; k < list.length; k++) {
            var itemLen = list[k].length;
            if (itemLen != sameNum) {
                return false;
            }
        }
        return true;
    },
    isNumContinue(list, listLen, sameNum){// 是多少顺:单顺,双顺,三顺
        if (list.length >= listLen && this.isSameNumInSameList(list, sameNum)) {
            // 处理能不能连上
            var beganPoint = list[0][0].point; //起始点
            for (var i = 0; i < list.length; i++) {
                var itemPoint = list[i][0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;// 处理A的情况
                if (beganPoint == itemPoint) {
                    beganPoint++;
                } else {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
    //////////////////////////四带二处理//////////////////////////////////////////
    // 剔除一个4个相同的 takeOutItemListWithNum和这个逻辑很像,但是没有判断连续性
    takeOut_Four(list, listCount, itemLen){
        var count = 0;
        for (var i = 0; i < list.length;) {
            var itemList = list[i];
            if (itemList.length == itemLen) {
                list.splice(i, 1);// 剔除掉整个list
                count++;
                if (count == listCount) {// 剔除足够数量的,跳出,处理这种特殊情况:listCount=3,item=3 牌型为 三连飞机带翅膀 333 444 555 666
                    break;
                }
            } else if (itemList.length > itemLen) {
                count++;
                itemList.splice(0, itemLen);//处理listCount=4,itemLen=3: 四连飞机带翅膀  333 444 555 666 (7856)
                i++;
            } else {
                i++;
            }
        }
        if (count == listCount) {
            return true;
        } else {
            return false;
        }
    },
    // len 为牌的张数
    isFourTwoWithDouble(list, obj){
        var pokerList = this.deepCopy(list);
        var b = this.takeOut_Four(pokerList, 1, 4);
        if (b) {
            //4444 (33,55)/(33,33)/(3,3)
            // 寻找点
            var pArr = [];
            for (var a = 0; a < list.length; a++) {
                var itemList = list[a];
                if (itemList.length == 4) {
                    var itemPoint = itemList[0].point;
                    itemPoint = itemPoint == 1 ? 14 : itemPoint;
                    itemPoint = itemPoint == 2 ? 15 : itemPoint;
                    pArr.push(itemPoint);
                }
            }
            if (pArr.length > 0) {
                pArr.sort();
                obj.p = pArr[pArr.length - 1];
            }


            if (pokerList.length == 1 && this.isFindItemList(pokerList, 1, 4)) {// 牌型为 4444 3333
                return true;
            } else if (pokerList.length == 2 && this.isFindItemList(pokerList, 2, 2)) { // 4444 33 55
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    isFourTwoWithAlone(list, obj){
        var pokerList = this.deepCopy(list);
        var b = this.takeOut_Four(pokerList, 1, 4);
        if (b) {
            // 寻找点
            for (var a = 0; a < list.length; a++) {
                var itemList = list[a];
                if (itemList.length == 4) {
                    var itemPoint = itemList[0].point;
                    itemPoint = itemPoint == 1 ? 14 : itemPoint;
                    itemPoint = itemPoint == 2 ? 15 : itemPoint;
                    obj.p = itemPoint;
                    break;
                }
            }

            if (pokerList.length == 1 && this.isFindItemList(pokerList, 1, 2)) {// 4444 33
                return true;
            } else if (pokerList.length == 2 && this.isFindItemList(pokerList, 2, 1)) { // 4444 3 5
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    ////////////////////////////飞机处理//////////////////////////////////////////
    // 剔除指定数量的飞机, 指定长度的itemList
    // list [[],[]] 排序好的二维数组
    takeOutPlane(list, listCount, itemLen, obj){
        // 寻找连续个数的飞机
        var beganPoint = 0;
        var continueArr = [];
        for (var k = 0; k < list.length; k++) {
            var listItem = list[k];
            if (listItem.length >= itemLen) {// 符合长度
                var itemPoint = listItem[0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;// 处理A的情况
                if (beganPoint == 0) {// 开始
                    beganPoint = itemPoint;
                    continueArr.push(listItem);
                } else {
                    beganPoint++;
                    if (itemPoint == beganPoint) {// 连续
                        // 剔除掉飞机 找最大的连续(占时不处理)
                        if (continueArr.length < listCount) {
                            continueArr.push(listItem);
                            // 推入指定数量的牌
                            //var tmpArr = [];
                            //for (var i = 0; i < itemLen; i++) {
                            //    tmpArr.push(listItem[i]);
                            //}
                            //continueArr.push(tmpArr);
                        } else {
                            // 超出连续数量 TODO
                            break;
                        }
                    } else {// 不连续
                        beganPoint = itemPoint;//设置当前为连续起始点
                        if (continueArr.length < listCount) { // 查看之前的连续长度
                            continueArr = [];// 清空
                            continueArr.push(listItem);
                        }
                    }
                }
            } else {

            }
        }
        // 处理掉飞机 continue的元素从list中移除
        if (continueArr.length >= listCount) {// 把飞机从list中移除了
            //用map（hashtable）的思想来解决。(一维数组可以这么做,二维数组不行)
            //思路：将第一个数组存入一个对象，这样就已经去重了；再把第二个数组中的元素当作key从对象中删除。
            // 计算最小的飞机
            if (obj) {
                var itemPoint = continueArr[0][0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;
                itemPoint = itemPoint == 2 ? 15 : itemPoint;
                obj.p = itemPoint;
            }


            for (var j = 0; j < list.length; j++) {
                var curItem = list[j];
                for (var i = 0; i < continueArr.length; i++) {
                    var continueArrItem = continueArr[i];
                    if (curItem[0].point == continueArrItem[0].point) {
                        // 在list中
                        if (curItem.length == itemLen) {
                            list.splice(j, 1);
                            j--;
                        } else if (curItem.length > itemLen) {
                            for (var sss = 0; sss < 3; sss++) {
                                curItem.splice(0, 1);
                            }
                        } else {
                        }
                    } else {
                        // 不在list中
                    }
                }
            }
            return true;
        } else {// 飞机个数不足
            return false;
        }
    },
    // 获取对儿的个数
    isTwainNum(list, num){
        var count = 0;
        for (var k = 0; k < list.length; k++) {
            var itemLen = list[k].length;
            if (itemLen % 2 == 0) {// 是偶数
                count += itemLen / 2;
            } else {
                count = 0;
                break;
            }
        }
        if (count == num) {
            return true;
        } else {
            return false;
        }
    },
    // 获取单子的个数
    isAloneNum(list, num){
        var count = 0;
        for (var k = 0; k < list.length; k++) {
            count += list[k].length;
        }
        if (count == num) {
            return true;
        } else {
            return false;
        }
    },

    // 处理是几个飞机
    // planeNum 飞机的个数
    // isDoubleWing 是否是单/对
    isNumPlane(list, planeNum, isDoubleWing, obj){
        obj.main = [];
        obj.sub = [];
        var pokerList = this.deepCopy(list);
        // 获取飞机的组合情况
        // 444 555 666 777 3连飞机带翅膀 飞机可以认为是(456) 也可以认为是(567)
        // 这时应该取最大的飞机,目前仅仅是取了第一个飞机(即最小的飞机)
        // 按照三顺处理
        var arr = this.getContinueCombination(list, 0, planeNum, 3);
        for (var k = 0; k < arr.length; k++) {
            var itemArr = arr[k];
            var copyList = this.deepCopy(list);
            var delElementArr = this.delTwoArrElementByOneArr(copyList, itemArr);// 剔除掉飞机

            var b = false;
            if (isDoubleWing) {// 处理 带对儿 翅膀
                b = this.isTwainNum(copyList, planeNum);
            } else {// 处理 单 翅膀
                b = this.isAloneNum(copyList, planeNum);
            }

            if (b) {// 只要有一个满足,就是飞机带翅膀/对儿
                obj.p = itemArr[0].point;
                obj.main = itemArr;
                obj.sub = [];
                for (var s1 = 0; s1 < copyList.length; s1++) {
                    var arr1 = copyList[s1];
                    for (var s2 = 0; s2 < arr1.length; s2++) {
                        obj.sub.push(arr1[s2]);
                    }
                }
                return true;
            }
        }
        return false;
        //var b = this.takeOutPlane(pokerList, planeNum, 3, obj);// 剔除掉飞机
        //if (b) { // 有飞机
        //    if (isDoubleWing) {// 处理 带对儿 翅膀
        //        return this.isTwainNum(pokerList, planeNum);
        //    } else {// 处理 单 翅膀
        //        return this.isAloneNum(pokerList, planeNum);
        //    }
        //} else {
        //    return false;
        //}
    },
    // 牌型相同比较大小 返回A>B
    isSamePokerTypeBig(pointA, pointB){
        pointA = pointA == 1 ? 14 : pointA;
        pointA = pointA == 2 ? 15 : pointA;

        pointB = pointB == 1 ? 14 : pointB;
        pointB = pointB == 2 ? 15 : pointB;

        return pointA > pointB;
    },
    // 不同牌型比较大小 返回 A>B
    isDiffPokerTypeBig(pokerTypeA, pokerTypeB){
        var isBig = false;
        if (pokerTypeB == DECK_TYPE.ROCKET) {
            isBig = false;
        } else if (pokerTypeB == DECK_TYPE.BOMB) {
            if (pokerTypeA == DECK_TYPE.ROCKET) {
                isBig = true;
            }
        } else {
            if (pokerTypeA == DECK_TYPE.BOMB || pokerTypeA == DECK_TYPE.ROCKET) {
                isBig = true;
            }
        }
        return isBig;
    },
    /////////////////////////////////////////////////////////////////////////////
    // 获取牌型, 同时要返回比较的牌,
    // [out]
    // TODO 找基准牌这个有时间优化
    // TODO 更好的思路是在检索每张牌的时候就打上主副牌的标记
    getPokerType(list){
        var ret = {
            type: DECK_TYPE.ERROR,// 牌型
            p: 0, // 基准点
            main: [], // 主牌
            sub: [],// 副牌
        };
        var sameList = this.getSamePokerByList(list);
        // 一切判断都是基于sameList
        if (sameList.length == 1 &&
            sameList[0].length == 1) {// 单张
            ret.type = DECK_TYPE.SINGL;
            ret.p = sameList[0][0].point;
            ret.main = sameList[0];
        } else if (sameList.length == 1 &&
            sameList[0].length == 2) {// 一对
            ret.type = DECK_TYPE.DOUBLE;
            ret.p = sameList[0][0].point;
            ret.main = sameList[0];
        } else if (sameList.length == 1 &&
            sameList[0].length == 3) {// 三张
            ret.type = DECK_TYPE.TREBLE;
            ret.p = sameList[0][0].point;
            ret.main = sameList[0];
        } else if (sameList.length == 2 &&
            this.isFindItemList(sameList, 1, 3, ret) &&
            this.isFindItemList(sameList, 1, 1)) {// 三带一
            ret.type = DECK_TYPE.TREBLE_ONE;
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 1) {// 副牌
                    ret.sub = itemList;
                } else if (itemList.length == 3) {// 主牌
                    ret.main = itemList;
                }
            }
        } else if (sameList.length == 2 &&
            this.isFindItemList(sameList, 1, 3, ret) &&
            this.isFindItemList(sameList, 1, 2)) {// 三带二
            ret.type = DECK_TYPE.TREBLE_TWO;

            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 2) {// 副牌
                    ret.sub = itemList;
                } else if (itemList.length == 3) {// 主牌
                    ret.main = itemList;
                }
            }
        } else if (this.isNumContinue(sameList, 5, 1)) {// 顺子
            ret.type = DECK_TYPE.CONTINUE;
            ret.p = sameList[0][0].point;
            ret.main = list;
        } else if (this.isNumContinue(sameList, 3, 2)) {// 双顺
            ret.type = DECK_TYPE.DB_CONTINUE;
            ret.p = sameList[0][0].point;
            ret.main = list;
        } else if (this.isNumContinue(sameList, 2, 3)) {// 三顺
            ret.type = DECK_TYPE.TB_CONTINUE;
            ret.p = sameList[0][0].point;
            ret.main = list;
        } else if (this.isFourTwoWithAlone(sameList, ret)) {// 四带二(6张牌) 4444 (3,5)/(3,3)
            ret.type = DECK_TYPE.FOUR_TWO;
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 4) {// 主牌
                    for (var s = 0; s < itemList.length; s++) {
                        ret.main.push(itemList[s]);
                    }
                } else {// 副牌
                    for (var s = 0; s < itemList.length; s++) {
                        ret.sub.push(itemList[s]);
                    }
                }
            }
        } else if (this.isFourTwoWithDouble(sameList, ret)) {// 四带二(8张牌)
            ret.type = DECK_TYPE.FOUR_TWO4;
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 4) {// 主牌
                    for (var s = 0; s < itemList.length; s++) {
                        ret.main.push(itemList[s]);
                    }
                } else {// 副牌
                    for (var s = 0; s < itemList.length; s++) {
                        ret.sub.push(itemList[s]);
                    }
                }
            }
        } else if (this.isNumPlane(sameList, 5, false, ret)) {// 飞机带翅膀--五连飞机带翅膀
            ret.type = DECK_TYPE.AIRPLANE_7;
        } else if (this.isNumPlane(sameList, 4, true, ret)) {// 飞机带翅膀--四连飞机带四对
            ret.type = DECK_TYPE.AIRPLANE_6;
        } else if (this.isNumPlane(sameList, 4, false, ret)) {// 飞机带翅膀--四连飞机带翅膀
            ret.type = DECK_TYPE.AIRPLANE_5;
        } else if (this.isNumPlane(sameList, 3, true, ret)) {// 飞机带翅膀--三连飞机带三对
            ret.type = DECK_TYPE.AIRPLANE_4;
        } else if (this.isNumPlane(sameList, 3, false, ret)) {// 飞机带翅膀--三连飞机带翅膀
            ret.type = DECK_TYPE.AIRPLANE_3;
        } else if (this.isNumPlane(sameList, 2, true, ret)) {// 飞机带翅膀--二连飞机带二对
            ret.type = DECK_TYPE.AIRPLANE_2;
        } else if (this.isNumPlane(sameList, 2, false, ret)) {// 飞机带翅膀--二连飞机带翅膀 444 4 555 6
            ret.type = DECK_TYPE.AIRPLANE_1;
        } else if (sameList.length == 1 && this.isFindItemList(sameList, 1, 4, ret)) {// 炸弹
            ret.type = DECK_TYPE.BOMB;
            ret.main = list;
        } else if (sameList.length == 2 &&
            this.isFindItemList(sameList, 2, 1) &&
            this.isContainJoker(sameList, 18) &&
            this.isContainJoker(sameList, 19)) {
            ret.type = DECK_TYPE.ROCKET;
            ret.p = 1000;
            ret.main = list;
        }
        // 将找到的主副牌重新按照(黑桃,红桃,梅花,方块的顺序序列化)
        ret.main.sort(function (a, b) {
            return b.localID - a.localID;
        });

        ret.sub.sort(function (a, b) {
            return b.localID - a.localID;
        });
        return ret;
    },
    ////////////////////////////////////////////////////////////////////////////////
    // TODO 需要找出tipIndex重置的机会,就是轮到自己出牌的时候
    tipIndex: 0,// 提示第几个
    _tipCardArr: [],// 提示卡牌结果
    //按照老版本的接口方式对接上去
    calcOverDescWithNewVersion(gameList, selfList){
        var listArr = this.calcPutPoker(gameList, selfList);
        if (listArr && listArr.length > 0) {
            if (this.tipIndex >= listArr.length) {
                this.tipIndex = 0;
            }
            var ret = listArr[this.tipIndex];
            this.tipIndex++;
            // 缺少big
            return ret;
        } else {
            return [];
        }
    },
    // 计算提示牌,返回结果个数,每次出牌都会调用该函数,决定是 出/要不起
    calcTipCard(gameList, selfList){
        this._tipCardArr = this.calcPutPoker(gameList, selfList);
        this.tipIndex = 0;

        if (this._tipCardArr) {
            return this._tipCardArr.length;
        } else {
            return 0;
        }
    },
    // 获取要提示的牌
    getTipCard(){
        if (this._tipCardArr && this._tipCardArr.length > 0) {
            if (this.tipIndex >= this._tipCardArr.length) {
                this.tipIndex = 0;
            }
            var ret = this._tipCardArr[this.tipIndex];
            this.tipIndex++;
            return ret;
        } else {
            return [];
        }
    },

    // 计算出牌
    // gamePoker 上家出的牌
    // selfPoker 自己的手牌
    // [out]
    calcPutPoker(gamePoker, selfPokerList){
        var ret = this.getPokerType(gamePoker);
        var calcResult = this.getSameTypePoker(ret.type, ret.p, selfPokerList, gamePoker);
        return calcResult;
    },
    ////////////////////////////////////////////////////////////////////////////////
    // 计算A牌是否能压住B牌
    // listA listB 默认为有效牌型
    calcIsCanPass(listA, listB){
        var resultA = this.getPokerType(listA);
        var typeA = resultA.type;
        var pointA = resultA.p;

        var resultB = this.getPokerType(listB);
        var typeB = resultB.type;
        var pointB = resultB.p;

        if (typeA == typeB) {// 牌型相同,比较点数
            if (pointA > pointB) {
                return true;
            } else {
                return false;
            }
        } else {// 牌型不同,只能比较牌型是否可以压制
            // base 为基准牌类型,bigResult为胜利牌型
            if (typeB == DECK_TYPE.BOMB) {// 火箭压制炸弹
                if (typeA == DECK_TYPE.ROCKET) {
                    return true;
                } else {
                    return false;
                }
            } else if (typeB == DECK_TYPE.ROCKET) {// 火箭无人能敌
                return false;
            } else {// 基准牌为其他类型
                if (typeA == DECK_TYPE.BOMB || typeA == DECK_TYPE.ROCKET) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    },
    // 列表里面 是否 包含指定数量的itemList,每个ItemList包含指定数量的牌
    // listCount 列表的个数
    // itemLen 每个列表的长度
    isContainItemList(sameList, listCount, itemLen){
        var count = 0;
        for (var k = 0; k < sameList.length; k++) {
            var item = sameList[k];
            if (item.length == itemLen) {
                count++;
            }
        }
        if (count >= listCount) {
            return true;
        } else {
            return false;
        }
    },
    // 获取指定长度的item 返回格式为 [[],[]]
    getListItemByLen(list, len, basePoint){
        var retArr = [];
        for (var i = 0; i < list.length; i++) {
            var itemList = list[i];// 数组
            var itemPoint = list[i][0].point;
            itemPoint = itemPoint == 1 ? 14 : itemPoint;
            itemPoint = itemPoint == 2 ? 15 : itemPoint;
            if (itemList.length == len && itemPoint > basePoint) {
                retArr.push(itemList);
            }
        }
        return retArr;
    },
    // 拆牌得到指定长度的牌
    // splitLen 要拆分牌组长度
    // getLen 从牌组里面拿几张牌
    // basePoint 比较的牌
    splitPoker(list, splitLen, getLen, basePoint){
        var retArr = [];
        if (getLen <= splitLen) {
            for (var k = 0; k < list.length; k++) {
                var itemList = list[k];
                var itemPoint = itemList[0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;
                itemPoint = itemPoint == 2 ? 15 : itemPoint;
                if (itemList.length == splitLen && itemPoint > basePoint) {
                    var tmpArr = [];
                    for (var i = 0; i < getLen; i++) {
                        tmpArr.push(itemList[i]);
                    }
                    retArr.push(tmpArr);
                }
            }
        } else {
            console.log("不能从" + splitLen + "张牌中取" + getLen + "张牌!");
        }
        return retArr;
    },
    // 把炸弹拆分成指定的牌型
    splitBoomToLen(sameList, len, basePoint){
        var ret = [];
        for (var k = 0; k < sameList.length; k++) {
            var itemList = sameList[k];
            var itemPoint = itemList[0].point;
            itemPoint = itemPoint == 1 ? 14 : itemPoint;
            itemPoint = itemPoint == 2 ? 15 : itemPoint;
            if (itemList.length == 4 && len < 4 && itemPoint > basePoint) {
                var tmpArr = [];
                for (var i = 0; i < len; i++) {
                    tmpArr.push(itemList[i]);
                }
                ret.push(tmpArr);
            }
        }
        return ret;
    },
    // 获取所有的炸弹
    getAllBoom(sameList){
        var arr = this.getBoom(sameList, 0);
        return arr;
    },
    // 获取比某个值大的炸弹 - 返回二维数组
    getBoom(sameList, basePoint){
        var boomArr = [];
        // 炸弹
        for (var k = 0; k < sameList.length; k++) {
            var item = sameList[k];
            var itemPoint = sameList[k][0].point;
            itemPoint = itemPoint == 1 ? 14 : itemPoint;
            itemPoint = itemPoint == 2 ? 15 : itemPoint;
            if (item.length == 4 && itemPoint > basePoint) {
                boomArr.push(item);
            }
        }
        return boomArr;
    },
    // 获取火箭 - 返回一维数组
    getRocket(sameList){
        var jokerArr = [];
        for (var k = 0; k < sameList.length; k++) {
            var itemList = sameList[k];
            if (itemList.length == 1) {
                var itemPoint = itemList[0].point;
                if (itemPoint == 18 || itemPoint == 19) {
                    jokerArr.push(itemList[0]);
                }
            }
        }
        if (jokerArr.length == 2) {
            return jokerArr;
        } else {
            return null;
        }
    },
    // 处理单子
    dealSingl(sameList, bigPoint){
        var result = [];
        if (this.isContainItemList(sameList, 1, 1)) {// 获取单子
            result = this.getListItemByLen(sameList, 1, bigPoint);
        }

        if (this.isContainItemList(sameList, 1, 2)) {// 拆分对子
            var resultTmp = this.splitPoker(sameList, 2, 1, bigPoint);
            for (var k = 0; k < resultTmp.length; k++) {
                result.push(resultTmp[k]);
            }
        }

        if (this.isContainItemList(sameList, 1, 3)) {// 拆三连
            var resultTmp = this.splitPoker(sameList, 3, 1, bigPoint);
            for (var k = 0; k < resultTmp.length; k++) {
                result.push(resultTmp[k]);
            }
        }

        //if (this.isContainItemList(sameList, 1, 4)) {// 拆炸弹
        //    var resultTmp = this.splitPoker(sameList, 4, 1, bigPoint);
        //    for(var k in resultTmp){
        //        result.push(resultTmp[k]);
        //    }
        //}

        // 炸弹也都要拆分成符合结果的一种
        var specialBoom = this.splitBoomToLen(sameList, 1, bigPoint);
        for (var k = 0; k < specialBoom.length; k++) {
            result.push(specialBoom[k]);
        }

        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 处理对儿
    dealDouble(sameList, bigPoint){
        var result = [];
        if (this.isContainItemList(sameList, 1, 2)) {// 有对子
            result = this.splitPoker(sameList, 2, 2, bigPoint);
        }

        if (this.isContainItemList(sameList, 1, 3)) {// 没有对子拆三连
            var tmpArr = this.splitPoker(sameList, 3, 2, bigPoint);
            for (var k = 0; k < tmpArr.length; k++) {
                result.push(tmpArr[k]);
            }
        }

        // 炸弹也都要拆分成符合结果的一种
        var specialBoom = this.splitBoomToLen(sameList, 2, bigPoint);
        for (var k = 0; k < specialBoom.length; k++) {
            result.push(specialBoom[k]);
        }

        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 处理三张
    // TODO(有个大小顺序问题) 444 手牌为5555 666 提示顺序应该为555 666 555, 现在是666 555 5555
    dealThree(sameList, bigPoint){
        var result = [];
        if (this.isContainItemList(sameList, 1, 3)) {// 有没有三张
            result = this.splitPoker(sameList, 3, 3, bigPoint);
        }
        // 炸弹也都要拆分成符合结果的一种
        var specialBoom = this.splitBoomToLen(sameList, 3, bigPoint);
        for (var k = 0; k < specialBoom.length; k++) {
            result.push(specialBoom[k]);
        }

        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },

    // 删除在二维数组中的所有一维数组元素
    delTwoArrElementByOneArr(twoArr, oneArr){
        var delElementArr = [];
        for (var i = 0; i < twoArr.length;) {
            var itemTwoArr = twoArr[i];
            for (var j = 0; j < itemTwoArr.length;) {
                var itemTwoArrItem = itemTwoArr[j];
                var point = itemTwoArrItem.point;
                var suit = itemTwoArrItem.suit;
                // 在oneArr里面查找这个元素,来决定删不删
                var isDel = false;
                //console.log(oneArr);
                // TODO 会出现oneArrr.length oneArr不是数组的情况
                for (var k = 0; k < oneArr.length; k++) {
                    var onArrItem = oneArr[k];
                    // 准确来说应该按照id查找
                    var onArrItemPoint = onArrItem.point;
                    var onArrItemSuit = onArrItem.suit;
                    if (onArrItemPoint == point && onArrItemSuit == suit) {
                        isDel = true;
                        break;
                    }
                }

                // 删除元素
                if (isDel) {
                    var delElement = itemTwoArr.splice(j, 1);
                    delElementArr.push(delElement[0]);
                } else {
                    j++;
                }
            }
            // 这个item完全删除了也要干掉
            if (itemTwoArr.length == 0) {
                twoArr.splice(i, 1);
            } else {
                i++;
            }
        }
        return delElementArr;
    },
    // 计算单张最小牌 最小牌提示结果
    calcMinAloneCard(sameList){
        if (this.isContainItemList(sameList, 1, 1)) {// 看有没有单儿
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 1) {
                    return [itemList[0]];
                }
            }
        } else if (this.isContainItemList(sameList, 1, 3)) {// 没有单牌,拆三连
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 3) {
                    return [itemList[0]];
                }
            }
        } else if (this.isContainItemList(sameList, 1, 2)) {// 没有三连,拆对子
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 2) {
                    return [itemList[0]];
                }
            }
        } else if (this.isContainItemList(sameList, 1, 4)) {// 没有对子,拆炸弹
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 4) {
                    return [itemList[0]];
                }
            }
        } else {
            return [sameList[0][0]];
        }
    },
    // 计算最小对儿
    calcMinDoubleCard(sameList){
        if (this.isContainItemList(sameList, 1, 2)) {// 看有没有对儿
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 2) {
                    return itemList;
                }
            }
        } else if (this.isContainItemList(sameList, 1, 3)) {// 没有对儿,拆三连
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 3) {
                    return [itemList[0], itemList[1]];
                }
            }
        } else if (this.isContainItemList(sameList, 1, 4)) {// 没有三连拆炸弹
            for (var k = 0; k < sameList.length; k++) {
                var itemList = sameList[k];
                if (itemList.length == 4) {
                    return [itemList[0], itemList[1]];
                }
            }
        } else {// 没有对儿
            return [];
        }
    },
    // 处理三带一
    // isFriendOne 带的一是不是 对儿
    dealThreeOnePair(sameList, bigPoint, isFriendOne){
        var result = [];
        if (this.isContainItemList(sameList, 1, 3)) {// 有没有三张
            result = this.splitPoker(sameList, 3, 3, bigPoint);
        }
        // 炸弹也都要拆分成符合结果的一种
        var specialBoom = this.splitBoomToLen(sameList, 3, bigPoint);
        for (var k = 0; k < specialBoom.length; k++) {
            result.push(specialBoom[k]);
        }
        if (result.length > 0) {//有三张牌, 需要一张单牌
            for (var i = 0; i < result.length;) {
                var itemResult = result[i];
                var copySameList = this.deepCopy(sameList);
                //把result里面的牌从sameList中干掉
                this.delTwoArrElementByOneArr(copySameList, itemResult);
                if (copySameList.length > 0) {
                    // 如果拿不出牌 就要把之前的结果清空
                    var oneCard = [];
                    if (isFriendOne) {
                        // 带对儿
                        oneCard = this.calcMinDoubleCard(copySameList);
                    } else {
                        // 单儿
                        oneCard = this.calcMinAloneCard(copySameList);
                    }
                    // 计算最小单张牌
                    if (oneCard.length > 0) {
                        for (var k = 0; k < oneCard.length; k++) {
                            itemResult.push(oneCard[k]);
                        }
                        i++;
                    } else {
                        // 干掉这个结果
                        result.splice(i, 1);
                    }
                } else {
                    // 干掉这个结果
                    result.splice(i, 1);
                }
            }
        }
        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 处理4_2
    // isFriendOne 2手副牌是不是对儿
    // TODO FOUR_TWO4 会出现两次提示一样,可能不是提示数量导致的,也有可能是外围代码
    dealFourTwo(sameList, bigPoint, isFriendOne){
        var result = [];
        // 先找炸弹
        if (this.isContainItemList(sameList, 1, 4)) {
            result = this.splitPoker(sameList, 4, 4, bigPoint);
        }
        if (result.length > 0) {
            for (var i = 0; i < result.length;) {
                var itemResult = result[i];// 4个炸弹
                // 计算副牌
                var copyList = this.deepCopy(sameList);
                this.delTwoArrElementByOneArr(copyList, itemResult);
                var ret = [];
                if (isFriendOne) {
                    ret = this.getEnoughDoublePoker(copyList, 2);

                    if (ret.length > 0 && ret.length == 2 * 2) {
                        // 有副牌,把副牌放到飞机里面
                        for (var a = 0; a < ret.length; a++) {
                            itemResult.push(ret[a]);
                        }
                        i++;
                    } else {// 没有副牌
                        result.splice(i, 1);
                    }
                } else {
                    ret = this.getEnoughAlonePoker(copyList, 2);
                    if (ret.length > 0 && ret.length == 2) {
                        // 有副牌,把副牌放到飞机里面
                        for (var a = 0; a < ret.length; a++) {
                            itemResult.push(ret[a]);
                        }
                        i++;
                    } else {// 没有副牌
                        result.splice(i, 1);
                    }
                }

            }
        } else {// 没有炸弹,直接拜拜
            result = [];
        }

        // 炸弹也是一种结果
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        // 把火箭也放入计算结果里面
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }

        return result;
    },
    // 处理顺子
    // minContinueLen   连牌的最小长度
    // itemContinueNum  多少顺
    dealContinue(sameList, minPoint, minContinueLen, itemContinueNum){
        var result = this.getContinueCombination(sameList, minPoint, minContinueLen, itemContinueNum);
        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 获取几个连续相同的组合结果
    // minPoint 最小的连续牌
    // minListContinueLen  有几个连续相同的
    // minItemContinueNum  单个相同的牌有几张
    getContinueCombination(list, minPoint, minListContinueLen, minItemContinueNum){
        var result = [];
        var copyList = this.deepCopy(list);

        //黑桃,红桃,梅花,方块的顺序序列化
        for (var num = 0; num < copyList.length; num++) {
            var item = copyList[num];
            item.sort(function (a, b) {
                return b.localID - a.localID;
            });
        }

        // 先找出不限长度的连顺
        var beganPoint = 0;
        var arr = [];// 3维数组
        // [
        //  [[1,1,1],[2,2,2],[3,3,3]],// 连续的序列
        //  [[2,2,2],[3,3,3],[4,4,4]],// 连续的序列
        // ]
        var tmpArr = [];// 2维数组 [[1,1,1],[2,2,2],[3,3,3]]
        for (var i = 0; i < copyList.length; i++) {
            var itemList = copyList[i];//[1,1,1,1]
            if (itemList.length >= minItemContinueNum) {
                var itemPoint = itemList[0].point;
                itemPoint = itemPoint == 1 ? 14 : itemPoint;// 只能连到1

                if (beganPoint == 0) {// 开始点
                    if (itemPoint > minPoint) {
                        beganPoint = itemPoint;
                        var tmpSameArr = [];
                        for (var c = 0; c < minItemContinueNum; c++) {
                            tmpSameArr.push(itemList[c]);
                        }
                        tmpArr.push(tmpSameArr);
                    }
                } else {
                    beganPoint++;
                    if (itemPoint == beganPoint) {// 连续
                        var tmpSameArr = [];
                        for (var c = 0; c < minItemContinueNum; c++) {
                            tmpSameArr.push(itemList[c]);
                        }
                        tmpArr.push(tmpSameArr);
                    } else {// 不连续了
                        beganPoint = itemPoint;
                        if (tmpArr.length >= minListContinueLen) {
                            // 符合连续的条件 3,4,5,6,7  9<=
                            arr.push(tmpArr);// 把之前符合条件的连续保存起来
                            tmpArr = [];// 把当前起始点的保存起来
                            var tmpSameArr = [];
                            for (var c = 0; c < minItemContinueNum; c++) {
                                tmpSameArr.push(itemList[c]);
                            }
                            tmpArr.push(tmpSameArr);
                        } else {
                            // 不符合连续的条件 3,4,5  9<=
                            tmpArr = [];
                            var tmpSameArr = [];
                            for (var c = 0; c < minItemContinueNum; c++) {
                                tmpSameArr.push(itemList[c]);
                            }
                            tmpArr.push(tmpSameArr);
                        }
                    }
                }
            }
        }
        arr.push(tmpArr);// 把最后的一个计算结果也推入进去
        // 剔除掉长度不足的连续
        for (var i = 0; i < arr.length;) {
            var itemContinue = arr[i];
            if (itemContinue.length < minListContinueLen) {// 剔除
                arr.splice(i, 1);
            } else {
                i++;
            }
        }

        // 长度超出的需要作出组合
        for (var k = 0; k < arr.length; k++) {
            var itemContinue = arr[k];// 2维数组 [[1,1,1],[2,2,2],[3,3,3]]
            if (itemContinue.length == minListContinueLen) {
                var allItem = [];
                for (var m = 0; m < itemContinue.length; m++) {
                    for (var n = 0; n < itemContinue[m].length; n++) {
                        allItem.push(itemContinue[m][n]);
                    }
                }
                result.push(allItem);
            } else if (itemContinue.length > minListContinueLen) {
                // 2维数组 [[1,1,1],[2,2,2],[3,3,3]]
                var num = itemContinue.length - minListContinueLen + 1;//可能出现的结果个数
                for (var i = 0; i < num; i++) {
                    var tmp = [];
                    // i控制从哪里开始
                    for (var j = 0; j < minListContinueLen; j++) {
                        // j 控制走几步
                        //tmp.push(itemContinue[i][j]);
                        //for (var c = 0; c < minItemContinueNum; c++) {
                        // 得到相同的item [1,1,1]
                        for (var m = 0; m < itemContinue[i + j].length; m++) {
                            tmp.push(itemContinue[i + j][m]);
                        }
                        //}
                    }
                    result.push(tmp);
                }

            }
        }
        return result;
    },

    dealBoom(sameList, bigPoint){
        var result = [];
        if (this.isContainItemList(sameList, 1, 4)) {// 直接出炸弹
            result = this.splitPoker(sameList, 4, 4, bigPoint);
        }
        // 把火箭也放入计算结果里面
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 获取足够的对儿
    // TODO 这块有待优化
    getEnoughDoublePoker(copyList, num){
        var ret = [];// 1维数组
        var isEnough = false;
        // 优先找同类型的
        for (var a = 0; a < copyList.length; a++) {
            var copyListItem = copyList[a];
            if (copyListItem.length == 2) {
                ret.push(copyListItem[0]);
                ret.push(copyListItem[1]);
                if (ret.length >= num * 2) {// 够了
                    isEnough = true;
                    break;
                }
            }
        }
        // 拆三张
        if (!isEnough) {
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 3 && isEnough == false) {
                    for (var i = 0; i < copyListItem.length; i++) {
                        ret.push(copyListItem[i]);
                        if (ret.length >= num * 2) {// 够了
                            isEnough = true;
                            break;
                        } else {

                        }
                    }
                }
            }
        }
        // 拆炸弹
        if (!isEnough) {
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 4 && isEnough == false) {
                    for (var i = 0; i < copyListItem.length; i++) {
                        ret.push(copyListItem[i]);
                        if (ret.length >= num * 2) {// 够了
                            isEnough = true;
                            break;
                        } else {

                        }
                    }
                }
            }
        }
        return ret;
    },
    // 获取足够数量的类型牌(单儿/对儿)
    // TODO 这块有待优化
    getEnoughAlonePoker(copyList, num){
        var ret = [];// 1维数组
        var isEnough = false;
        var rocketArr = this.getRocket(copyList);// 观察是否有火箭
        if (rocketArr) {
            // 有火箭 , 不拆 大小王
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                var itemPoint = copyListItem[0].point;
                var isJoker = itemPoint == 18 || itemPoint == 19;
                if (copyListItem.length == 1 && isJoker == false) {// 不拆分大小王
                    ret.push(copyListItem[0]);
                    if (ret.length >= num) {// 够了
                        isEnough = true;
                        break;
                    }
                }
            }
        } else {
            // 没有火箭,大 / 小 王 认为是单牌
            // 优先找同类型的,先排除大小王
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 1) {
                    ret.push(copyListItem[0]);
                    if (ret.length >= num) {// 够了
                        isEnough = true;
                        break;
                    }
                }
            }
        }

        // 如果找单子的话,拆对儿
        if (!isEnough) {
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 2 && isEnough == false) {
                    for (var i = 0; i < copyListItem.length; i++) {
                        ret.push(copyListItem[i]);
                        if (ret.length >= num) {// 够了
                            isEnough = true;
                            break;
                        }
                    }
                }
            }
        }
        // 拆三张
        if (!isEnough) {
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 3 && isEnough == false) {
                    for (var i = 0; i < copyListItem.length; i++) {
                        ret.push(copyListItem[i]);
                        if (ret.length >= num) {// 够了
                            isEnough = true;
                            break;
                        } else {

                        }
                    }
                }
            }
        }

        // 拆炸弹
        if (!isEnough) {
            for (var a = 0; a < copyList.length; a++) {
                var copyListItem = copyList[a];
                if (copyListItem.length == 4 && isEnough == false) {
                    for (var i = 0; i < copyListItem.length; i++) {
                        ret.push(copyListItem[i]);
                        if (ret.length >= num) {// 够了
                            isEnough = true;
                            break;
                        } else {

                        }
                    }
                }
            }
        }

        // 拆火箭
        if (!isEnough && rocketArr) {
            for (var k = 0; k < rocketArr.length; k++) {
                ret.push(rocketArr[k]);
                if (ret.length >= num) {// 够了
                    isEnough = true;
                    break;
                } else {

                }
            }
        }
        return ret;
    },
    // 处理飞机带翅膀
    // planeNum     几个飞机
    // minPoint     最小的飞机点数
    // isFriendOne  翅膀是否为对儿
    dealPlane(sameList, planeNum, minPlanePoint, isFriendOne){
        // 二维数组,获取飞机
        var result = this.getContinueCombination(sameList, minPlanePoint, planeNum, 3);
        if (result.length > 0) {
            // 处理每个飞机结果
            for (var i = 0; i < result.length;) {
                var itemArr = result[i];// [3,3,3,4,4,4]
                // 计算副牌
                var copyList = this.deepCopy(sameList);
                this.delTwoArrElementByOneArr(copyList, itemArr);
                var ret = [];
                if (isFriendOne) {
                    ret = this.getEnoughDoublePoker(copyList, planeNum);
                    if (ret.length > 0 && ret.length == planeNum * 2) {
                        // 有副牌,把副牌放到飞机里面
                        for (var a = 0; a < ret.length; a++) {
                            itemArr.push(ret[a]);
                        }
                        i++;
                    } else {// 没有副牌
                        result.splice(i, 1);// 把该种结果剔除掉
                    }
                } else {
                    ret = this.getEnoughAlonePoker(copyList, planeNum);
                    if (ret.length > 0 && ret.length == planeNum) {
                        // 有副牌,把副牌放到飞机里面
                        for (var a = 0; a < ret.length; a++) {
                            itemArr.push(ret[a]);
                        }
                        i++;
                    } else {// 没有副牌
                        result.splice(i, 1);// 把该种结果剔除掉
                    }
                }
            }
        } else {// 没有飞机,直接拜拜
            result = [];
        }


        // 把炸弹/火箭也放入计算结果里面
        var boom = this.getAllBoom(sameList);
        for (var k = 0; k < boom.length; k++) {
            result.push(boom[k]);
        }
        var joker = this.getRocket(sameList);
        if (joker) {
            result.push(joker);
        }
        return result;
    },
    // 获取相同类型的手牌
    // 返回值格式为: [[],[]] // 每一条结果都是一个arr,比如[[3,3,3,4],[6,6,6,4]]
    getSameTypePoker(type, basePoint, handList, gameList){
        // 对A,2 做特殊处理
        basePoint = basePoint == 1 ? 14 : basePoint;
        basePoint = basePoint == 2 ? 15 : basePoint;

        var gamePokerList = this.getSamePokerByList(gameList);
        var sameList = this.getSamePokerByList(handList);
        if (type == DECK_TYPE.SINGL) { // 单张
            return this.dealSingl(sameList, basePoint);
        } else if (type == DECK_TYPE.DOUBLE) {// 一对
            return this.dealDouble(sameList, basePoint);
        } else if (type == DECK_TYPE.TREBLE) {// 三张
            return this.dealThree(sameList, basePoint);
        } else if (type == DECK_TYPE.TREBLE_ONE) {// 三带一
            return this.dealThreeOnePair(sameList, basePoint, false);
        } else if (type == DECK_TYPE.TREBLE_TWO) {// 三带二
            return this.dealThreeOnePair(sameList, basePoint, true);
        } else if (type == DECK_TYPE.CONTINUE) {// 顺子
            return this.dealContinue(sameList, basePoint, gamePokerList.length, 1);
        } else if (type == DECK_TYPE.DB_CONTINUE) {// 双顺
            return this.dealContinue(sameList, basePoint, gamePokerList.length, 2);
        } else if (type == DECK_TYPE.TB_CONTINUE) { // 三顺
            return this.dealContinue(sameList, basePoint, gamePokerList.length, 3);
        } else if (type == DECK_TYPE.AIRPLANE_1) {// 飞机带翅膀--二连飞机带翅膀
            return this.dealPlane(sameList, 2, basePoint, false);
        } else if (type == DECK_TYPE.AIRPLANE_2) {// 飞机带翅膀--二连飞机带二对
            return this.dealPlane(sameList, 2, basePoint, true);
        } else if (type == DECK_TYPE.AIRPLANE_3) {// 飞机带翅膀--三连飞机带翅膀
            return this.dealPlane(sameList, 3, basePoint, false);
        } else if (type == DECK_TYPE.AIRPLANE_4) {// 飞机带翅膀--三连飞机带三对
            return this.dealPlane(sameList, 3, basePoint, true);
        } else if (type == DECK_TYPE.AIRPLANE_5) {// 飞机带翅膀--四连飞机带翅膀
            return this.dealPlane(sameList, 4, basePoint, false);
        } else if (type == DECK_TYPE.AIRPLANE_6) {// 飞机带翅膀--四连飞机带四对
            // 4*3 +4*2 = 20 估计这种情况不太会遇到,毕竟一下子牌就出去了
            return this.dealPlane(sameList, 4, basePoint, true);
        } else if (type == DECK_TYPE.AIRPLANE_7) {// 飞机带翅膀--五连飞机带翅膀
            return [];// 肯定是地主一下子出完了,没得玩了
        } else if (type == DECK_TYPE.FOUR_TWO4) {// 四带二(8张牌)
            return this.dealFourTwo(sameList, basePoint, true);
        } else if (type == DECK_TYPE.FOUR_TWO) {// 四带二(4张牌)
            return this.dealFourTwo(sameList, basePoint, false);
        } else if (type == DECK_TYPE.BOMB) {// 炸弹
            return this.dealBoom(sameList, basePoint);
        } else if (type == DECK_TYPE.ROCKET) {// 火箭
            return [];
        } else if (type == DECK_TYPE.ERROR) {// 牌不合规则
            return null;
        }
        return null;
    },
    // 是否卡牌的点数连续
    // cardList 牌的数据
    // 要构成顺子的张数
    // 返回值表示需要的顺子的点数
    isCardPointContinue(cardList, totalNum, basePoint){
        // 由小到大排序
        cardList.sort(function (a, b) {
            return a.localID - b.localID;
        });

        var ret = [];

        // 最少2张牌
        var len = cardList.length;
        if (len < 2) {
            return ret;
        }

        // 起始牌+totalNum 小于2点,没有超出封顶, 后顺
        // [7,8]
        // [4,5,6,7,8] [5,6,7,8,9] [6,7,8,9,10] [7,8,9,10,11]
        // 计算区间值
        var minCardPoint = this._dealCardPoint(cardList[0].point);
        var maxCardPoint = this._dealCardPoint(cardList[len - 1].point);
        var minPoint = maxCardPoint - totalNum + 1;
        minPoint = minPoint <= basePoint ? basePoint + 1 : minPoint;// 到基准牌为止
        minPoint = minPoint <= 3 ? 3 : minPoint;// 最小不能小于3
        var maxPoint = minCardPoint + totalNum - 1;
        maxPoint = maxPoint > 14 ? 14 : maxPoint;// 到A为止
        if (maxPoint - minPoint < totalNum - 1) {// 最少得total个数字
            return ret;
        }

        // 判断连续
        var isContinue = true;
        var prePoint = minCardPoint;
        for (var i = 1; i < len; i++) {
            var itemPoint = this._dealCardPoint(cardList[i].point);
            if (itemPoint != prePoint + 1) {
                isContinue = false;
                break;
            }
        }

        function isNumInCardList(num) {
            for (var k = 0; k < cardList.length; k++) {
                if (cardList[k].point == num) {
                    return true;
                }
            }
            return false;
        }

        // 计算需要的点数
        if (isContinue) {
            for (var i = minPoint; i <= maxPoint - totalNum + 1; i++) {
                var resultItem = [];
                for (var j = 0; j < totalNum; j++) {
                    var num = this._restoreCardPoint(i + j);
                    var b = isNumInCardList(num);
                    if (b) {
                        // 已经有这个数字了
                    } else {
                        resultItem.push(num);
                    }
                }
                ret.push(resultItem);
            }
        }
        return ret;
    },
    // 处理特殊的点数
    _dealCardPoint(itemPoint){
        itemPoint = itemPoint == 1 ? 14 : itemPoint;
        itemPoint = itemPoint == 2 ? 15 : itemPoint;
        return itemPoint;
    },
    _restoreCardPoint(num){
        num = num == 14 ? 1 : num;
        num = num == 15 ? 2 : num;
        return num;
    },

};
