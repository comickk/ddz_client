window.GameHallNetMsg = {
    send: {
        Login: {sendId: 6001, msg: "GameHallNetMsg_Send_Login"},// 登录
        Register: {sendId: 6002, msg: "GameHallNetMsg_Send_Register"},// 注册
        Chat: {sendId: 6100, msg: "GameHallNetMsg_Send_Chat"},// 聊天

    },

    recv: {
        Login: {recvId: 7001, msg: "GameHallNetMsg_Recv_Login"},//登录成功
        Register: {recvId: 7002, msg: "GameHallNetMsg_Recv_Register"},//登录成功
        Chat: {recvId: 7100, msg: "GameHallNetMsg_Recv_Chat"},//聊天

    },
    error: {
        UnExistUser: {errorId: 9001, msg: "GameHallNetMsg_Error_UnExistUser"},// 不存在该用户
    },
    // 通过id获取消息的string
    getReceiveMsgStrByID(id){
        var msg = null;
        for (var k = 0; k < this.recv.length; k++) {
            var item = this.recv[k];
            if (id == item["recvId"]) {
                msg = item['msg'];
            }
        }
        return msg;
    },
    getSendMsgStrByID(id){
        var msg = null;
        for (var k = 0; k < this.send.length; k++) {
            var item = this.send[k];
            if (id == item["sendId"]) {
                msg = item['msg'];
            }
        }
        return msg;
    },
};
