const path = require("path");
const signPlugPathMenu = path.join(
    __dirname,
    "../../electronApp/IE-extentions/signPlug/360chrome2/Application/360chrome.exe"
);
// cmd命令文件夹空格字符加双引号
const NPAPICHROMEPATH = signPlugPathMenu
    .split("\\")
    .map((i) => (i.includes(" ") ? '"' + i + '"' : i))
    .join("\\");

module.exports = {
    NPAPICHROMEPATH,
    WpsStaticHtml: path.join(__dirname, "../IE-extentions/signPlug/index.html"),
    hideElectron: false,
    serverPort: 3024,
    puppeteerLaunchArgs: [
        "--no-first-run",
        "--no-sandbox",
        "–single-process",
        "--disabled-setupid-sandbox",
    ],
};
