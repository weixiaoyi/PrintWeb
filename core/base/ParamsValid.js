const fs = require("fs-extra");
const { fileTypeFromFile, fileTypeFromBuffer } = require("file-type")
const { Base64 } = require('js-base64')
const { PDFDocument } = require("pdf-lib");
const dayjs = require('dayjs');
const got = require("got").default;
const makeGot = require("@/core/base/MakeGot");

class ParamsValid {
    constructor() {
    }

    validRequired(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value === "undefined" || value === "" || value === null) {
            throw new Error(`${filedName} is required!`);
        }
    }

    validArrayEnums(value, filedName, options = []) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (!Array.isArray(options)) {
            throw new Error('options must be an array');
        }
        if (!options.includes(value)) {
            throw new Error(`Unsupported ${filedName} for ${value}, only accept: ${options.join('、')}`)
        }
    }

    validBoolean(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'boolean') {
            throw new Error(`Unsupported ${filedName} for ${value}, only accept: true or false`);
        }
    }

    validNumber(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'number') {
            throw new Error(`${filedName} must be a number`);
        }
        if (value < 0) {
            throw new Error(`${filedName} must not be less than 0`);
        }
    }

    validInterNumber(value, filedName) {
        this.validNumber(value, filedName)
        if (!Number.isInteger(value)) {
            throw new Error(`${filedName} must be an integer`);
        }
        if (value <= 0) {
            throw new Error(`${filedName} must be grater than 0`);
        }
    }

    validMinNumber(value, filedName, min) {
        this.validNumber(value, filedName)
        if (value < min) {
            throw new Error(`${filedName} must be greater than ${min}, but got ${value}`);
        }
    }

    validString(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'string') {
            throw new Error(`${filedName} must be a string`);
        }
        this.validRequired(value, filedName);
    }

    validStringNotRequired(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'string') {
            throw new Error(`${filedName} must be a string`);
        }
    }

    validNumberOrString(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'number' && typeof value !== 'string') {
            throw new Error(`${filedName} must be a number or a string`);
        }
        if (typeof value === 'number') {
            this.validNumber(value, filedName);
        }
        if (typeof value === 'string') {
            this.validString(value, filedName);
        }
    }

    validNumberStringWithPXCMLengthUnits(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        this.validNumberOrString(value, filedName);
        if (typeof value === 'number') {
            this.validNumber(value, filedName);
        }
        if (typeof value === 'string') {
            this.validString(value, filedName);
            if (!/^(0|[1-9]\d*)(\.\d+)?(px|cm|in|mm)?$/.test(value)) {
                throw new Error(`${filedName} must be a effective length units, eg: 10、10px、10cm、10mm、10in`);
            }
        }
    }

    validObject(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            throw new Error(`${filedName} must be a object`);
        }
    }

    validFunction(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (typeof value !== 'function') {
            throw new Error(`${filedName} must be a function`);
        }
    }

    validArray(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (!Array.isArray(value)) {
            throw new Error(`${filedName} must be a Array`);
        }
    }

    validArrayWithLength(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (!Array.isArray(value)) {
            throw new Error(`${filedName} must be a Array`);
        }
        if (value.length === 0) {
            throw new Error(`${filedName} must be not an empty Array`);
        }
    }

    validArrayObject(value, filedName) {
        this.validArray(value, filedName);
        value.forEach((value, index) => {
            this.validObject(value, `${filedName} item[${index}] must be an object`);
        })
    }

    validHttpUrl(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (!(value?.startsWith('http://') || value?.startsWith('https://'))) {
            throw new Error(`${filedName} must be a url, it should start with http/https, but got ${value}`);
        }
        try {
            new URL(value)
        } catch (err) {
            throw new Error(`${filedName} must be a url, ${err?.message}`);
        }
    }

    validNumberRange(value, filedName, min, max) {
        this.validNumber(value, filedName)
        if (min === max) {
            throw new Error(`min:${min} must not equal to max ${max}`);
        }
        if (value < min || value > max) {
            throw new Error(`${filedName} must be larger than ${min} and less than ${max}`);
        }
    }

    validObjectHasProperty(obj, objName, properTies = []) {
        if (typeof objName !== 'string') {
            throw new Error(`objName must be a string`);
        }
        if (Object.prototype.toString.call(obj) !== '[object Object]') {
            throw new Error(`${objName} must be an object`);
        }
        Object.keys(obj).forEach(key => {
            if (!properTies.includes(key)) {
                throw new Error(`${objName} has no attribute: '${key}', please check variableName`);
            }
        })
    }

    async validLocalFileIsExist(value, filedName, errMsg) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        if (!value) {
            throw new Error(`${filedName} must be a string`);
        }
        if (!await fs.pathExists(value)) {
            throw new Error(errMsg || `Not found the file：${value}`)
        }
    }

    async validPdfDecrypt(pdfPath, password) {
        await this.validLocalFileIsExist(pdfPath, 'pdfPath');
        let isEncrypted = false;
        try {
            const pdfRes = await fs.readFile(pdfPath);
            const doc = await PDFDocument.load(pdfRes, { ignoreEncryption: true });
            isEncrypted = doc.isEncrypted
        } catch {
            // 啥也不干
        }
        if (isEncrypted) {
            throw new Error('Encrypting PDF is not allowed!');
        }
    }

    async validFileTypeFromFile(value, targetFileType) {
        if (typeof targetFileType !== 'string') {
            throw new Error('targetFileType must be a string');
        }
        const fileTypeResult = await fileTypeFromFile(value);
        if (!fileTypeResult?.mime) {
            throw new Error(`invalid file, has no mime type, please check the file: ${value}`)
        }
        if (targetFileType === 'pdf') {
            if (fileTypeResult.mime !== 'application/pdf') {
                throw new Error(`invalid file type: ${fileTypeResult.mime}, please check the file: ${value}`);
            }
        }
    }

    async validFileTypeFromRequestUrl(url, headers, cookies, fileType) {
        const gotOptions = makeGot.makeOptions(url, headers, cookies);
        const response = await got.head(url, gotOptions).catch(err => {
            console.error(err, 'validFileTypeFromRequestUrl error')
        }); // 使用 HEAD 请求获取头部信息
        const mimeType = response?.headers?.['content-type'];
        if (mimeType) {
            const cancelResponse = () => {
                response?.destroy && response.destroy();
                response?.cancel && response.cancel();
            }
            if (fileType === 'pdf') {
                if (!mimeType?.includes('application/pdf')) {
                    cancelResponse();
                    throw new Error("Not matching the appropriate mimeType, the url must meet this requirement: when using the ajax head method to " +
                        `request the url, the response.headers['content-type'] returned should be 'application/pdf', but got ${mimeType}`);
                }
            } else if (fileType === 'image') {
                if (!mimeType?.includes('image/')) {
                    cancelResponse();
                    throw new Error("Not matching the appropriate mimeType, the url must meet this requirement: when using the ajax head method to " +
                        `request the url, the response.headers['content-type'] returned should includes 'image/', but got ${mimeType}`);
                }
            }
        }
    }

    async validImageFileTypeFromBuffer(valueBuffer, successCallback) {
        this.validRequired(valueBuffer, 'valueBuffer')
        const fileTypeResult = await fileTypeFromBuffer(valueBuffer);
        if (!fileTypeResult?.mime) {
            throw new Error(`invalid image file type, has no mime type, please check file`)
        }
        if (!fileTypeResult.mime.includes('image/')) {
            throw new Error(`invalid file type: ${fileTypeResult.mime}, expected image type, please check file`);
        }
        successCallback && successCallback(fileTypeResult)
    }

    validBase64(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        this.validString(value, filedName);
        const valid = Base64.isValid(value);
        if (!valid) {
            throw new Error(`${filedName} is not a valid base64 string`);
        }
    }

    validRGB(value, filedName) {
        if (typeof filedName !== 'string') {
            throw new Error('filedName must be a string');
        }
        this.validString(value, filedName);
        const isValidRGB = (str) => {
            const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
            const match = str.match(rgbRegex);
            let result
            if (match) {
                // 检查每个数字是否在0到255之间
                result = match.slice(1).every(num => num >= 0 && num <= 255);
            } else {
                result = false
            }
            if (!result) {
                throw new Error(`${filedName} is not a valid rgb string, it should like 'rgb(0,0,255)'`);
            }
        }
        isValidRGB(value)
    }

    validStringToJson(value, filedName) {
        this.validString(value, filedName);
        try {
            JSON.parse(value);
        } catch (err) {
            throw new Error(`${filedName} is not a valid JSON string`);
        }
    }

    validDayjsTime(value, filedName) {
        this.validRequired(value, filedName);
        if (!dayjs(value).isValid()) {
            throw new Error(`${filedName} is not a valid time`);
        }
    }
}

module.exports = new ParamsValid();
