const { app } = require("electron");
const os = require("os");
const axios = require('axios');
const machineId = require('node-machine-id');
const packageJson = require("@/package.json");
const requiredEnv = require("@/core/base/RequiredEnv");
const { encrypt } = require("@/electronApp/helper/cryptFn")

module.exports = async () => {
    const version = packageJson.version;
    const appName = 'webPrintExpert';
    let lang;
    let channel
    let id;
    try {
        id = await machineId.machineId()
    } catch {
        // 啥也不干
    }
    const authority = app._authority;
    try {
        channel = requiredEnv.getStandardChannel();
    } catch {

    }
    const arch = os.arch();
    const platform = os.platform();
    const systemVersion = os.release();
    const cpus = os.cpus();
    const memories = os.totalmem();
    try {
        lang = app.getPreferredSystemLanguages();
    } catch {

    }
    let spentTime = 0
    if (app._startTime) {
        spentTime = Math.ceil((Date.now() - app._startTime) / 60000)
    }

    const payload = {
        version,
        appName,
        machineId: id,
        authority,
        channel,
        arch,
        platform,
        systemVersion,
        cpuNums: cpus.length,
        memories: Math.ceil(memories / 1014 / 1024 / 1024),
        lang,
        localTime: Date.now(),
        spentTime,
        isSourceCode: true
    }

    axios.post('http://webprintpdf.com/api/logs/record', {
        data: encrypt(JSON.stringify(payload))
    })

    axios.get(`http://webprintpdf.com/api/notice/getClientNotice/${payload.appName}?machineId=${payload.machineId}`)
        .then(response => {
            if (response?.data?.data) {
                app._win.webContents.send("checkAppNoticeSuccess", response.data.data);
            }
        })
        .catch(error => {
            // 啥也不干
        });
};

