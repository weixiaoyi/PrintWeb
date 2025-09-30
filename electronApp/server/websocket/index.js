const standard = require("./standard/index");

module.exports = ({server}) => {
    server.use("/websocket/standard", standard)
}
