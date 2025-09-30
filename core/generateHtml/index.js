const { appStoragePath } = require("@/electronApp/helper/index")
const fs = require("fs-extra");
const path = require("path");
const writeReadFileStream = require("@/core/base/WriteReadFileStream")
const pathToUrl = require("@/core/base/PathToUrl")
const record = require("@/core/base/Record")
const paramsValid = require("@/core/base/ParamsValid")
const download = require("@/core/base/Download");

class GenerateHtml {
    constructor() {
    }

    async _readeHtml5Template() {
        const str = await fs.readFile(path.join(__dirname, "./templates/standard.html"));
        return str.toString();
    }

    async _readeImageHtml5Template() {
        const str = await fs.readFile(path.join(__dirname, "./templates/standardImage.html"));
        return str.toString();
    }

    _generateHtmlUrl({ fileName }) {
        return `${pathToUrl.generateOrigin()}/api/common/viewWebPrintHtmlFile/${fileName}`;
    }

    async _generateHtml(content, htmlTemplate = 'standard') {
        let res;
        if (!content.includes('<!DOCTYPE') && !content.includes('<html>')) {
            let str;
            if (htmlTemplate === 'standardImage') {
                str = await this._readeImageHtml5Template();
            } else {
                str = await this._readeHtml5Template();
            }
            const newStr = str.replace("{{%body%}}", content)
            res = await writeReadFileStream.writeUidFile(appStoragePath.getWebPrintHtmlsFolder(), '.html')(newStr);
        } else {
            res = await writeReadFileStream.writeUidFile(appStoragePath.getWebPrintHtmlsFolder(), '.html')(content);
        }
        return {
            htmlUrl: this._generateHtmlUrl({
                fileName: res.fileName,
            }),
            htmlPath: res.filePath,
            htmlFileName: res.fileName,
        }
    }

    async generateHtmlByDom(content, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        try {
            paramsValid.validString(content, 'content');
            paramsValid.validObject(extraOptions, 'extraOptions');
            const results = await this._generateHtml(content);
            Object.assign(recordInfo, results);
            recordInfo.success = true;
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writeHtmlRecord({
                ...recordInfo,
                extraOptions,
                spentTime: Date.now() - startTime,
            });
        }
    }

    async generateHtmlByBase64(base64, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        try {
            paramsValid.validString(base64, 'base64');
            paramsValid.validObject(extraOptions, 'extraOptions');
            if (base64.startsWith('data:text/html;base64,')) {
                base64 = base64.replace('data:text/html;base64,', '')
            }
            paramsValid.validBase64(base64, 'base64');
            const content = Buffer.from(base64, 'base64').toString('utf-8');
            const results = await this._generateHtml(content);
            Object.assign(recordInfo, results);
            recordInfo.success = true;
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writeHtmlRecord({
                ...recordInfo,
                extraOptions,
                spentTime: Date.now() - startTime,
            });
        }
    }

    async generateHtmlByImageUrl(url, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        try {
            paramsValid.validHttpUrl(url, 'url');
            paramsValid.validObject(extraOptions, 'extraOptions');
            const imageBase64 = await download.downImageFileToBase64(url, {
                cookies: extraOptions.cookies,
                headers: extraOptions.httpHeaders,
                timeout: extraOptions.requestTimeout,
                fileType: "image"
            });
            const results = await this._generateHtml(imageBase64, 'standardImage')
            Object.assign(recordInfo, results);
            recordInfo.success = true;
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writeHtmlRecord({
                ...recordInfo,
                extraOptions,
                moreOptions: {
                    url
                },
                spentTime: Date.now() - startTime,
            });
        }
    }

    async generateHtmlByImageBase64(base64, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        try {
            paramsValid.validString(base64, 'base64');
            paramsValid.validObject(extraOptions, 'extraOptions');
            const regex = /^data:image\/(.+);base64,/
            if (!regex.test(base64)) {
                throw new Error('imageBase64 is not correct, it should start with a string like ‘data:image/***;base64,’, eg:"data:image/jpeg;base64,"');
            }
            const replaceBase64 = base64.replace(regex, '')
            paramsValid.validBase64(replaceBase64, 'base64');
            await paramsValid.validImageFileTypeFromBuffer(Buffer.from(replaceBase64, 'base64')).catch(err => {
                throw new Error(err.message + ', and you need to check the base64 string!');
            });
            const results = await this._generateHtml(base64, 'standardImage');
            Object.assign(recordInfo, results);
            recordInfo.success = true;
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writeHtmlRecord({
                ...recordInfo,
                extraOptions,
                spentTime: Date.now() - startTime,
            });
        }
    }
}

module.exports = new GenerateHtml();
