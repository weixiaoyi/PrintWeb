const { app } = require("electron");
const fs = require("fs-extra")
const { chromium } = require('playwright');
const writeReadFileStream = require("@/core/base/WriteReadFileStream")
const pathToUrl = require("@/core/base/PathToUrl")
const { appStoragePath } = require("@/electronApp/helper/index")
const requiredEnv = require("@/core/base/RequiredEnv")
const TaskQueue = require("@/core/base/TaskQueue");
const record = require("@/core/base/Record")
const paramsValid = require("@/core/base/ParamsValid")
const { isEmptyValue, isNotEmptyValue, uuid } = require("@/electronApp/helper/index")
const download = require('@/core/base/Download')
const appProgress = require("@/core/base/AppProgress")
const pdfDocument = require("@/core/base/PdfDocument")
const appAuthority = require("@/core/base/AppAuthority")
const lang = require("@/electronApp/helper/lang")
const getDynamicTaskNum = require("@/electronApp/helper/geDynamicTaskNum");

class GeneratePdf {
    constructor() {
        this.launchOption = null;
        this.taskQueue = new TaskQueue({
            maxTask: getDynamicTaskNum(5)
        });
    }

    _generatePdfUrl({ fileName }) {
        return `${pathToUrl.generateOrigin()}/api/common/viewWebPrintPdfFile/${fileName}`;
    }

