const fs = require("fs-extra");
const path = require("path");
const {app} = require('electron');
const TaskQueue = require("@/core/base/TaskQueue")
const noticeWarn = require("@/core/base/NoticeWarn")
const requiredEnv = require("@/core/base/RequiredEnv");
const record = require("@/core/base/Record")
const pathToUrl = require("@/core/base/PathToUrl");
const paramsValid = require("@/core/base/ParamsValid")
const ChildProcessPromise = require("@/core/base/ChildProcessPromise");
const {isNotEmptyValue} = require("@/electronApp/helper/index");
const lang = require("@/electronApp/helper/lang");
const getDynamicTaskNum = require("@/electronApp/helper/geDynamicTaskNum");

class Printer {
    // https://github.com/artiebits/pdf-to-printer/blob/master/src/print/print.ts
    constructor() {
        this.spawnProcessInstance = new ChildProcessPromise();
        this.taskQueue = new TaskQueue({
            maxTask: getDynamicTaskNum(5)
        });
        this.PDFExePath = requiredEnv.PDFExePath;
        this.PDFExePathIsExist = null;
    }

    _generatePdfUrl({fileName}) {
        return `${pathToUrl.generateOrigin()}/api/common/viewWebPrintPdfFile/${fileName}`;
    }

    _generatePrintPdfPreviewUrl({printArgs}) {
        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
            return `http://localhost:8080/#/viewPrintPreview?printParams=${printArgs}&_port=${app.port}`
        } else {
            return `${pathToUrl.generateOrigin()}/#/viewPrintPreview?printParams=${printArgs}&_port=${app.port}`;
        }
    }

    _parseParams(pdfPath, printOptions = {}) {
        paramsValid.validObject(printOptions, 'printOptions');
        const {printerName, ...printSettings} = printOptions
        const args = []
        if (printerName) {
            paramsValid.validString(printerName, 'printerName')
            args.push("-print-to", printerName)
        } else {
            args.push("-print-to-default")
        }
        args.push("-silent")

        const printSettingsArgs = []
        const {
            pageRanges,
            paperFormat = 'A4',
            colorful = false, //是否彩色
            landscape = false, //是否横向
            subset,
            scaleMode,
            duplexMode,
            copies,
            bin, // <num or name> : 选择要打印到的纸盘
        } = printSettings

        paramsValid.validObjectHasProperty(printOptions, 'printOptions', [
            'printerName', 'pageRanges', 'paperFormat', 'colorful', 'landscape', 'subset', 'scaleMode',
            'duplexMode', 'copies', 'bin'
        ])

        if (isNotEmptyValue(pageRanges)) {
            paramsValid.validArrayObject(pageRanges, 'pageRanges');
            if (!pageRanges?.every(one => {
                return one && one.from && one.to && Number.isInteger(one.from) && Number.isInteger(one.to) && one.from > 0 && one.to > 0
            })) {
                throw new Error(`Unsupported pageRanges format, only accept the format like this:[{from:1,to:5},{from:6,to:6},{from:7,to:10}]`)
            }
            printSettingsArgs.push(pageRanges.map(item => `${item.from}-${item.to}`).join(','))
        }

        if (isNotEmptyValue(paperFormat)) {
            // paper：A2, A3, A4, A5, A6, letter, legal, tabloid, statement
            paramsValid.validString(paperFormat, 'paperFormat');
            let paper = paperFormat;
            // paramsValid.validArrayEnums(paperFormat, 'paperFormat', ['A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Statement'])
            // or a name selectable from your printer settings
            if (['Letter', 'Legal', 'Tabloid', 'Statement'].includes(paperFormat)) {
                paper = paperFormat.toLowerCase()
            }
            printSettingsArgs.push(`paper=${paper}`);
        }

        if (isNotEmptyValue(subset)) {
            //基偶页
            paramsValid.validArrayEnums(subset, 'subset', ['odd', 'even'])
            printSettingsArgs.push(subset);
        }

        if (isNotEmptyValue(landscape)) {
            paramsValid.validBoolean(landscape, 'landscape');
            if (landscape) {
                // 横向
                printSettingsArgs.push('landscape')
            } else {
                //纵向
                printSettingsArgs.push('portrait')
            }
        }

        if (isNotEmptyValue(scaleMode)) {
            //缩放模式
            // noscale:使用原始大小 | shrink 将页面缩小至可打印区域（如果需要）,缩小到合适大小 | fit 调整页面至可打印区域,合适大小
            paramsValid.validArrayEnums(scaleMode, 'scaleMode', ['noscale', 'shrink', 'fit'])
            printSettingsArgs.push(scaleMode)
        }

        if (isNotEmptyValue(duplexMode)) {
            // 单双面模式
            // “simplex”（单面打印,默认），"duplex"（双面）,“duplexshort”（沿短边双面打印），“duplexlong”（沿长边双面打印）
            paramsValid.validArrayEnums(duplexMode, 'duplexMode', ['simplex', 'duplex', 'duplexshort', 'duplexlong'])
            printSettingsArgs.push(duplexMode)
        }

        if (isNotEmptyValue(copies)) {
            // 打印份数
            paramsValid.validInterNumber(copies, 'copies')
            printSettingsArgs.push(`${copies}x`);
        }

        if (isNotEmptyValue(colorful)) {
            paramsValid.validBoolean(colorful, 'colorful')
            if (colorful) {
                // 是否彩色
                printSettingsArgs.push("color");
            } else {
                printSettingsArgs.push("monochrome");
            }
        }

        if (isNotEmptyValue(bin)) {
            paramsValid.validNumberOrString(bin, 'bin');
            printSettingsArgs.push(`bin=${bin}`);
        }

        if (printSettingsArgs.length) {
            args.push("-print-settings", printSettingsArgs.join(","));
        }

        args.push(pdfPath)
        return args
    }

    async _startSpawnProcess(args) {
        if (!this.PDFExePathIsExist) {
            const isExist = await fs.pathExists(this.PDFExePath)
            if (!isExist) {
                noticeWarn.notification(lang("环境异常"), lang("打印核心组件不存在，请联系技术协助解决"));
                throw new Error("Environmental abnormality: Printing core component is not found. Please contact the technical team for assistance!");
            }
            this.PDFExePathIsExist = true
        }
        await new Promise(resolve => setTimeout(resolve, 50)); // 这里延迟，让 appProgress 统计任务数量更准确
        return await this.spawnProcessInstance.spawnExeProcess(this.PDFExePath, args, '打印组件')
    }

    getAnalysisData() {
        return {
            spawnProcessStartNum: this.spawnProcessInstance.processStartNum,
            spawnProcessAutoCloseNum: this.spawnProcessInstance.processAutoCloseNum,
            spawnProcessForceCloseNum: this.spawnProcessInstance.processForceCloseNum,
            tasksLength: this.taskQueue.tasks.length,
            executeTasksLength: this.taskQueue.executeTasks.length,
            historyTaskLength: this.taskQueue.histoyTasks.length,
        }
    }

    resetAnalysisData() {
        this.taskQueue.resetTasks();
        this.spawnProcessInstance.resetNum();
    }

    async _checkPrintParams(pdfPath, printOptions = {}, extraOptions) {
        paramsValid.validObject(printOptions, 'printOptions');
        paramsValid.validObject(extraOptions, 'extraOptions');
        await paramsValid.validLocalFileIsExist(pdfPath, 'pdfPath');
        await paramsValid.validFileTypeFromFile(pdfPath, 'pdf');
        const extName = path.extname(pdfPath);
        if (extName !== '.pdf') {
            throw new Error(`fileType must be pdf extension`)
        }
    }

    async _executePromiseTaskQueue(queueTimeCallback, ...args) {
        return new Promise((resolve, reject) => {
            const queueStartTime = Date.now();
            this.taskQueue.addTask({
                executeFun: () => {
                    const queueEndTime = Date.now();
                    if (queueTimeCallback) {
                        paramsValid.validFunction(queueTimeCallback, 'queueTimeCallback');
                        queueTimeCallback(queueEndTime - queueStartTime);
                    }
                    return this._startSpawnProcess(...args).then(resolve).catch(reject)
                }
            })
        })
    }

    async _printPreview(pdfPath, printOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        try {
            await this._checkPrintParams(pdfPath, printOptions, extraOptions)
            const args = this._parseParams(pdfPath, printOptions)
            const pdfFileName = path.basename(pdfPath)
            const pdfUrl = this._generatePdfUrl({fileName: pdfFileName});
            const results = {
                pdfPath,
                pdfUrl,
                pdfFileName,
                printPreviewUrl: this._generatePrintPdfPreviewUrl({
                    printArgs: encodeURIComponent(JSON.stringify([{
                        pdfFileName,
                        printOptions,
                    }])),
                })
            }
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.pdfPath = pdfPath;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            if (recordInfo.success === false) {
                record.writePrintRecord({
                    ...recordInfo,
                    printOptions,
                    extraOptions,
                    spentTime: Date.now() - startTime,
                })
            }
        }
    }

    async _print(pdfPath, printOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        let queueTimeSpent = 0;
        const recordInfo = {};
        try {
            await this._checkPrintParams(pdfPath, printOptions, extraOptions)
            const args = this._parseParams(pdfPath, printOptions)
            const pdfFileName = path.basename(pdfPath)
            const pdfUrl = this._generatePdfUrl({fileName: pdfFileName});
            const results = {
                pdfPath,
                pdfUrl,
                pdfFileName,
            }
            Object.assign(recordInfo, results);
            await this._executePromiseTaskQueue(queueTime => {
                queueTimeSpent = queueTime;
            }, args);
            recordInfo.success = true
            return results
        } catch (err) {
            recordInfo.success = false;
            recordInfo.pdfPath = pdfPath;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writePrintRecord({
                ...recordInfo,
                printOptions,
                extraOptions,
                spentTime: Date.now() - startTime - queueTimeSpent,
            })
        }
    }

    async print(pdfPath, printOptions = {}, extraOptions = {}) {
        if (extraOptions.action === 'preview') {
            return this._printPreview(pdfPath, printOptions, extraOptions)
        } else {
            return this._print(pdfPath, printOptions, extraOptions)
        }
    }

    globalCheckPrintOptions(printOptions) {
        this._parseParams('/', printOptions)
    }
}

const printer = new Printer();
module.exports = printer


