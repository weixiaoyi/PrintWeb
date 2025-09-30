const crypto = require("crypto");
const paramsValid = require("@/core/base/ParamsValid");
const fs = require("fs-extra");
const path = require("path");
const dayjs = require("dayjs");
const {app} = require("electron");
const machineId = require('node-machine-id');
const {appStoragePath} = require("@/electronApp/helper");

class AppAuthority {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.key = '2924a02228eb3e7f0b625ed1590c6b12cdweac2804c7fece5f04af7241b67778';
        this.iv = '27516913728c7b32eee60baa647caef9';
        this.periodStartTime = null;
        this.periodTime = 15 * 24 * 60 * 60 * 1000;
        this.periodStatus = 1; // 1:试用中 2:试用结束
    }

    _setAppAuthority(authorityInfoObj) {
        app._authority = {
            status: 1,
            periodStatus:1
        }
    }

    async loadAuthorityCert() {
        try {
            this._setAppAuthority();
            const certFile = path.join(appStoragePath.getWebAuthorityFolder(), 'authority.cert');
            const isExist = await fs.pathExists(certFile);
            if (isExist) {
                const encrypted = await fs.readFile(certFile, 'utf8');
                let decrypted;
                const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key, 'hex'), Buffer.from(this.iv, 'hex'));
                decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                const decryptedParsed = JSON.parse(decrypted);
                if (decryptedParsed.type && decryptedParsed.startTime && decryptedParsed.endTime) {
                    if (dayjs(decryptedParsed.startTime).isValid() && dayjs(decryptedParsed.endTime).isValid()) {
                        this._setAppAuthority(decryptedParsed);
                    }
                }
            }
        } catch (err) {
            this._setAppAuthority();
        }
    }

    async importDecrypt({filePath}) {
        // 解密数据
        await paramsValid.validLocalFileIsExist(filePath, 'filePath', 'App authority file is not exist!');
        const extName = path.extname(filePath);
        if (extName !== '.cert') {
            throw new Error('the file is not a valid cert file!');
        }
        const encrypted = await fs.readFile(filePath, 'utf8');
        let decrypted
        try {
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key, 'hex'), Buffer.from(this.iv, 'hex'));
            decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
        } catch (err) {
            throw new Error('the file is not a valid cert file!');
        }
        paramsValid.validStringToJson(decrypted, 'decrypted cert');
        const decryptedParsed = JSON.parse(decrypted);
        if (!decryptedParsed.type || !decryptedParsed.startTime || !decryptedParsed.endTime) {
            throw new Error('the file is not a valid format cert file!');
        }
        paramsValid.validString(decryptedParsed.type, 'type');
        paramsValid.validString(decryptedParsed.startTime, 'startTime');
        paramsValid.validString(decryptedParsed.endTime, 'endTime');
        paramsValid.validDayjsTime(decryptedParsed.startTime, 'startTime');
        paramsValid.validDayjsTime(decryptedParsed.endTime, 'endTime');
        if (decryptedParsed.type === 'machine') {
            const id = await machineId.machineId();
            if (decryptedParsed.code !== id) {
                throw new Error('the file is not a matched cert file!');
            }
        }
        this._setAppAuthority(decryptedParsed);
        return decryptedParsed;
    }

    isRequiredAuthorityAndFinishedFree() {
        // 非有效授权状态且试用结束状态
        if (app._authority) {
            return [0, 2].includes(+app._authority.status) && +app._authority.periodStatus === 2;
        } else {
            return true
        }
    }
}

module.exports = new AppAuthority();
