const paramsValid = require("@/core/base/ParamsValid");
const appAuthority = require("@/core/base/AppAuthority");
const fs = require("fs-extra");
const path = require("path");
const {appStoragePath} = require("@/electronApp/helper/index")

module.exports = async (req, res, next) => {
    try {
        const {fileName, filePath} = req.body
        paramsValid.validString(fileName, 'fileName');
        paramsValid.validString(filePath, 'filePath');
        await appAuthority.importDecrypt({filePath});
        await fs.ensureDir(appStoragePath.getWebAuthorityFolder());
        await fs.copy(filePath, path.join(appStoragePath.getWebAuthorityFolder(), 'authority.cert'));
        return res.json({
            data: true,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
