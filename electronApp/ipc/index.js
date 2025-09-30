const { ipcMain } = require("electron");
const getPackJson = require("./common/getPackjson");
const getInitPort = require("./common/getInitPort");
const getRequiredEnv = require("./common/getRequiredEnv");
const checkAppVersionUpdating = require("./common/checkAppVersionUpdating");
const checkAppNotice = require("./common/checkAppNotice");

ipcMain.on("getPackJson", getPackJson);
ipcMain.on("getInitPort", getInitPort);
ipcMain.on("getRequiredEnv", getRequiredEnv);
ipcMain.on("checkAppVersionUpdating", checkAppVersionUpdating);
ipcMain.on("checkAppNotice", checkAppNotice);





