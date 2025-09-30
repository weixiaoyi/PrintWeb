const { app } = require('electron')
const packJson = require("@/package.json")
const lang = require('@/electronApp/helper/lang')

class AppProgress {
    constructor() {
        this.badgeNum = null;
        this.badgeTitle = null;
        this.downloadFileTask = {};
        this.printFileTask = {};
        this.generatePdfTask = {};
        this.pdfTransTask = {};
    }

    updateDownloadFileTask(taskId, options = {}) {
        const { progress } = options;
        if (taskId && progress) {
            this.downloadFileTask[taskId] = {
                time: Date.now(),
                ...options
            };
            this._scheduleProgressTask();
        }
    }

    clearDownloadFileTask(taskId) {
        delete this.downloadFileTask[taskId];
        this._scheduleProgressTask();
    }

    updatePrintFileTask(taskId, options = {}) {
        if (taskId) {
            this.printFileTask[taskId] = {
                time: Date.now(),
                ...options
            };
            this._scheduleProgressTask();
        }
    }

    clearPrintFileTask(taskId) {
        delete this.printFileTask[taskId];
        this._scheduleProgressTask();
    }

    updateGeneratePdfTask(taskId, options = {}) {
        if (taskId) {
            this.generatePdfTask[taskId] = {
                time: Date.now(),
                ...options
            };
            this._scheduleProgressTask();
        }
    }

    clearGeneratePdfTask(taskId) {
        delete this.generatePdfTask[taskId];
        this._scheduleProgressTask();
    }

    updateTransPdfTask(taskId, options = {}, taskName = '') {
        if (taskId) {
            this.pdfTransTask[taskId] = {
                time: Date.now(),
                ...options,
                taskName
            };
            this._scheduleProgressTask();
        }
    }

    clearTransPdfTask(taskId) {
        delete this.pdfTransTask[taskId];
        this._scheduleProgressTask();
    }

    _scheduleProgressTask() {
        let progress = 0;
        try {
            this.badgeTitle = packJson.productName;
            this.badgeNum = 0;
            if (Object.keys(this.generatePdfTask).length) {
                const generatePdfTasks = Object.keys(this.generatePdfTask || {});
                progress = 2;
                this.badgeNum = generatePdfTasks.length;
                const totalTaskLength = this._getGeneratePdfAnalysis();
                if (totalTaskLength) {
                    this.badgeTitle = `${lang('生成PDF中')}(${this.badgeNum}/${totalTaskLength})...`;
                } else {
                    this.badgeTitle = `${lang('生成PDF中')}(${this.badgeNum})...`;
                }
            } else if (Object.keys(this.pdfTransTask).length) {
                const transPdfTasks = Object.keys(this.pdfTransTask || {});
                progress = 2;
                this.badgeNum = transPdfTasks.length;
                this.badgeTitle = `${lang(`PDF转换${this.pdfTransTask?.[transPdfTasks[0]]?.taskName || ''}中`)}(${this.badgeNum})...`;
            } else if (Object.keys(this.downloadFileTask).length) {
                const downloadFileTasks = Object.keys(this.downloadFileTask || {});
                const results = downloadFileTasks.reduce((sum, key) => {
                    const task = this.downloadFileTask[key]
                    const { total, transferred } = task?.progress || {}
                    if (typeof total === 'number') {
                        sum.total += total
                    }
                    if (typeof transferred === 'number') {
                        sum.transferred += transferred
                    }
                    return sum
                }, {
                    total: 0,
                    transferred: 0,
                })

                if (results.total !== 0) {
                    progress = results.transferred / results.total
                } else {
                    progress = 2
                }
                this.badgeNum = downloadFileTasks.length;
                const percent = `${(progress * 100).toFixed(0)}%`;
                const totalTaskLength = this._getGeneratePdfAnalysis();
                if (totalTaskLength) {
                    this.badgeTitle = `${lang('下载中')}(${this.badgeNum}/${totalTaskLength})(${percent})...`;
                } else {
                    this.badgeTitle = `${lang('下载中')}(${this.badgeNum})/(${percent})...`;
                }
            } else if (Object.keys(this.printFileTask).length) {
                const printFileTask = Object.keys(this.printFileTask || {});
                //设定值大于 1 在 Windows 中将表示一个不确定的进度条 ，或在其他操作系统中显示为 100%。
                // 一个不确定的progress bar 仍然处于活动状态，但不显示实际百分比， 并且用于当 您不知道一个操作需要多长时间才能完成的情况。
                progress = 2;
                this.badgeNum = printFileTask.length;
                const totalTaskLength = this._getPrintAnalysis();
                if (totalTaskLength) {
                    this.badgeTitle = `${lang('打印中')}(${this.badgeNum}/${totalTaskLength})...`;
                } else {
                    this.badgeTitle = `${lang('打印中')}(${this.badgeNum})...`;
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            this._setProgress(progress);
        }
    }

    _getPrintAnalysis() {
        const printPdfAnalysisData = require("../printPdf").getAnalysisData(); // 放上面会报错，估计是循环引用的问题
        let totalTaskLength = 0;
        if (printPdfAnalysisData) {
            totalTaskLength = printPdfAnalysisData.tasksLength + printPdfAnalysisData.executeTasksLength;
            if (typeof totalTaskLength !== "number") {
                totalTaskLength = 0;
            }
        }
        return totalTaskLength;
    }

    _getGeneratePdfAnalysis() {
        const generatePdfAnalysisData = require("../generatePdf").getAnalysisData(); // 放上面会报错，估计是循环引用的问题
        let totalTaskLength = 0;
        if (generatePdfAnalysisData) {
            totalTaskLength = generatePdfAnalysisData.tasksLength + generatePdfAnalysisData.executeTasksLength;
            if (typeof totalTaskLength !== "number") {
                totalTaskLength = 0;
            }
        }
        return totalTaskLength;
    }

    async _setProgress(progress) {
        if (app._win) {
            if (progress === 1 || progress <= 0) {
                app._win.setProgressBar(-1);
            } else {
                progress && app._win.setProgressBar(progress);
            }
            if (this.badgeTitle) {
                app._win.setTitle(this.badgeTitle);
            }

            app._win.webContents.send('appProgress', {
                progress,
                title: this.badgeTitle
            })

            // const desc = `${this.badgeNum}`
            // if (this.badgeNum) {
            //     app._win.setOverlayIcon(nativeImage.createFromDataURL(numsBase64[this.badgeNum]), desc);
            // } else {
            //     app._win.setOverlayIcon(null, desc);
            // }
        }
    }
}

module.exports = new AppProgress();