    _getLaunchOptions() {
        let option = null;
        if (requiredEnv.chromeExePathConfirm) {
            option = {
                executablePath: requiredEnv.chromeExePath,
            }
        } else if (requiredEnv.chromeExeChannel) {
            option = {
                channel: requiredEnv.chromeExeChannel,
            }
        } else {
            throw new Error(lang('Chrome 核心组件不存在'))
        }
        return {
            ...option,
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                // '--single-process', // 此参数edge触发报错
                // '--disable-gpu', // 此参数chrome会触发报错
                // "--disable-features=IsolateOrigins", // 此参数chrome会触发报错
                '-disable-web-security',
                "--disable-audio-output"
            ],
        }
    }

    _parsePdfOptionsParams(pdfOptions) {
        paramsValid.validObject(pdfOptions, 'pdfOptions');
        const {
            paperFormat,
            pageRanges,
            ...restOptions
        } = pdfOptions

        const {
            width,
            height,
            displayHeaderFooter,
            headerTemplate,
            footerTemplate,
            landscape,
            margin,
            preferCSSPageSize,
            printBackground,
            scale,
            outline,
            tagged,
            watermark,
            pageNumber
        } = restOptions
        const args = restOptions

        paramsValid.validObjectHasProperty(pdfOptions, 'pdfOptions', [
            "paperFormat", "width", "height", "displayHeaderFooter", "headerTemplate", "footerTemplate", "landscape",
            "margin", "pageRanges", "preferCSSPageSize", "printBackground", "scale", "outline", "tagged", "watermark",
            "pageNumber"
        ])

        if (isNotEmptyValue(pageRanges)) {
            paramsValid.validArrayObject(pageRanges, 'pageRanges');
            if (!pageRanges?.every(one => {
                return one && one.from && one.to && Number.isInteger(one.from) && Number.isInteger(one.to) && one.from > 0 && one.to > 0
            })) {
                throw new Error(`Unsupported pageRanges format, only accept the format like this:[{from:1,to:5},{from:6,to:6},{from:7,to:10}]`)
            }
            args.pageRanges = pageRanges.map(item => `${item.from}-${item.to}`).join(',')
        }

        if (isNotEmptyValue(paperFormat)) {
            // paper：A0, A1, A2, A3, A4, A5, A6, Letter, Legal, Tabloid, Ledger
            paramsValid.validArrayEnums(paperFormat, 'paperFormat', ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'])
            args.format = paperFormat
        }

        if (isNotEmptyValue(width)) {
            paramsValid.validNumberStringWithPXCMLengthUnits(width, 'width')
        }

        if (isNotEmptyValue(height)) {
            paramsValid.validNumberStringWithPXCMLengthUnits(height, 'height')
        }

        if (!width && !height && !paperFormat) {
            args.format = 'A4'
        }

        if (isNotEmptyValue(displayHeaderFooter)) {
            paramsValid.validBoolean(displayHeaderFooter, 'displayHeaderFooter')
        }

        if (isNotEmptyValue(headerTemplate)) {
            paramsValid.validString(headerTemplate, 'headerTemplate')
        }

        if (isNotEmptyValue(footerTemplate)) {
            paramsValid.validString(footerTemplate, 'footerTemplate')
        }

        if (isNotEmptyValue(margin)) {
            const properties = ['top', 'right', 'bottom', 'left']
            paramsValid.validObjectHasProperty(margin, 'margin', properties)
            properties.forEach(property => {
                if (isNotEmptyValue(margin[property])) {
                    paramsValid.validNumberStringWithPXCMLengthUnits(margin[property], `margin.${property}`);
                }
            })
        }

        if (isNotEmptyValue(landscape)) {
            paramsValid.validBoolean(landscape, 'landscape')
        }

        if (isNotEmptyValue(preferCSSPageSize)) {
            paramsValid.validBoolean(preferCSSPageSize, 'preferCSSPageSize')
        }

        if (isNotEmptyValue(printBackground)) {
            paramsValid.validBoolean(printBackground, 'printBackground')
        }

        if (isNotEmptyValue(scale)) {
            paramsValid.validNumberRange(scale, 'scale', 0.1, 2)
        }

        if (isNotEmptyValue(outline)) {
            paramsValid.validBoolean(outline, 'outline')
        }

        if (isNotEmptyValue(tagged)) {
            paramsValid.validBoolean(tagged, 'tagged')
        }

        if (isNotEmptyValue(watermark)) {
            pdfDocument.validWatermarkParams(watermark, 'watermark');
        }

        if (isNotEmptyValue(pageNumber)) {
            pdfDocument.validPageNumberParams(pageNumber, 'pageNumber');
        }

        return args
    }

    _parseExtraOptions(extraOptions) {
        paramsValid.validObject(extraOptions, 'extraOptions');
        const {
            devtool,
            requestTimeout,
            cookies,
            localStorages,
            sessionStorages,
            httpHeaders,
            action = 'print'
        } = extraOptions
        devtool && paramsValid.validBoolean(devtool, 'devtool');
        if (isNotEmptyValue(requestTimeout)) {
            paramsValid.validNumber(requestTimeout, 'extraOptions.requestTimeout');
            paramsValid.validNumberRange(requestTimeout, 'extraOptions.requestTimeout', 0, 60 * 60)
        }
        if (isNotEmptyValue(cookies)) {
            paramsValid.validObject(cookies, 'extraOptions.cookies');
            for (let [key, value] of Object.entries(cookies)) {
                paramsValid.validString(value, `extraOptions.cookies[${key}]`);
            }
        }
        if (isNotEmptyValue(localStorages)) {
            paramsValid.validObject(localStorages, 'extraOptions.localStorages');
            for (let [key, value] of Object.entries(localStorages)) {
                paramsValid.validString(value, `extraOptions.localStorages[${key}]`);
            }
        }
        if (isNotEmptyValue(httpHeaders)) {
            paramsValid.validObject(httpHeaders, 'extraOptions.httpHeaders');
            for (let [key, value] of Object.entries(httpHeaders)) {
                paramsValid.validString(value, `extraOptions.httpHeaders[${key}]`);
            }
        }
        if (isNotEmptyValue(sessionStorages)) {
            paramsValid.validObject(sessionStorages, 'extraOptions.sessionStorages');
            for (let [key, value] of Object.entries(sessionStorages)) {
                paramsValid.validString(value, `extraOptions.sessionStorages[${key}]`);
            }
        }

        if (isNotEmptyValue(action)) {
            paramsValid.validArrayEnums(action, 'extraOptions.action', ['print', 'preview']);
        }
        return extraOptions;
    }

    async _generatePdfByChrome(url, args = {}, extraOptions = {}) {
        const taskId = uuid();
        let browser;
        let browserContext;
        let page;
        try {
            if (!this.launchOption) {
                this.launchOption = this._getLaunchOptions()
            }
            let launchOptionNew = { ...this.launchOption }
            if (extraOptions.devtool) {
                launchOptionNew.headless = false;
                launchOptionNew.devtools = true;
            }
            try {
                appProgress.updateGeneratePdfTask(taskId);
            } catch (err) {
                console.error(`记录pdf生成进度报错：${err?.message}`);
            }
            const isValidUrlHttp = url.includes('http')
            browser = await chromium.launch(launchOptionNew).catch(err => {
                console.error(err);
                app._win.webContents.send("AutoSelectBrowserEngine");
                throw new Error(lang('Chromium核心启动失败，请下载使用标准引擎'));
            });
            const _defaultLocalStorageObj = {
                _printMode_: 'true'
            }
            browserContext = await browser.newContext(isValidUrlHttp ? {
                storageState: {
                    origins: [
                        {
                            origin: (new URL(url)).origin,
                            localStorage: Object.entries({ ...(extraOptions.localStorages || {}), ..._defaultLocalStorageObj })
                                .map(([key, value]) => ({
                                    name: key,
                                    value
                                })),
                        }
                    ]
                }
            } : {});
            if (extraOptions.sessionStorages && isValidUrlHttp) {
                await browserContext.addInitScript(({ storage, hostname }) => {
                    if (window.location.hostname === hostname) {
                        for (const [key, value] of Object.entries(storage)) {
                            window.sessionStorage.setItem(key, value);
                        }
                    }
                }, {
                    storage: extraOptions.sessionStorages,
                    hostname: (new URL(url)).hostname
                });
            }
            if (extraOptions.cookies && isValidUrlHttp) {
                await browserContext.addCookies(Object.entries(extraOptions.cookies)
                    .map(([key, value]) => {
                        return {
                            domain: (new URL(url)).hostname,
                            path: '/',
                            name: key,
                            value
                        }
                    }));
            }
            if (extraOptions.httpHeaders) {
                await browserContext.setExtraHTTPHeaders(extraOptions.httpHeaders);
            }
            page = await browserContext.newPage();
            const checkCloseError = (err, errMsg) => {
                if (err?.message?.includes('context or browser has been closed')) {
                    throw new Error(errMsg + '，please try to switch PDF engine（请尝试切换 PDF 引擎）')
                } else {
                    throw new Error(errMsg)
                }
            }
            await page.goto(url, {
                timeout: isEmptyValue(extraOptions.requestTimeout) ? 15 * 1000 : extraOptions.requestTimeout * 1000,
                waitUntil: 'networkidle'
            }).catch(err => {
                console.error(`catch a pageGoto error: ${err?.message}`);
                const newErrMsg = err?.message?.replace("page.goto:", '')
                    .replace(', waiting until "networkidle"', '')
                    .replaceAll('', '')
                    .replaceAll('[', '');
                checkCloseError(err, newErrMsg);
            });

            const res = await writeReadFileStream.getUidFile(appStoragePath.getWebPrintPdfsFolder(), '.pdf');
            const { dir, fileName, filePath } = res
            await fs.ensureDir(dir)
            await page.pdf({
                ...(args || {}),
                path: filePath
            }).catch(err => {
                const newErrMsg = err?.message?.replace("page.pdf:", '');
                checkCloseError(err, newErrMsg);
            });
            const pdfUrl = this._generatePdfUrl({ fileName });
            const result = {
                pdfUrl,
                pdfPath: filePath,
                pdfFileName: fileName,
            }
            if (extraOptions.devtool) {
                return result
            }
            await page.close();
            await browserContext.close();
            await browser.close();
            appProgress.clearGeneratePdfTask(taskId);//稳妥起见，这里加一行
            return result
        } catch (err) {
            appProgress.clearGeneratePdfTask(taskId);//稳妥起见，这里加一行
            page && await page.close();
            browser && await browser.close();
            return Promise.reject(err);
        } finally {
            appProgress.clearGeneratePdfTask(taskId);
        }
    }

    async _generatePdfByHttp(url, args = {}, extraOptions = {}) {
        const res = writeReadFileStream.getUidFile(appStoragePath.getWebPrintPdfsFolder(), '.pdf');
        const { dir, fileName, filePath } = res
        await fs.ensureDir(dir);
        await download.downStreamFile(url, filePath, {
            cookies: extraOptions.cookies,
            headers: extraOptions.httpHeaders,
            fileType: 'pdf',
            timeout: extraOptions.requestTimeout,
        });
        const pdfUrl = this._generatePdfUrl({ fileName });
        return {
            pdfUrl,
            pdfPath: filePath,
            pdfFileName: fileName,
        }
    }

    async _generatePdf(url, args = {}, extraOptions = {}, options = {}) {
        const { isDownloadAction } = options
        // 这里延迟，让appProgress统计任务数量更准确
        await new Promise((resolve) => {
            setTimeout(resolve, 50)
        })
        if (isDownloadAction) {
            return this._generatePdfByHttp(url, args, extraOptions);
        } else {
            return this._generatePdfByChrome(url, args, extraOptions);
        }
    }

    getAnalysisData() {
        return {
            tasksLength: this.taskQueue.tasks.length,
            executeTasksLength: this.taskQueue.executeTasks.length,
            historyTaskLength: this.taskQueue.histoyTasks.length,
        }
    }

    resetAnalysisData() {
        this.taskQueue.resetTasks();
    }

    async _generatePdfTransTask(pdfPath, pdfOptions) {
        paramsValid.validString(pdfPath, 'pdfPath');
        if (isNotEmptyValue(pdfOptions.watermark)) {
            await pdfDocument.watermark(pdfPath, pdfOptions.watermark);
        }
        if (isNotEmptyValue(pdfOptions.pageNumber)) {
            await pdfDocument.drawPageNumber(pdfPath, pdfOptions.pageNumber);
        }
        if (appAuthority.isRequiredAuthorityAndFinishedFree()) {
            await pdfDocument.watermark(pdfPath, {
                text: lang('未授权'),
                size: 40,
                opacity: 0.2,
                angle: 30
            })
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
                    return this._generatePdf(...args).then(resolve).catch(reject)
                }
            })
        })
    }

    async generatePdfByLocalHtml(url, pdfOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        let queueTimeSpent = 0;
        const recordInfo = {};
        try {
            await paramsValid.validLocalFileIsExist(url, 'url');
            const pdfArgs = this._parsePdfOptionsParams(pdfOptions);
            const parsedExtraOptions = this._parseExtraOptions(extraOptions);
            const res = await this._executePromiseTaskQueue(queueTime => {
                queueTimeSpent = queueTime;
            }, url, pdfArgs, parsedExtraOptions);
            Object.assign(recordInfo, res);
            await this._generatePdfTransTask(res.pdfPath, pdfOptions);
            recordInfo.success = true;
            return res
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writePdfRecord({
                ...recordInfo,
                pdfOptions,
                extraOptions,
                moreOptions: {
                    url
                },
                spentTime: Date.now() - startTime - queueTimeSpent,
            });
        }
    }

    async generatePdfByRemoteHtmlUrl(url, pdfOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        let queueTimeSpent = 0;
        const recordInfo = {};
        try {
            await paramsValid.validHttpUrl(url, 'url');
            const pdfArgs = this._parsePdfOptionsParams(pdfOptions);
            const parsedExtraOptions = this._parseExtraOptions(extraOptions);
            const res = await this._executePromiseTaskQueue(queueTime => {
                queueTimeSpent = queueTime;
            }, url, pdfArgs, parsedExtraOptions);
            Object.assign(recordInfo, res);
            await this._generatePdfTransTask(res.pdfPath, pdfOptions);
            recordInfo.success = true;
            return res
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writePdfRecord({
                ...recordInfo,
                pdfOptions,
                extraOptions,
                moreOptions: {
                    url
                },
                spentTime: Date.now() - startTime - queueTimeSpent,
            });
        }
    }

    async generatePdfByRemotePdfUrl(url, pdfOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        let queueTimeSpent = 0;
        const recordInfo = {};
        try {
            await paramsValid.validHttpUrl(url, 'url');
            const pdfArgs = this._parsePdfOptionsParams(pdfOptions);
            const parsedExtraOptions = this._parseExtraOptions(extraOptions);
            const res = await this._executePromiseTaskQueue(queueTime => {
                queueTimeSpent = queueTime;
            }, url, pdfArgs, parsedExtraOptions, {
                isDownloadAction: true
            });
            Object.assign(recordInfo, res);
            await this._generatePdfTransTask(res.pdfPath, pdfOptions);
            recordInfo.success = true;
            return res
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writePdfRecord({
                ...recordInfo,
                pdfOptions,
                extraOptions,
                moreOptions: {
                    url
                },
                spentTime: Date.now() - startTime - queueTimeSpent,
            });
        }
    }

    async generatePdfByBase64(base64, pdfOptions = {}, extraOptions = {}) {
        const startTime = Date.now();
        const recordInfo = {};
        let url;
        try {
            paramsValid.validString(base64, 'base64');
            if (base64.startsWith('data:application/pdf;base64,')) {
                base64 = base64.replace('data:application/pdf;base64,', '');
            }
            paramsValid.validBase64(base64, 'base64');
            this._parsePdfOptionsParams(pdfOptions);
            this._parseExtraOptions(extraOptions);
            const resTemp = writeReadFileStream.getUidFile(appStoragePath.getWebPrintPdfsFolder(), '.pdf');
            const { dir, fileName, filePath } = resTemp
            await fs.ensureDir(dir);
            await fs.writeFile(filePath, Buffer.from(base64, 'base64'));
            await paramsValid.validLocalFileIsExist(filePath, 'filePath');
            url = this._generatePdfUrl({ fileName });
            const res = {
                pdfUrl: url,
                pdfPath: filePath,
                pdfFileName: fileName,
            }
            Object.assign(recordInfo, res);
            await paramsValid.validFileTypeFromFile(filePath, 'pdf').catch((err) => {
                throw new Error(err?.message + ', and you need to check the base64 string!');
            });
            await this._generatePdfTransTask(res.pdfPath, pdfOptions);
            recordInfo.success = true;
            return res
        } catch (err) {
            recordInfo.success = false;
            recordInfo.msg = err?.message || err || '未知错误';
            return Promise.reject(err)
        } finally {
            record.writePdfRecord({
                ...recordInfo,
                pdfOptions,
                extraOptions,
                moreOptions: {
                    url
                },
                spentTime: Date.now() - startTime,
            });
        }
    }

    globalCheckPdfOptions(pdfOptions) {
        this._parsePdfOptionsParams(pdfOptions);
    }

    globalCheckExtraOptions(extraOptions) {
        this._parseExtraOptions(extraOptions);
    }

}

module.exports = new GeneratePdf()
