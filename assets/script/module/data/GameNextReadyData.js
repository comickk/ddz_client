// 下一局准备数据
//var GameData = require('GameData');// 会造成循环引用的问题
module.exports = {
    isShowCardBegan: false,// 下一局是否明牌开始
    cleanData(){
        this.isShowCardBegan = false;
    },
}