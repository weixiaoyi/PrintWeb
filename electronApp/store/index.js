// electron 数据存储持久化
const ElectronStore = require("electron-store");
const store = new ElectronStore();

const updateStore = (key, value) => {
    store.set(key, value);
};

module.exports = {
    store,
    updateStore,
    getStore: async (key) => {
        return await store.get(key);
    },
};
