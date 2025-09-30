const fs = require("fs");
const crypto = require("crypto");

exports.calcStrMd5 = (str) => {
  const data = str;
  const hash = crypto.createHash("SHA1");
  hash.update(data);
  return hash.digest("hex");
};

exports.calcFileMd5 = async (filePath) => {
  const data = await fs.readFile(filePath);
  const hash = crypto.createHash("SHA1");
  hash.update(data);
  return hash.digest("hex");
};
