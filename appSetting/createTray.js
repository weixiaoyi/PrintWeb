const path = require("path");
const { app, Menu, Tray, nativeImage } = require("electron");
const lang = require("@/electronApp/helper/lang");

let tray;

exports.updateTrayLang = () => {
    if (tray) {
        try {
            tray.destroy();
            createTray();
        } catch (e) {
            console.error(e);
        }
    }
}

const createTray = () => {
    // 创建右下角托盘
    const icon = nativeImage.createFromPath(
        path.join(__dirname, "..", "electronApp/assets/tray.ico")
    );
    tray = new Tray(icon);
    const win = app._win;

    const menu = Menu.buildFromTemplate([
        {
            label: lang("显示主界面"),
            click: () => {
                win.show();
            },
        },
        {
            label: lang("退出"),
            click: () => {
                app.exit();
            },
        },
    ]);
    tray.setToolTip(app.getName()); //悬浮展示
    tray.setContextMenu(menu); //绑定托盘菜单
    tray.on("click", (event, bounds) => {
        tray.popUpContextMenu(); // 显示上下文菜单，等同于右键点击。
    });
    tray.on("double-click", (event) => {
        // 双击激活
        win.show();
    });
};

exports.createTray = createTray;
