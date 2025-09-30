const requiredEnv = require("@/core/base/RequiredEnv")

module.exports = async () => {
    requiredEnv.checkEnv()
};
