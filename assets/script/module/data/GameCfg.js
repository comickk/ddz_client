module.exports = {
    volumeZero: 0.00001,// 声音为0,因为creater的bug
    getMusicVolume(){
        if (this.music.isON) {
            return this.music.volume;
        }
        return this.volumeZero;
    },
    getSoundVolume(){
        if (this.sound.isON) {
            return this.sound.volume;
        }
        return this.volumeZero;
    },
    music: {
        volume: 1,
        isON: true
    },
    sound: {
        volume: 1,
        isON: true
    },
    // 设置中按钮排列类型  1:出牌按钮在左 2:出牌按钮在右
    btnOrderType: 1,

    // 选择的场景

    isShowRaceLayer: false,// 引导返回大厅是否去U钻场界面
    chooseScene: 0,// 选择的场景
    robotThinkTime: 0.01,// 托管思考时间(单位毫秒)
}