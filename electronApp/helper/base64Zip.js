const fs = require("fs");
const AdmZip = require("adm-zip");

const base64ToZip = (base64String, outputPath) => {
  // 将Base64字符串转换为Buffer
  const buffer = Buffer.from(base64String, "base64");
  // 使用AdmZip解析ZIP内容
  const zip = new AdmZip(buffer);
  // 将ZIP文件写入到文件系统
  zip.writeZip(outputPath);
};

const zipToBase64 = () => {};
