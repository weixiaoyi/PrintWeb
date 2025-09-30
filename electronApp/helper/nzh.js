var nzhcn = require("nzh/cn"); //直接使用简体中文

exports.transToMoney = (val) => {
  try {
    if (!val && val !== 0) return "";
    return nzhcn.toMoney(val).slice(3);
  } catch (err) {
    console.error(err);
    return "";
  }
};
