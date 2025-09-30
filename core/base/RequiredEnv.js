const fs = require("fs-extra");
const path = require("path");
const { chromium } = require('playwright');
const { app } = require("electron");
const { appStoragePath } = require("@/electronApp/helper")
const PlatformType = require('./PlatformType')
const webPrinterJson = require("@/webPrinter.json")
const download = require('./Download')
const noticeWarn = require("./NoticeWarn")
const unzipper = require("unzipper");
const paramsValid = require("@/core/base/ParamsValid")
const lang = require("@/electronApp//helper/lang")

class RequiredEnv {
    constructor() {
        this.arch = PlatformType.arch()
        this.PDFExePath = appStoragePath.getAppAsarUnpackByFile({
            x64: 'printPDF64.exe',
            arm64: 'printPDFArm64.exe',
            ia32: 'printPDF32.exe'
        }[this.arch]);

        this.chromeExePath = path.join(appStoragePath.getAppRequiredFolder(), 'chrome-win', {
            x64: 'headless_shell.exe',
            arm64: 'headless_shell.exe',
            ia32: 'headless_shell.exe'
        }[this.arch]);

        this.chromeExeChannel = null;
        this.chromeExePathConfirm = false;
        this.isDownloadingPrintPdfExe = false;
        this.isDownloadingChromeExe = false;
        this.isDownloadingPrintPdfExeTries = 0;
        this.isDownloadingChromeExeTries = 0;
        this.isDownloadingPrintPdfExeInterval = null;
        this.isDownloadingChromeExeInterval = null;

        this.typeEnumes = {
            chrome: {
                type: 'chromeExe',
                desc: 'Chrome浏览器组件' // lang在这里不能即时更新
            },
            pdfExe: {
                type: 'pdfExe',
                desc: '打印组件' // lang在这里不能即时更新
            }
        }
    }

    //--------------------------------- 下载 sumatra pdf ----------------------------

    async _checkPrintPdf64exe() {
        const isExist = await fs.pathExists(this.PDFExePath)
        if (!isExist) {
            app._win.webContents.send('getRequiredEnvDownloading');
            if (!this.isDownloadingPrintPdfExe) {
                if (this.isDownloadingPrintPdfExeTries < 3) {
                    this._downloadPrintPdf64exe(this.PDFExePath)
                } else {
                    app._win.webContents.send('global/warning', lang('核心组件无法下载，请联系技术解决'))
                }
            }
            this.isDownloadingPrintPdfExeInterval = setTimeout(() => this._checkPrintPdf64exe(), 6000)
        } else {
            app._win.webContents.send('getRequiredEnvDownloadingSuccess', this.typeEnumes.pdfExe);
        }
    }

    async _downloadPrintPdf64exe(destExe) {
        this.isDownloadingPrintPdfExe = true;
        this.isDownloadingPrintPdfExeTries += 1;
        const downloadTarget = destExe.replace('.exe', '.zip');
        const urls = webPrinterJson.requiredFilesUrl.printPdfExe.windows[this.arch];
        await download.downStreamFileFromOneByUrlList(urls, downloadTarget, {
            sizeRange: [7000000, 10000000],
            onProgress: (progress, url) => {
                if (progress?.total > 0) {
                    app._win.webContents.send('getRequiredEnvDownloadingProgress', {
                        ...this.typeEnumes.pdfExe,
                        url,
                        progress
                    });
                }
            },
            onFinished: async () => {
                const directory = await unzipper.Open.file(downloadTarget);
                await new Promise((resolve, reject) => {
                    directory.files[0]
                        .stream()
                        .pipe(fs.createWriteStream(destExe))
                        .on('error', reject)
                        .on('finish', resolve)
                });
                await paramsValid.validLocalFileIsExist(destExe, 'destExe', `Not found the downloaded printExe file：${destExe}`)
                this.isDownloadingPrintPdfExe = false;
                this.isDownloadingPrintPdfExeTries = 0;
            },
            onError: async (err, url, errIndex) => {
                console.log(err)
                if (errIndex === urls.length - 1) {
                    this.isDownloadingPrintPdfExe = false;
                    noticeWarn.notification(lang('下载打印核心组件出错'), err?.message)
                }
            }
        })
    }

