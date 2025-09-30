/**
 * WebPrintingExpert - Web 打印专家
 * 基于 Electron + Vue.js + Playwright 的桌面打印应用
 * 支持 HTML 转 PDF、WebSocket 打印服务、SumatraPDF 打印输出
 */
const moduleAlias = require('module-alias')
const path = require("path");
const {app, BrowserWindow, Menu, shell} = require("electron");
const dayjs = require("dayjs");
const log = require("electron-log")
const Constants = require("./electronApp/constants/index");
const appSettings = require("./appSetting/index");
const mainApp = require("./electronApp");
const {appStoragePath} = require("./electronApp/helper");

const isDev = process.env.NODE_ENV === "development";
log.initialize();
log.transports.file.resolvePathFn = () => path.join(appStoragePath.getWebPrintRecordsElectronLogFolder(),
    `${dayjs(Date.now()).format("YYYYMMDD")}.log`,);
Object.assign(console, log.functions);

process.on('uncaughtException', (error) => {
    console.error('进程错误：', error);
});
moduleAlias.addAlias('@', __dirname);

const createWindow = () => {
    Menu.setApplicationMenu(null);
    const win = new BrowserWindow({
        webPreferences: {
            webSecurity: false,
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
        width: 1150,
        minWidth: 1150,
        height: 800,
        // resizable: isDev,
        ...(Constants?.hideElectron
            ? {
                frame: false,
                transparent: true,
                backgroundColor: "#00000000",
            }
            : {}),
        show: false,
        icon: path.join(__dirname, "./electronApp/assets/tray.ico"),
    });
    win.show();

    if (isDev) {
        win.loadURL("http://localhost:8080");
    } else {
        win.loadFile(path.join(__dirname, "./vueApp/dist/index.html"));
    }

    // 窗口准备就绪后打开开发者工具
    win.on("ready-to-show", () => {
        // 打开开发者工具
        if (isDev) {
            win.webContents.openDevTools();
        }
    });

    win.on("close", (event) => {

        if (isDev) {
            app.exit();
        } else {
            // 关闭时，不直接关掉，而是回到托盘里
            try {
                require("./electronApp/ipc/common/checkAppNotice")();
            } catch {
                //啥也不干
            }
            win.hide();
            event.preventDefault();
        }
    });

    app._win = win;
    app._startTime = Date.now();
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    // 防止多开应用
    app.quit();
} else {
    app.on("second-instance", () => {
        if (app._win) {
            app._win.show();
        }
    });
    app.whenReady().then(async () => {
        createWindow();
        await appSettings();
        mainApp({app, win: app._win});
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.exit();
    }
});
