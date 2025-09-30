const { contextBridge, ipcRenderer } = require("electron");

const onMaps = {};
// electron处于安全考虑，ipcRender在render进程不再暴漏on方法
contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        // 无法直接在渲染进程使用ipcRenderer.send了
        send: (...args) => {
            return ipcRenderer.send(...args);
        },
    },
    ipcRendererOn: (channel, callback) => {
        if (onMaps[channel]) {
            ipcRenderer.removeListener(channel, onMaps[channel]);
        }
        onMaps[channel] = callback;
        return ipcRenderer.on(channel, callback);
    },
});
