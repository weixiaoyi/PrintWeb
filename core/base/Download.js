const got = require("got").default;
const fs = require("fs");
const { pipeline: streamPipeline } = require('node:stream/promises');
const paramsValid = require("@/core/base/ParamsValid")
const appProgress = require("@/core/base/AppProgress")
const TimeoutTask = require("@/core/base/TimeoutTask")
const { uuid } = require("@/electronApp/helper");
const makeGot = require("@/core/base/MakeGot");

class Download {
    async downImageFileToBase64(url, options = {}) {
        paramsValid.validHttpUrl(url, 'downImageFileToBase64.url');
        paramsValid.validObject(options, 'downImageFileToBase64.options')
        return new Promise(async (resolve, reject) => {
            const { onProgress, onFinished, sizeRange, fileType, headers, cookies, timeout = 15 } = options
            const taskId = uuid();
            const timeoutTask = new TimeoutTask(timeout);  // 定时器监听

            const clear_SetTimeout = () => {
                timeoutTask.stop()
            }

            const clear_AppProgress = () => {
                appProgress.clearDownloadFileTask(taskId);
            }

            let readStream;
            let _hasHeadRequest = false;

            const cancelReadStream = () => {
                readStream?.destroy && readStream.destroy();
                readStream?.cancel && readStream.cancel();
            }

            const onThrowError = (error) => {
                clear_SetTimeout();
                try {
                    clear_AppProgress();
                    cancelReadStream();
                } catch {
                    // 啥都不干
                }
                return reject(error);
            };

            const onResolve = (base64) => {
                clear_SetTimeout();
                try {
                    clear_AppProgress();
                } catch {
                    // 啥都不干
                }
                resolve(base64)
            }

            const sizeCheck = (total) => {
                const { sizeRange } = options
                if (sizeRange) {
                    if (sizeRange[0]) {
                        if (total < sizeRange[0]) {
                            throw new Error(`检测到文件大小不符合：${total}小于最低值${sizeRange[0]}`);
                        }
                    }
                    if (sizeRange[1]) {
                        if (total > sizeRange[1]) {
                            throw new Error(`检测到文件大小不符合：${total}大于最大值${sizeRange[1]}`);
                        }
                    }
                }
            }
            try {
                console.log(`下载地址：${url}`)
                const gotOptions = await makeGot.makeOptions(url, headers, cookies);
                readStream = got(url, gotOptions);
                timeoutTask.start({
                    onOverTime: () => {
                        onThrowError(new Error(`download url timeout: ${url}`));
                    }
                })
                readStream.on('downloadProgress', (progress) => {
                    timeoutTask.update();
                    if (fileType && !_hasHeadRequest) {
                        _hasHeadRequest = true;
                        paramsValid.validFileTypeFromRequestUrl(url, headers, cookies, fileType).catch(err => {
                            onThrowError(err);
                        });
                    }
                    try {
                        appProgress.updateDownloadFileTask(taskId, { progress, url })
                    } catch (err) {
                        onThrowError(err)
                    }
                    if (onProgress) {
                        try {
                            if (progress.transferred && sizeRange) {
                                sizeCheck(progress.total)
                            }
                            onProgress(progress, url)
                        } catch (err) {
                            onThrowError(err)
                        }
                    }
                })
                readStream.on('response', async () => {
                    try {
                        const buffer = await readStream.buffer();
                        let fileType
                        await paramsValid.validImageFileTypeFromBuffer(buffer, (fileTypeResult) => {
                            fileType = fileTypeResult;
                        });
                        if (sizeRange) {
                            sizeCheck(Buffer.byteLength(buffer))
                        }
                        const base64 = `data:${fileType.mime};base64,${buffer.toString('base64')}`;
                        if (onFinished) {
                            try {
                                await onFinished(base64, url)
                            } catch (err) {
                                onThrowError(err)
                            }
                        }
                        try {
                            cancelReadStream();
                        } catch {
                            //啥也不干
                        }
                        onResolve(base64);
                    } catch (error) {
                        onThrowError(error);
                    }
                });
                readStream.on('error', onThrowError);
            } catch (error) {
                onThrowError(error);
            }
        })
    }

