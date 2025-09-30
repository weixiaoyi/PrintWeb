const iconv = require("iconv-lite");
const jschardet = require("jschardet");

module.exports = (zip) => {
  // 解决zip文件中文乱码问题
  zip.getEntries().forEach((entry) => {
    const rawEntryName = entry.rawEntryName;
    const chardet = jschardet.detect(rawEntryName);
    let newEntryName = entry.entryName;
    if (chardet?.encoding?.toUpperCase() !== "UTF-8") {
      newEntryName = iconv.decode(rawEntryName, "GBK");
    }
    entry.entryName = newEntryName;
  });
  return zip;
};
