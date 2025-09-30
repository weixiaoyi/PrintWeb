const {autoUpdater} = require("electron-updater");
const {app} = require("electron");
const log = require("electron-log");
const packageJson = require("@/package.json");

autoUpdater.autoDownload = false;
autoUpdater.useMultipleRangeRequest = false;    // 是否使用多个范围请求（Range Requests）来下载更新包
autoUpdater.differentialPackage = false; // 是否使用差异更新包
// autoUpdater.forceDevUpdateConfig = true 开发环境启用以调试更新流程。

module.exports = () => {
    // setInterval(() => {
    //     const info = {
    //         "version": "0.0.2",
    //         "files": [
    //             {
    //                 "url": "Web打印专家_win_0.0.2.1.exe",
    //                 "sha512": "Z72+PtzEz+E7nveRHv5kvlPgaRMdh5nZJI0CnIa5Gfy3qfVyqvtoXwRy5UXe/l/WNpd71g6I+KaAMkRLKqiqzg==",
    //                 "size": 136685491
    //             }
    //         ],
    //         "path": "Web打印专家_win_0.0.2.1.exe",
    //         "sha512": "Z72+PtzEz+E7nveRHv5kvlPgaRMdh5nZJI0CnIa5Gfy3qfVyqvtoXwRy5UXe/l/WNpd71g6I+KaAMkRLKqiqzg==",
    //         "releaseDate": "2025-07-20T10:52:09.359Z"
    //     }
    //     app._win.webContents.send(
    //         "global/checkAppNewVersionInfo",
    //         JSON.stringify({
    //             path: `${packageJson.publishUrl}/${info.path}`,
    //             info: {
    //                 ...info,
    //                 downloadChannels: `${packageJson.publishUrl}/${info.version}/downloadChannels.json`,
    //                 updateLogs: `${packageJson.publishUrl}/${info.version}/updateLogs.json`,
    //             },
    //         })
    //     );
    //     app._win.webContents.send(
    //         "global/updateApp",
    //         50
    //     );
    // }, 2000)

    autoUpdater.on("error", (err) => {
        log.error(`更新错误:${JSON.stringify(err)}`);
    });

    // 发现可更新版本-弹层询问渲染进程是否需要“立即更新”
    autoUpdater.on("update-available", (info) => {
        app._win.webContents.send("global/checkAppNewVersion", 0);
        if (info?.path && packageJson.publishUrl) {
            app._win.webContents.send(
                "global/checkAppNewVersionInfo",
                JSON.stringify({
                    path: `${packageJson.publishUrl}/${info.path}`,
                    info: {
                        ...info,
                        downloadChannels: `${packageJson.publishUrl}/${info.version}/downloadChannels.json`,
                        updateLogs: `${packageJson.publishUrl}/${info.version}/updateLogs.json`,
                    },
                })
            );
        }
        autoUpdater.downloadUpdate();
    });

    autoUpdater.on("download-progress", (progress) => {
        if (progress?.percent) {
            log.info(`新版本更新进度监听:${Number(progress?.percent)?.toFixed(2)}%`);
        }
        app._win.webContents.send(
            "global/updateApp",
            progress?.percent ? parseInt(progress?.percent) : progress?.percent
        );
    });

    autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdates();
};

