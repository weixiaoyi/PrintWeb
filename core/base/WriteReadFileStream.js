const fs = require('fs-extra');
const {uuid} = require("../../electronApp/helper/index")
const path = require("path");
const dayjs = require("dayjs");
const paramsValid = require("@/core/base/ParamsValid")

class WriteReadFileStream {
    writeUidFile(parentDirPath, extension) {
        paramsValid.validString(extension, 'WriteReadFileStream.ExpireFile extension')
        return async (content = '') => {
            const timestamp = Date.now();
            const destFileName = `${dayjs(timestamp).format('YYYYMMDD_HHmmss')}_${uuid()}${extension}`;
            const destDir = parentDirPath
            const _dest = path.join(destDir, destFileName);
            await fs.ensureDir(destDir);
            await fs.writeFile(_dest, content);
            return {
                dir: destDir,
                fileName: destFileName,
                filePath: _dest,
            }
        }
    }

    getUidFile(parentDirPath, extension) {
        paramsValid.validString(extension, 'WriteReadFileStream.getUidFile extension')
        const timestamp = Date.now();
        const destFileName = `${dayjs(timestamp).format('YYYYMMDD_HHmmss')}_${uuid()}${extension}`;
        const destDir = parentDirPath
        const _dest = path.join(destDir, destFileName);
        return {
            dir: destDir,
            fileName: destFileName,
            filePath: _dest,
        }
    }

    getUidFileOnlyExtension(extension) {
        paramsValid.validString(extension, 'WriteReadFileStream.getUidFileOnlyExtension extension')
        const timestamp = Date.now();
        const destFileName = `${dayjs(timestamp).format('YYYYMMDD_HHmmss')}_${uuid()}${extension}`;
        return {
            fileName: destFileName,
        }
    }

    async readDirFilesThenFilterExpireFilesByHMS(dir, expireUnit, expireAmount) {
        paramsValid.validString(dir, 'dir');
        paramsValid.validString(expireUnit, 'expireUnit');
        paramsValid.validNumber(expireAmount, 'expireAmount')
        await fs.ensureDir(dir)
        const res = await fs.readdir(dir);
        const files = res.filter((fileName) => {
            return /^\d{8}_\d{6}_.*/.test(fileName)
        });
        return files.filter((fileName) => {
            const [YYYYMMDD, HH, mm, ss] = [fileName.slice(0, 8), fileName.slice(9, 11), fileName.slice(11, 13), fileName.slice(13, 15)];
            const diff = dayjs(Date.now()).diff(dayjs(`${YYYYMMDD} ${HH}:${mm}:${ss}`), expireUnit, true)
            return diff > expireAmount
        }).map(item => ({
            fileName: item,
            filePath: path.join(dir, item),
        }))
    }

    async readDirFilesThenFilterExpireFilesByYMD(dir, expireUnit, expireAmount) {
        paramsValid.validString(dir, 'dir');
        paramsValid.validString(expireUnit, 'expireUnit');
        paramsValid.validNumber(expireAmount, 'expireAmount')
        await fs.ensureDir(dir)
        const res = await fs.readdir(dir);
        const files = res.filter((fileName) => {
            return /^\d{8}.*/.test(fileName)
        });
        return files.filter((fileName) => {
            const [YYYYMMDD] = [fileName.slice(0, 8)];
            const diff = dayjs(Date.now()).diff(dayjs(`${YYYYMMDD}`), expireUnit, true)
            return diff > expireAmount
        }).map(item => ({
            fileName: item,
            filePath: path.join(dir, item),
        }))
    }
}

module.exports = new WriteReadFileStream;
