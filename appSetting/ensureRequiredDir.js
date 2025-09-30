const fs = require('fs-extra');
const {appStoragePath} = require("@/electronApp/helper/index")

module.exports = async () => {
    await fs.ensureDir(appStoragePath.getWebPrintFolder())
    await fs.ensureDir(appStoragePath.getAppRequiredFolder())
}
