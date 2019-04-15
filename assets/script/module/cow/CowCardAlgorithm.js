module.exports = {
    getCowTypeName(cow){
        var cfg = [
            {type: CowGame.CowType.Error, name: "错误"},
            {type: CowGame.CowType.Cow0, name: "没牛"},
            {type: CowGame.CowType.Cow1, name: "牛1"},
            {type: CowGame.CowType.Cow2, name: "牛2"},
            {type: CowGame.CowType.Cow3, name: "牛3"},
            {type: CowGame.CowType.Cow4, name: "牛4"},
            {type: CowGame.CowType.Cow5, name: "牛5"},
            {type: CowGame.CowType.Cow6, name: "牛6"},
            {type: CowGame.CowType.Cow7, name: "牛7"},
            {type: CowGame.CowType.Cow8, name: "牛8"},
            {type: CowGame.CowType.Cow9, name: "牛9"},
            {type: CowGame.CowType.CowCow, name: "牛牛"},
            {type: CowGame.CowType.CowBom, name: "炸弹牛"},
            {type: CowGame.CowType.CowBig5, name: "五花牛"},
            {type: CowGame.CowType.CowSmall5, name: "五小牛"},
        ];
        for (var i = 0; i < cfg.length; i++) {
            var item = cfg[i];
            var type = item.type;
            var name = item.name;
            if (type == cow) {
                return name;
            }
        }
        return "";
    },

    getCowMul(cow){
        var cfg = [
            {type: CowGame.CowType.Cow0, mul: 1},
            {type: CowGame.CowType.Cow1, mul: 1},
            {type: CowGame.CowType.Cow2, mul: 1},
            {type: CowGame.CowType.Cow3, mul: 1},
            {type: CowGame.CowType.Cow4, mul: 1},
            {type: CowGame.CowType.Cow5, mul: 1},
            {type: CowGame.CowType.Cow6, mul: 1},
            {type: CowGame.CowType.Cow7, mul: 2},
            {type: CowGame.CowType.Cow8, mul: 2},
            {type: CowGame.CowType.Cow9, mul: 2},
            {type: CowGame.CowType.CowCow, mul: 3},
            {type: CowGame.CowType.CowBom, mul: 4},
            {type: CowGame.CowType.CowBig5, mul: 5},
            {type: CowGame.CowType.CowSmall5, mul: 8},
        ];
        for (var i = 0; i < cfg.length; i++) {
            var item = cfg[i];
            var type = item.type;
            var mul = item.mul;
            if (type == cow) {
                return mul;
            }
        }
        return 1;
    },
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
    // 获取最大单张牌
    getBigCardLocalID(data){
        data.sort(function (dataA, dataB) {
            return dataA.localID - dataB.localID;
        });
        var item = data[data.length - 1];
        return item['localID'];
    },
    getCow(data){
        var result = {type: CowGame.CowType.Error, main: [], sub: []};

        if (this._getIsSmall5(data)) {// 五小牛
            result.type = CowGame.CowType.CowSmall5;
            result.main = data;
            return result;
        } else if (this._getIsBig5(data)) {// 五花牛
            result.type = CowGame.CowType.CowBig5;
            result.main = data;
            return result;
        } else if (this._getIsBoomCow(data)) {
            result.type = CowGame.CowType.CowBom;
            result.main = data;
            return result;
        }
        var copyData = this.deepCopy(data);
        var mainCow = this._getIsContainCow(copyData);
        if (mainCow != null) {// 有牛牌
            var subCow = this._getSubCard(copyData, mainCow);
            result.main = mainCow;
            result.sub = subCow;

            var num = this._getSubIsCow(subCow);
            if (num == 0) {// 牛牛
                result.type = CowGame.CowType.CowCow;
            } else if (num == 1) {
                result.type = CowGame.CowType.Cow1;
            } else if (num == 2) {
                result.type = CowGame.CowType.Cow2;
            } else if (num == 3) {
                result.type = CowGame.CowType.Cow3;
            } else if (num == 4) {
                result.type = CowGame.CowType.Cow4;
            } else if (num == 5) {
                result.type = CowGame.CowType.Cow5;
            } else if (num == 6) {
                result.type = CowGame.CowType.Cow6;
            } else if (num == 7) {
                result.type = CowGame.CowType.Cow7;
            } else if (num == 8) {
                result.type = CowGame.CowType.Cow8;
            } else if (num == 9) {
                result.type = CowGame.CowType.Cow9;
            }
        } else {// 没牛
            result.type = CowGame.CowType.Cow0;
        }
        return result;
    },

    // 剔除主牌
    _getSubCard(allCard, delCard){
        allCard = this.deepCopy(allCard);
        delCard = this.deepCopy(delCard);
        // 使用i--,当删除元素的时候,不必重新判断迭代器位置
        for (var i = allCard.length - 1; i >= 0; i--) {
            var allCardItem = allCard[i];
            for (var j = delCard.length - 1; j >= 0; j--) {
                var delCardItem = delCard[j];
                if (allCardItem == delCardItem) {
                    allCard.splice(i, 1);
                    delCard.splice(j, 1);
                    break;
                }
            }
        }
        return allCard;
    },
    // 获取副牌是否为牛牌
    _getSubIsCow(data){
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            sum += item.cowNum;
        }
        return sum % 10;
    },
    _getIsContainCow(data){
        // 任意三张牌之和都不能为10 的整数倍数，则判定该牌型为无牛。
        for (var i = 0; i < data.length - 2; i++) {
            var item1 = data[i];
            for (var j = i + 1; j < data.length - 1; j++) {
                var item2 = data[j];
                for (var k = j + 1; k < data.length; k++) {
                    var item3 = data[k];
                    var point1 = item1.cowNum;
                    var point2 = item2.cowNum;
                    var point3 = item3.cowNum;
                    var sum = point1 + point2 + point3;
                    if (sum % 10 == 0) {
                        return [item1, item2, item3];
                    }
                }
            }
        }
        return null;
    },

    _getIsBig5(data){
        // 五花牛   五张牌都是JQK
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var point = item['point'];
            if (point <= 10) {
                return false;
            }
        }
        return true;
    },
    _getIsSmall5(data){
        //五小牛   五张牌均小于5点，且牌点总数小余或等于10，是牛牛里最大的牌，一般为8倍赔率。
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var point = item['point'];
            if (point < 5) {
                sum += point;
            } else {
                return false;
            }
        }
        if (sum <= 10) {
            return true;
        } else {
            return false;
        }
    },
    _getIsBoomCow(data){
        data.sort(function (a, b) {
            return a.localID - b.localID;
        });
        var arr = [];
        for (var i = 0; i < data.length;) {
            var sameItemArr = [];
            var count = 0;
            for (var j = i; j < data.length; j++) {
                if (data[i].point == data[j].point) {
                    count++;
                    sameItemArr.push(data[j]);
                } else {
                    break;
                }
            }
            arr.push(sameItemArr);
            i += count;
        }
        if (arr.length == 2 && (arr[0].length == 4 || arr[1].length == 4)) {
            return true;
        } else {
            return false;
        }
    },
}