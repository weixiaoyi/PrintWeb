const path = require("path");
const { upload } = require("@/electronApp/middleware/index");
const { appStoragePath } = require("@/electronApp/helper/index")
const fs = require("fs-extra");
const dayjs = require("dayjs");

module.exports = {
    storageFile: async (req, res, next) => {
        const dir = dayjs().format("YYYYMMDD_HH-mm-ss");
        const destDir = path.join(
            appStoragePath.getWebPrintUploadFolder(),
            dir
        );
        await fs.ensureDir(destDir);
        upload({
            storageDir: destDir,
            setFileName: ({ originalname }) => {
                req._result = {
                    filePath: path.join(destDir, originalname),
                    fileName: originalname,
                }
                return originalname;
            },
        }).single("file")(req, res, next);
    },
    resJson: (req, res, next) => {
        try {
            return res.json({
                success: true,
                data: req._result
            });
        } catch (err) {
            next(err)
        }
    },
};
