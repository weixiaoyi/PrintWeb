const {app} = require("electron");
const childProcess = require("child_process");
const pidusage = require("pidusage");
const appProgress = require("@/core/base/AppProgress");
const {uuid} = require("@/electronApp/helper");
const paramsValid = require("@/core/base/ParamsValid");
const systemPrinter = require("@/core/base/SystemPrinter");
const noticeWarn = require("@/core/base/NoticeWarn");
const lang = require("@/electronApp/helper/lang")

class ChildProcessPromise {

    constructor() {
        this.processStartNum = 0;
        this.processForceCloseNum = 0;
        this.processAutoCloseNum = 0;
    }

    resetNum() {
        this.processStartNum = 0;
        this.processForceCloseNum = 0;
        this.processAutoCloseNum = 0;
    }

    async _checkPrinterErrorStatus(args) {
        if (!args) return;
        try {
            const findIndex = args?.findIndex(one => one === '-print-to');
            let printer = null;
            if (findIndex > -1) {
                printer = {
                    name: args[findIndex + 1]
                }
            } else {
                const printers = await systemPrinter.getPrinterList();
                printer = printers?.find(one => one.default)
            }
            if (printer?.name) {
                const res = await systemPrinter.getAbnormalTask(printer);
                if (res.length) {
                    noticeWarn.notification(lang('打印机异常提醒'), app._lang === 'en' ? `Printing timeout, detected ${res.length} abnormal task statuses in the current printer, usually due to incorrect or blocked tasks not being executed.Please check the printer task list and clear it` :
                        `打印超时，检测到当前打印机有${res.length}条任务状态异常，通常是由于错误的或阻塞的任务未执行掉，请检查打印机任务列表并清除它`);
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    async spawnExeProcess(exePath, args, spanName = '') {
        return new Promise((resolve, reject) => {
            const taskId = uuid();
            const stdoutErrors = [] // stdout出现的，错误记录器
            let closed = false; // 进程是否关闭

            // 子进程
            let spawnProcess;

            // 定时器监听
            let updateTime = Date.now();
            let timeout = null;
            let _setTimeout;
            let _deadTimeout = 0;

            const clear_SetTimeout = () => {
                clearTimeout(timeout);
                _setTimeout = null;
            }

            const stopProcess = () => {
                clear_SetTimeout();
                try {
                    appProgress.clearPrintFileTask(taskId);
                } catch (err) {
                    console.error(`appProgress.clearPrintFileTask 清除进度出错：${err?.message}`)
                }
                if (spawnProcess && spawnProcess.pid && spawnProcess.exitCode === null) {
                    try {
                        spawnProcess.kill && spawnProcess.kill(); // 必须有pid 才能kill
                    } catch (err) {
                        console.error(err)
                    }
                    if (!closed) {
                        this.processForceCloseNum += 1
                        console.log(`（${spanName}）子进程已强制关闭，pid:`, spawnProcess.pid);
                    }
                } else {
                    if (!closed) {
                        this.processAutoCloseNum += 1
                        console.log(`（${spanName}）子进程已自动关闭，pid:`, spawnProcess?.pid);
                    }
                }
                closed = true;
            }

            const onResolve = () => {
                resolve(true)
            }

            const onReject = (err) => {
                reject(err)
            }

            _setTimeout = async () => {
                try {
                    clearTimeout(timeout);
                    timeout = setTimeout(async () => {
                        if (!spawnProcess?.pid) {
                            clear_SetTimeout();
                            return;
                        }
                        if (Date.now() - updateTime > 5 * 1000) {
                            const timeoutCause = 'it is usually due to an error or blocked task not being executed by the printer. Please check the printer task list and clear it'
                            await pidusage(spawnProcess.pid).then(res => {
                                const {cpu, memory} = res;
                                if (+cpu === 0) {
                                    _deadTimeout = _deadTimeout + 3;
                                }
                                if (_deadTimeout > 8) {
                                    stopProcess();
                                    this._checkPrinterErrorStatus(args);
                                    onReject(`timeout stopped for have no progress when sending to printer, ${timeoutCause}`);
                                } else {
                                    _setTimeout && _setTimeout()
                                }
                            }).catch((err) => {
                                if (err?.message.includes('No matching pid found')) {
                                    console.error('catch a known error: No matching pid found, this is not important!')
                                } else {
                                    console.error('pidusage unCatch error:', err);
                                    if (Date.now() - updateTime > 300 * 1000) {
                                        // 彻底坏了，5分钟一定要关闭
                                        stopProcess();
                                        this._checkPrinterErrorStatus(args);
                                        onReject(`timeout stopped for have no progress when sending to printer over 5 minutes: ${err?.message}, ${timeoutCause}`);
                                    }
                                    return Promise.reject(err)
                                }
                            })
                        } else {
                            _setTimeout && _setTimeout();
                        }
                    }, 3000)
                } catch (err) {
                    console.error(`进程cpu监听定时器报错：${err}`)
                }
            };

            try {
                spawnProcess = childProcess.spawn(exePath, args, {
                    windowsHide: true
                })
                this.processStartNum += 1;
                if (!spawnProcess.pid) {
                    stopProcess();
                    onReject('create child process failed，pid is not exist!');
                    return;
                }
                console.log(`（${spanName}）子进程创建，pid:`, spawnProcess.pid);
                _setTimeout();
                try {
                    appProgress.updatePrintFileTask(taskId);
                } catch (err) {
                    console.error(`appProgress.updatePrintFileTask 记录进度出错：${err?.message}`)
                }
                spawnProcess.stdout.on('data', (data) => {
                    if (data) {
                        updateTime = Date.now();
                        _deadTimeout = 0;
                    }
                    if (data) {
                        // 分析记录，记录一些错误记录
                        const str = `${data}`
                        if (str.includes('PrintToDevice: failed')) {
                            stdoutErrors.push({
                                type: 0,
                                message: str + '。If you cancel actively, no need to pay attention',
                            })
                        }
                        if (str.includes('Error: Couldn\'t open file')) {
                            stdoutErrors.push({
                                type: 1,
                                message: str,
                            })
                        }
                    }
                });
                spawnProcess.on("error", (error) => {
                    stopProcess();
                    onReject(error);
                });
                spawnProcess.on("close", async (code, err) => {
                    stopProcess();
                    if (![0].includes(code)) {
                        let standerMsg = `printing exited with exit code: ${code}`
                        const findType1 = stdoutErrors.find(one => one.type === 1)
                        if (findType1) {
                            const pdfPath = args.at(-1);
                            try {
                                await paramsValid.validPdfDecrypt(pdfPath)
                            } catch (err) {
                                findType1.message = err.message
                            }
                        }
                        if (stdoutErrors.length) {
                            const errors = stdoutErrors.map(item => item.message).join(';');
                            standerMsg = standerMsg + ', because some reasons：' + errors?.replace('.:', ',')
                        }
                        onReject(standerMsg)
                    } else {
                        onResolve();
                    }
                });
            } catch (err) {
                stopProcess();
                onReject(err);
            }
        })
    }
}

module.exports = ChildProcessPromise
