module.exports = {
    storageKey: "HallStorage",
    storageData: {
        userName: null,
        pwd: null,
    },
    initStorage(){
        var str = cc.sys.localStorage.getItem(this.storageKey);
        if (str) {
            var json = JSON.parse(str);
            this.storageData.userName = json['userName'];
            this.storageData.pwd = json['pwd'];
        }
    },
    setUserAndPwd(user, pwd){
        this.storageData.userName = user;
        this.storageData.pwd = pwd;
    },
    save(){
        var str = JSON.stringify(this.storageData);
        cc.sys.localStorage.setItem(this.storageKey, str);
    },

}