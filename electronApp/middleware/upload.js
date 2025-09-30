const multer = require("multer");

module.exports = ({ storageDir, storageFileName, setFileName }) => {
    return multer({
        storage: multer.diskStorage({
            // 用来配置文件上传的位置
            destination: (req, file, cb) => {
                // 调用 cb 即可实现上传位置的配置
                cb(null, storageDir);
            },
            // 用来配置上传文件的名称（包含后缀）
            filename: (req, file, cb) => {
                const fileName = storageFileName
                    ? storageFileName
                    : setFileName
                        ? setFileName({
                            originalname: Buffer.from(file.originalname, "latin1").toString(
                                "utf8"
                            ),
                        })
                        : "未知";
                cb(null, fileName);
            },
        }),
    });
};
