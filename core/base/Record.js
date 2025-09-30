const path = require("path");
const fs = require("fs-extra");
const dayjs = require("dayjs");
const winston = require('winston');
require('winston-daily-rotate-file');
const {appStoragePath} = require("@/electronApp/helper/index")
const writeReadFileStream = require("@/core/base/WriteReadFileStream")

class Record {
    constructor() {
        this._init();
    }

    _init() {
        this._checkFileExpireTimestamp = Date.now();
        this._fileExpireDay = 1; //文件过期时间设为1天
        this.container = new winston.Container();
        this._addLogger('htmlLogs', {}, appStoragePath.getWebPrintRecordsHtmlsFolder())
        this._addLogger('pdfLogs', {}, appStoragePath.getWebPrintRecordsPdfsFolder())
        this._addLogger('printLogs', {}, appStoragePath.getWebPrintRecordsPrintsFolder())
        this._scheduleTask()
    }

    _addLogger(name, options = {}, dirname) {
        this.container.add(name, {
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.DailyRotateFile({
                    dirname,
                    filename: 'index-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: `${this._fileExpireDay}d`,
                    ...options,
                    json: true,
                })
            ]
        });
    }

    _writeObjectInfo(logger, objectInfo) {
        if (Object.prototype.toString.call(objectInfo) === '[object Object]') {
            try {
                logger && logger.info(objectInfo)
            } catch (err) {
                console.error(err)
            }
        }
        const diff = dayjs(Date.now()).diff(dayjs(this._checkFileExpireTimestamp), 'day', true)
        if (diff > this._fileExpireDay) {
            console.log('过期了，重新设定过期时间')
            this._checkFileExpireTimestamp = Date.now();
            this._scheduleTask();
        }
    }

    async _queryRecord(logger, queries = {}) {
        return new Promise((resolve, reject) => {
            try {
                return logger.query({
                    from: queries.startTime,
                    until: queries.endTime,
                    limit: queries.limit || 50,
                    start: queries.start || 0,
                    order: 'desc',
                }, function (err, results) {
                    if (!err) {
                        resolve(results?.dailyRotateFile || []);
                    } else {
                        reject(err);
                    }
                });
            } catch (err) {
                if (err?.message?.includes('no such file or directory')) {
                    this._init();
                    resolve([])
                } else {
                    return reject(err);
                }
            }
        })
    }

    async writeHtmlRecord(objectInfo) {
        const htmlLogs = this.container.get('htmlLogs');
        this._writeObjectInfo(htmlLogs, objectInfo);
    }

    async writePdfRecord(objectInfo) {
        const pdfLogs = this.container.get('pdfLogs');
        this._writeObjectInfo(pdfLogs, objectInfo);
    }

    async writePrintRecord(objectInfo) {
        const printLogs = this.container.get('printLogs');
        this._writeObjectInfo(printLogs, objectInfo);
    }

    async queryHtmlRecord(queries) {
        const htmlLogs = this.container.get('htmlLogs');
        return await this._queryRecord(htmlLogs, queries);
    }

    async queryPdfRecord(queries) {
        const pdfLogs = this.container.get('pdfLogs');
        return await this._queryRecord(pdfLogs, queries);
    }

    async queryPrintRecord(queries) {
        const printLogs = this.container.get('printLogs');
        return await this._queryRecord(printLogs, queries);
    }

    async clearHtmlRecord() {
        try {
            await fs.remove(appStoragePath.getWebPrintRecordsHtmlsFolder())
            await fs.remove(appStoragePath.getWebPrintHtmlsFolder())
        } catch (err) {
            console.error(err)
        } finally {
            this._init()
        }
    }

    async clearPdfRecord() {
        try {
            await fs.remove(appStoragePath.getWebPrintRecordsPdfsFolder())
            await fs.remove(appStoragePath.getWebPrintPdfsFolder())
        } catch (err) {
            console.error(err)
        } finally {
            this._init()
        }
    }

    async clearPrintRecord() {
        try {
            await fs.remove(appStoragePath.getWebPrintRecordsPrintsFolder())
        } catch (err) {
            console.error(err)
        } finally {
            this._init()
        }
    }

    getExpireDay() {
        return this._fileExpireDay
    }

    async _scheduleTask() {
        try {
            const readDirFilesThenFilterExpireFiles = (dir) => writeReadFileStream.readDirFilesThenFilterExpireFilesByHMS(dir, 'day', this._fileExpireDay)
            const readElectronLogDirFilesThenFilterExpireFiles = (dir) => writeReadFileStream.readDirFilesThenFilterExpireFilesByYMD(dir, 'day', 3)

            const htmls = await readDirFilesThenFilterExpireFiles(appStoragePath.getWebPrintHtmlsFolder())
            const pdfs = await readDirFilesThenFilterExpireFiles(appStoragePath.getWebPrintPdfsFolder())
            const electronLogs = await readElectronLogDirFilesThenFilterExpireFiles(appStoragePath.getWebPrintRecordsElectronLogFolder())

            htmls.forEach(item => {
                fs.remove(item.filePath);
            })
            pdfs.forEach(item => {
                fs.remove(item.filePath);
            })
            electronLogs.forEach(item => {
                fs.remove(item.filePath);
            })
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = new Record();