    async downStreamFile(url, targetFile, options = {}) {
        paramsValid.validHttpUrl(url, 'downStreamFile.url');
        paramsValid.validString(targetFile, 'downStreamFile.targetFile');
        paramsValid.validObject(options, 'downStreamFile.options')

        return new Promise(async (resolve, reject) => {
            const { onProgress, onFinished, sizeRange, fileType, headers, cookies, timeout = 15 } = options
            const taskId = uuid();
            const timeoutTask = new TimeoutTask(timeout);  // 定时器监听

            const clear_SetTimeout = () => {
                timeoutTask.stop()
            }

            const clear_AppProgress = () => {
                appProgress.clearDownloadFileTask(taskId);
            }

            let readStream;
            let _hasHeadRequest = false;

            const cancelReadStream = () => {
                readStream?.destroy && readStream.destroy();
                readStream?.cancel && readStream.cancel();
            }

            const onThrowError = (error) => {
                clear_SetTimeout();
                try {
                    clear_AppProgress();
                    cancelReadStream();
                } catch {
                    // 啥都不干
                }
                return reject(error);
            };

            const onResolve = () => {
                clear_SetTimeout();
                try {
                    clear_AppProgress();
                } catch {
                    // 啥都不干
                }
                resolve(true)
            }

            const sizeCheck = (total) => {
                const { sizeRange } = options
                if (sizeRange) {
                    if (sizeRange[0]) {
                        if (total < sizeRange[0]) {
                            throw new Error(`检测到文件大小不符合：${total}小于最低值${sizeRange[0]}`);
                        }
                    }
                    if (sizeRange[1]) {
                        if (total > sizeRange[1]) {
                            throw new Error(`检测到文件大小不符合：${total}大于最大值${sizeRange[1]}`);
                        }
                    }
                }
            }
            try {
                console.log(`下载地址：${url}`)
                const gotOptions = await makeGot.makeOptions(url, headers, cookies);
                readStream = got.stream(url, gotOptions);
                timeoutTask.start({
                    onOverTime: () => {
                        onThrowError(new Error(`download url timeout: ${url}`));
                    }
                })
                readStream.on('downloadProgress', (progress) => {
                    timeoutTask.update();
                    if (fileType && !_hasHeadRequest) {
                        _hasHeadRequest = true;
                        paramsValid.validFileTypeFromRequestUrl(url, headers, cookies, fileType).catch(err => {
                            onThrowError(err);
                        });
                    }
                    try {
                        appProgress.updateDownloadFileTask(taskId, { progress, url })
                    } catch (err) {
                        onThrowError(err)
                    }
                    if (onProgress) {
                        try {
                            if (progress.transferred && sizeRange) {
                                sizeCheck(progress.total)
                            }
                            onProgress(progress, url)
                        } catch (err) {
                            onThrowError(err)
                        }
                    }
                })
                readStream.on('response', async () => {
                    try {
                        await streamPipeline(
                            readStream,
                            fs.createWriteStream(targetFile)
                        );
                        await paramsValid.validLocalFileIsExist(targetFile, 'targetFile', `Not found the downloaded file：${targetFile}`)
                        if (fileType) {
                            await paramsValid.validFileTypeFromFile(targetFile, fileType)
                        }
                        if (sizeRange) {
                            const status = fs.statSync(targetFile);
                            sizeCheck(status.size)
                        }
                        if (onFinished) {
                            try {
                                await onFinished(targetFile, url)
                            } catch (err) {
                                onThrowError(err)
                            }
                        }
                        try {
                            cancelReadStream();
                        } catch {
                            //啥也不干
                        }
                        onResolve();
                    } catch (error) {
                        onThrowError(error);
                    }
                });
                readStream.on('error', onThrowError);
            } catch (error) {
                onThrowError(error);
            }
        })
    }

    async downStreamFileFromOneByUrlList(urls, targetFile, options = {}) {
        for (let i = 0; i < urls.length; i++) {
            try {
                const url = urls[i];
                const isSuccess = await this.downStreamFile(url, targetFile, options);
                if (isSuccess) {
                    break;
                }
            } catch (error) {
                options.onError && options.onError(error, urls[i], i);
            }
        }
    }
}

module.exports = new Download();
