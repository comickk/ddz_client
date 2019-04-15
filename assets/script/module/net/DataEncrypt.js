module.exports = {
    /////////////////////////////////>>>>>>解密<<<<<<<<<<<<</////////////////////////////
    dataDecode: function (buffer) {
        var ret = {};

        var dv = new DataView(buffer, 0, 4);
        ret.order = dv.getUint16(0);
        ret.code = dv.getUint16(2);

        if (buffer.byteLength > 4) {
            var u8 = new Uint8Array(buffer, 4, buffer.byteLength - 4);
            var decryptedText = this.aesDecryptForBuffer(u8, window.gameAesKey, window.gameAesIv);
            var first = decryptedText.substr(0, 1);
            ret.data = first == '[' || first == '{' ? JSON.parse(decryptedText) : decryptedText;
        } else {
            ret.data = null;
        }
        return ret;
    },
    //aes 解密ArrayBuffer
    aesDecryptForBuffer: function (buffer, key, iv) {
        var wordArray = CryptoJS.lib.WordArray.create(buffer);
        var msg = CryptoJS.enc.Base64.stringify(wordArray);
        var decrypted = CryptoJS.AES.decrypt(msg, key, {
            iv: iv,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.NoPadding
        });
        return CryptoJS.enc.Utf8.stringify(decrypted);
    },
    //////////////////////////////////>>>>>>>加密<<<<<<<<<<<<<//////////////////////////////
    dataEncode: function (cmd, data) {
        if (data && typeof data != 'string') {
            data = JSON.stringify(data);
        }
        var length = data ? data.length + 4 : 4;
        var buffer = new ArrayBuffer(length);

        var dv = new DataView(buffer, 0, 4);
        var id = ++window.socketId;
        dv.setUint16(0, id, false);
        dv.setUint16(2, parseInt(cmd), false);

        var u8View = new Uint8Array(buffer, 4);
        if (data)
            this.aesEncryptForBuffer(data, window.gameAesKey, window.gameAesIv, u8View);
        return buffer;
    },
    // aes加密ArrayBuffer
    aesEncryptForBuffer: function (buffer, key, iv, u8) {
        var bufferWordArray = CryptoJS.enc.Utf8.parse(buffer);
        var encrypt = CryptoJS.AES.encrypt(bufferWordArray, key, {
            iv: iv,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.NoPadding
        });
        var words = encrypt.ciphertext.words;
        var sigBytes = encrypt.ciphertext.sigBytes;
        if (!u8) {
            u8 = new Uint8Array(sigBytes);
        }
        for (var i = 0; i < sigBytes; i++) {
            u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return u8;
    },


    /////////////////////>>>>>> rsa加密 <<<<<<<////////////////////////////////////
    rsaEncode: function (cmd, data) {
        if (typeof data != 'string') {
            data = JSON.stringify(data);
        }
        var buffer = new ArrayBuffer(data.length + 4);
        var dv = new DataView(buffer, 0, 4);
        var id = ++window.socketId;
        dv.setUint16(0, id, false);
        dv.setUint16(2, parseInt(cmd), false);

        var uint8View = new Uint8Array(buffer, 4);
        var strArr = data.split('');
        for (var i = 0; i < strArr.length; i++) {
            uint8View[i] = strArr[i].charCodeAt(0);
        }
        return buffer;
    },
}
