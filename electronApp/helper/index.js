const childProcess = require("child_process");
const { app } = require("electron");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs-extra");

function viewProcessMessage(cb) {
    let cmd = process.platform === "win32" ? "tasklist" : "ps aux";
    childProcess.exec(cmd, function (err, stdout, stderr) {
        if (err) return console.error(err);
        const splits = stdout.split("\n");
        cb && cb(splits);
    });
}

exports.manageProcess = {
    killNpapiBrowser: () => {
        // 暂时不要使用，有问题
        viewProcessMessage((splits) => {
            splits.forEach((line) => {
                let processMessage = line.trim().split(/\s+/);
                if (
                    ["360chromePortable.exe", "360chrome.exe"].includes(processMessage[0])
                ) {
                    process.kill(processMessage[1]);
                }
            });
        });
    },
    notExistOneNpapiBrowser: (cb) => {
        viewProcessMessage((splits) => {
            if (
                splits.some((line) => {
                    let processMessage = line.trim().split(/\s+/);
                    return ["360chromePortable.exe", "360chrome.exe"].includes(
                        processMessage[0]
                    );
                })
            ) {
                console.log("浏览器已经处于打开状态");
            } else {
                cb && cb();
            }
        });
    },
};

// 递归处理数组
const _treeFn = (tree, func, property = "children", index = 0) => {
    return tree.map((node) => {
        node.index = index;
        const result = func(node);
        if (node[property]) {
            node[property] = _treeFn(node[property], func, property, index + 1);
        }
        return result;
    });
};

// 递归过滤数组
const _treeFilter = (tree, func, index = 1) => {
    return tree.filter((node) => {
        if (node.children) {
            node.children = _treeFilter(node.children, func, index + 1);
        }
        return func(node, index);
    });
};

const treeFind = (array, func, property = "children") => {
    let result;
    for (let i = 0; i < array.length; i++) {
        if (func(array[i])) {
            result = array[i];
        } else if (array[i][property]) {
            result = treeFind(array[i][property], func, property);
        }
        if (result) return result;
    }
};

exports.treeFn = _treeFn;
exports.treeFilter = _treeFilter;
exports.treeFind = treeFind;
exports.uuid = (prefix = '') => {
    return prefix + crypto.randomUUID()
};

exports.appStoragePath = {
    getAppAsarUnpackByFile: (fileName) => {
        return app.isPackaged ? path.join(process.resourcesPath, `app.asar.unpacked/appAsarUnpack/${fileName}`)
            : path.join(app.getAppPath(), `appAsarUnpack/${fileName}`)
    },
    getAppRequiredFolder: () => {
        // 必须存在的目录，存放必须的环境文件
        return path.join(app.getPath("userData"), "user_required");
    },
    getWebAuthorityFolder: () => {
        // 授权目录
        return path.join(app.getPath("userData"), "user_authority");
    },
    getWebPrintFolder: () => {
        // webPrint目录
        return path.join(app.getPath("userData"), "user_web_print");
    },
    getWebPrintUploadFolder: () => {
        // webPrint upload目录
        return path.join(app.getPath("userData"), "user_web_print", 'upload');
    },
    getWebPrintPdfsFolder: () => {
        // webPrint pdf目录
        return path.join(app.getPath("userData"), "user_web_print", "pdfs");
    },
    getWebPrintHtmlsFolder: () => {
        // webPrint htmls目录
        return path.join(app.getPath("userData"), "user_web_print", "htmls");
    },
    getWebPrintRecordsHtmlsFolder: () => {
        // webPrint Record Html目录
        return path.join(app.getPath("userData"), "user_web_print", "records", "htmls");
    },
    getWebPrintRecordsPdfsFolder: () => {
        // webPrint Record Pdf目录
        return path.join(app.getPath("userData"), "user_web_print", "records", "pdfs");
    },
    getWebPrintRecordsPrintsFolder: () => {
        // webPrint Record Print目录
        return path.join(app.getPath("userData"), "user_web_print", "records", "prints");
    },
    getWebPrintRecordsElectronLogFolder: () => {
        // webPrint Record electronLog目录, electron-log 产生的目录
        return path.join(app.getPath("userData"), "user_web_print", "records", "electronLog");
    }
};

exports.toJson = (obj) => {
    try {
        return JSON.stringify(obj);
    } catch (err) {
        return null;
    }
};

exports.parseJson = (json) => {
    try {
        return JSON.parse(json);
    } catch (err) {
        return null;
    }
};

exports.genMd5 = (buffer) => {
    const hash = crypto.createHash("md5");
    hash.update(buffer, "utf8");
    return hash.digest("hex");
};

exports.isEmptyValue = (value) => {
    // 利用 NaN 是 JavaScript 之中唯一不等于自身的值
    return (
        typeof value === "undefined" ||
        value === "" ||
        value === null ||
        value !== value
    );
};

exports.isNotEmptyValue = (value) => {
    return !(
        typeof value === "undefined" ||
        value !== value
    );
};