    //--------------------------------------------下载chrome----------------------------------------------------
    async _checkChrome() {
        const isExist = await fs.pathExists(this.chromeExePath)
        if (!isExist) {
            const channels = ["chrome", "msedge", "chrome-beta", "msedge-beta"]
            const res = await Promise.all(channels.map(async channel => {
                try {
                    const browser = await chromium.launch({
                        channel: channel,
                        headless: true,
                    })

                    const info = {
                        channel,
                        browserType: browser.browserType().name(),
                        version: browser.version(),
                        isConnected: browser.isConnected(),
                    }
                    browser.close();
                    return info
                } catch (err) {
                    return false
                }
            }))
            const findOne = res.find(one => one.isConnected)
            if (findOne) {
                this.chromeExeChannel = findOne.channel
            } else {
                app._win.webContents.send('getRequiredEnvDownloading');
                if (!this.isDownloadingChromeExe) {
                    if (this.isDownloadingChromeExeTries < 3) {
                        this._downloadChrome64exe(this.chromeExePath);
                    } else {
                        app._win.webContents.send('global/warning', lang('核心组件无法下载，请联系技术解决'))
                    }
                }
                this.isDownloadingChromeExeInterval = setTimeout(() => this._checkChrome(), 6000)
            }
        } else {
            this.chromeExePathConfirm = true
            app._win.webContents.send('getRequiredEnvDownloadingSuccess', this.typeEnumes.chrome);
        }
    }

    async _downloadChrome64exe(destExe) {
        this.isDownloadingChromeExe = true;
        this.isDownloadingChromeExeTries += 1;
        const downloadTarget = path.join(
            ...(destExe.split(path.sep).filter(item => {
                return !['chrome-win'].includes(item)
            }))
        ).replace('.exe', '.zip');
        const urls = webPrinterJson.requiredFilesUrl.chromeExe.windows[this.arch];
        await download.downStreamFileFromOneByUrlList(urls, downloadTarget, {
            sizeRange: [70000000, undefined],
            onProgress: (progress, url) => {
                if (progress?.total > 0) {
                    app._win.webContents.send('getRequiredEnvDownloadingProgress', {
                        ...this.typeEnumes.chrome,
                        url,
                        progress
                    });
                }
            },
            onFinished: async () => {
                const directory = await unzipper.Open.file(downloadTarget);
                await directory.extract({
                    path: appStoragePath.getAppRequiredFolder()
                })
                await paramsValid.validLocalFileIsExist(destExe, 'destExe', `Not found the downloaded chromeExe file：${destExe}`)
                this.isDownloadingChromeExe = false;
                this.isDownloadingChromeExeTries = 0;
            },
            onError: async (err, url, errIndex) => {
                console.log(err)
                if (errIndex === urls.length - 1) {
                    this.isDownloadingChromeExe = false;
                    noticeWarn.notification(lang('下载Chrome核心组件出错'), err?.message)
                }
            }
        })
    }

    async checkChromium() {
        const isExist = await fs.pathExists(this.chromeExePath)
        if (!isExist) {
            app._win.webContents.send('getRequiredEnvDownloading', 'standard engine');
            if (!this.isDownloadingChromeExe) {
                if (this.isDownloadingChromeExeTries < 3) {
                    this._downloadChrome64exe(this.chromeExePath)
                } else {
                    app._win.webContents.send('global/warning', lang('核心组件无法下载，请联系技术解决'))
                }
            }
            this.isDownloadingChromeExeInterval = setTimeout(() => this.checkChromium(), 6000)
        } else {
            this.chromeExePathConfirm = true
            app._win.webContents.send('getRequiredEnvDownloadingSuccess', this.typeEnumes.chrome);
        }
    }

    checkEnv() {
        this.isDownloadingPrintPdfExeTries = 0;
        this.isDownloadingChromeExeTries = 0;
        clearTimeout(this.isDownloadingPrintPdfExeInterval)
        clearTimeout(this.isDownloadingChromeExeInterval)
        this._checkPrintPdf64exe();
        this._checkChrome()
    }

    getStandardChannel() {
        if (this.chromeExePathConfirm) {
            return 'chromium'
        } else if (this.chromeExeChannel?.includes('chrome')) {
            return 'chrome'
        } else if (this.chromeExeChannel?.includes('msedge')) {
            return 'edge'
        } else {
            return 'none'
        }
    }
}

module.exports = new RequiredEnv();

