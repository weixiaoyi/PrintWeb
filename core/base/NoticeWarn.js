const {Notification, app, dialog} = require('electron');
const path = require("path");
const lang = require("@/electronApp/helper/lang");

// const TaskQueue = require("@/core/base/TaskQueue")

class NoticeWarn {
    constructor() {
        // this.taskQueue = new TaskQueue({ maxTask: 3 })
    }

    _notice(title, body) {
        const notice = new Notification({
            title, body,
            icon: path.join(app.getAppPath(), 'electronApp/assets/icon.ico'),
        })
        notice.show();
        // this.taskQueue.addTask({
        //     executeFun: async () => {
        //         const notice = new Notification({
        //             title, body,
        //             icon: path.join(app.getAppPath(), 'electronApp/assets/icon.ico'),
        //         })
        //         notice.show();
        //         return new Promise((resolve) => {
        //             setTimeout(() => {
        //                 notice.close();
        //                 setTimeout(resolve, 600);
        //             }, 3000);
        //         })
        //     }
        // })
    }

    notification(title = lang('提示'), body = lang('提示内容')) {
        const isSupported = Notification.isSupported();
        if (isSupported) {
            this._notice(title, body)
        } else {
            this.showMessageBox(title, body)
        }
        app._win.webContents.send(
            "global/warning",
            `${title}：${body}`
        );
    }

    notificationSimple(title = lang('提示'), body = lang('提示内容')) {
        const isSupported = Notification.isSupported();
        if (isSupported) {
            this._notice(title, body);
        }
    }

    showMessageBox(title = lang('提示'), message = lang('提示内容')) {
        dialog.showMessageBox({
            title,
            message,
        });
    }
}

module.exports = new NoticeWarn();
