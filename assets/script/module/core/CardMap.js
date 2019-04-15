var GamePokerType = require("GamePokerType");

module.exports = {
    getServerID(point, suit){
        for (var k = 0; k < this.map.length; k++) {
            var item = this.map[k];
            if (item.point == point && item.suit == suit) {
                return item['serverID'];
            }
        }
        return -1;
    },
    getLocalID(point, suit){
        for (var k = 0; k < this.map.length; k++) {
            var item = this.map[k];
            if (item.point == point && item.suit == suit) {
                return item['localID'];
            }
        }
        return -1;
    },
    getLocalIDBySeverID(id){
        for (var k = 0; k < this.map.length; k++) {
            var item = this.map[k];
            if (item.serverID == id) {
                return item['localID'];
            }
        }
        return -1;
    },
    getDataByServerID(id){
        for (var k = 0; k < this.map.length; k++) {
            var item = this.map[k];
            if (item.serverID == id) {
                return item;
            }
        }
        return -1;
    },
    map: [
        {serverID: 103, localID: 0, point: 3, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 203, localID: 1, point: 3, suit: GamePokerType.PokerSuit.Club},
        {serverID: 303, localID: 2, point: 3, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 403, localID: 3, point: 3, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 104, localID: 4, point: 4, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 204, localID: 5, point: 4, suit: GamePokerType.PokerSuit.Club},
        {serverID: 304, localID: 6, point: 4, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 404, localID: 7, point: 4, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 105, localID: 8, point: 5, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 205, localID: 9, point: 5, suit: GamePokerType.PokerSuit.Club},
        {serverID: 305, localID: 10, point: 5, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 405, localID: 11, point: 5, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 106, localID: 12, point: 6, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 206, localID: 13, point: 6, suit: GamePokerType.PokerSuit.Club},
        {serverID: 306, localID: 14, point: 6, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 406, localID: 15, point: 6, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 107, localID: 16, point: 7, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 207, localID: 17, point: 7, suit: GamePokerType.PokerSuit.Club},
        {serverID: 307, localID: 18, point: 7, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 407, localID: 19, point: 7, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 108, localID: 20, point: 8, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 208, localID: 21, point: 8, suit: GamePokerType.PokerSuit.Club},
        {serverID: 308, localID: 22, point: 8, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 408, localID: 23, point: 8, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 109, localID: 24, point: 9, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 209, localID: 25, point: 9, suit: GamePokerType.PokerSuit.Club},
        {serverID: 309, localID: 26, point: 9, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 409, localID: 27, point: 9, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 110, localID: 28, point: 10, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 210, localID: 29, point: 10, suit: GamePokerType.PokerSuit.Club},
        {serverID: 310, localID: 30, point: 10, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 410, localID: 31, point: 10, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 111, localID: 32, point: 11, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 211, localID: 33, point: 11, suit: GamePokerType.PokerSuit.Club},
        {serverID: 311, localID: 34, point: 11, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 411, localID: 35, point: 11, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 112, localID: 36, point: 12, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 212, localID: 37, point: 12, suit: GamePokerType.PokerSuit.Club},
        {serverID: 312, localID: 38, point: 12, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 412, localID: 39, point: 12, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 113, localID: 40, point: 13, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 213, localID: 41, point: 13, suit: GamePokerType.PokerSuit.Club},
        {serverID: 313, localID: 42, point: 13, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 413, localID: 43, point: 13, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 114, localID: 44, point: 1, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 214, localID: 45, point: 1, suit: GamePokerType.PokerSuit.Club},
        {serverID: 314, localID: 46, point: 1, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 414, localID: 47, point: 1, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 116, localID: 48, point: 2, suit: GamePokerType.PokerSuit.Diamond},
        {serverID: 216, localID: 49, point: 2, suit: GamePokerType.PokerSuit.Club},
        {serverID: 316, localID: 50, point: 2, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 416, localID: 51, point: 2, suit: GamePokerType.PokerSuit.Spade},

        {serverID: 518, localID: 52, point: 18, suit: GamePokerType.PokerSuit.SmallJoker},
        {serverID: 519, localID: 53, point: 19, suit: GamePokerType.PokerSuit.BigJoker},
    ],
    _testMapData: [
        {serverID: 403, localID: 0, point: 3, suit: GamePokerType.PokerSuit.Spade},//黑桃
        {serverID: 303, localID: 1, point: 3, suit: GamePokerType.PokerSuit.Heart},//红桃
        {serverID: 203, localID: 2, point: 3, suit: GamePokerType.PokerSuit.Club},// 梅花
        {serverID: 103, localID: 3, point: 3, suit: GamePokerType.PokerSuit.Diamond},//方块

        {serverID: 404, localID: 4, point: 4, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 304, localID: 5, point: 4, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 204, localID: 6, point: 4, suit: GamePokerType.PokerSuit.Club},
        {serverID: 104, localID: 7, point: 4, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 405, localID: 8, point: 5, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 305, localID: 9, point: 5, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 205, localID: 10, point: 5, suit: GamePokerType.PokerSuit.Club},
        {serverID: 105, localID: 11, point: 5, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 406, localID: 12, point: 6, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 306, localID: 13, point: 6, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 206, localID: 14, point: 6, suit: GamePokerType.PokerSuit.Club},
        {serverID: 106, localID: 15, point: 6, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 407, localID: 16, point: 7, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 307, localID: 17, point: 7, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 207, localID: 18, point: 7, suit: GamePokerType.PokerSuit.Club},
        {serverID: 107, localID: 19, point: 7, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 408, localID: 20, point: 8, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 308, localID: 21, point: 8, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 208, localID: 22, point: 8, suit: GamePokerType.PokerSuit.Club},
        {serverID: 108, localID: 23, point: 8, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 409, localID: 24, point: 9, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 309, localID: 25, point: 9, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 209, localID: 26, point: 9, suit: GamePokerType.PokerSuit.Club},
        {serverID: 109, localID: 27, point: 9, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 410, localID: 28, point: 10, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 310, localID: 29, point: 10, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 210, localID: 30, point: 10, suit: GamePokerType.PokerSuit.Club},
        {serverID: 110, localID: 31, point: 10, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 411, localID: 32, point: 11, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 311, localID: 33, point: 11, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 211, localID: 34, point: 11, suit: GamePokerType.PokerSuit.Club},
        {serverID: 111, localID: 35, point: 11, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 412, localID: 36, point: 12, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 312, localID: 37, point: 12, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 212, localID: 38, point: 12, suit: GamePokerType.PokerSuit.Club},
        {serverID: 112, localID: 39, point: 12, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 413, localID: 40, point: 13, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 313, localID: 41, point: 13, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 213, localID: 42, point: 13, suit: GamePokerType.PokerSuit.Club},
        {serverID: 113, localID: 43, point: 13, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 414, localID: 44, point: 1, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 314, localID: 45, point: 1, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 214, localID: 46, point: 1, suit: GamePokerType.PokerSuit.Club},
        {serverID: 114, localID: 47, point: 1, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 416, localID: 48, point: 2, suit: GamePokerType.PokerSuit.Spade},
        {serverID: 316, localID: 49, point: 2, suit: GamePokerType.PokerSuit.Heart},
        {serverID: 216, localID: 50, point: 2, suit: GamePokerType.PokerSuit.Club},
        {serverID: 116, localID: 51, point: 2, suit: GamePokerType.PokerSuit.Diamond},

        {serverID: 518, localID: 52, point: 18, suit: GamePokerType.PokerSuit.SmallJoker},
        {serverID: 519, localID: 53, point: 19, suit: GamePokerType.PokerSuit.BigJoker},
    ],
    getPointString(point){
        return this.pointMap[point] || "-";
    },
    pointMap: {
        2: "2", 3: "3", 4: "4", 5: "5", 6: "6",
        7: "7", 8: "8", 9: "9", 10: "10",
        1: "A", 11: "J", 12: "Q", 13: "K",
        18: "小王", 19: "大王",
    }
};
