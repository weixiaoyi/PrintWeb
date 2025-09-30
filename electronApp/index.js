module.exports = async ({ app, win }) => {
    require("./store/index");
    require("./ipc/index");
    require("./server/index")();
};
