import { reviewUrl } from "@/api/publicFile";
import { message } from "ant-design-vue";
import printJS from "print-js";
import store from "store";

const modules = import.meta.glob("../views/**/*.vue");

export function groupByCount(arrays, cols) {
  let result = [];
  for (let i = 0; i < arrays.length; i += cols) {
    result.push(arrays.slice(i, i + cols));
  }
  return result;
}

// 递归处理数组
export const treeFn = (tree, func, property = "children") => {
  return tree.map((node) => {
    if (node[property]) {
      node[property] = treeFn(node[property], func, property);
    }
    return func(node);
  });
};

// 递归过滤数组
export function treeFilter(tree, func, property = "children") {
  return tree.filter((node) => {
    if (node.children) {
      node.children = treeFilter(node.children, func, property);
    }
    return func(node);
  });
}

export const isEmptyValue = (value) => {
  // 利用 NaN 是 JavaScript 之中唯一不等于自身的值
  return (
    typeof value === "undefined" ||
    value === "" ||
    value === null ||
    value !== value
  );
};

export const isEmptyObject = (value) => {
  return JSON.stringify(value) === "{}";
};

export const exportFile = (fileName, url, prevUrl) => {
  let downloadurl = "";
  try {
    downloadurl = window.URL
      ? window.URL.createObjectURL(url)
      : window.webkitURL.createObjectURL(url);
  } catch (e) {
    let binaryData = [];
    binaryData.push(url);
    let blobFile = new Blob(binaryData);
    downloadurl = window.URL
      ? window.URL.createObjectURL(blobFile)
      : window.webkitURL.createObjectURL(blobFile);
  }
  let link = document.createElement("a");
  link.download = fileName;
  link.style.display = "none";
  link.href = prevUrl || downloadurl;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href); // 释放URL 对象
  document.body.removeChild(link);
};

export const previewFile = async (fileId) => {
  if (isEmptyValue(fileId)) {
    return message.warning("文件Id不存在，请检查文件Id");
  }
  const res = await reviewUrl(BigInt(fileId));
  res.msg && window.open(res.msg, "_blank");
};

export const printPdf = (el, options = {}) => {
  const style =
    "@page { margin: 5mm 5mm; size:auto;} " +
    "* { -webkit-print-color-adjust: exact !important; -moz-print-color-adjust: exact !important; -ms-print-color-adjust: exact !important; " +
    " print-color-adjust: exact !important;}" +
    "@media print {  th,td { border:1px solid #ccc; padding:2px 10px;text-align:left} table{border-collapse:collapse;width:100%}}";

  printJS({
    printable: el,
    type: "html",
    style,
    // style: "@page {margin: 0 10mm}", // 不打印页眉和页脚
    ...options,
    scanStyles: false,
  });
};

export const toJson = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return null;
  }
};

export const parseJson = (json) => {
  try {
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};

export const Localstorage = {
  set: (key, value) => {
    store.set(key, value);
  },
  get: (key) => {
    return store.get(key);
  },
  remove: (key) => {
    return store.remove(key);
  },
  setObject: (key, value) => {
    try {
      store.set(key, JSON.stringify(value));
    } catch (err) {
      store.set(key, "");
    }
  },
  getObject: (key) => {
    try {
      return JSON.parse(store.get(key));
    } catch (err) {
      return null;
    }
  },
};

export const Sessionstorage = {
  set: (key, value) => {
    sessionStorage.setItem(key, value);
  },
  get: (key) => {
    return sessionStorage.getItem(key);
  },
  remove: (key) => {
    return sessionStorage.removeItem(key);
  },
  setObject: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      sessionStorage.setItem(key, "");
    }
  },
  getObject: (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key));
    } catch (err) {
      return null;
    }
  },
};

export const asyncImport = (viewPath, viewType = "vue") => {
  let result = "";
  if (/.vue$|.jsx$/.test(viewPath)) {
    result = modules[viewPath];
  } else {
    result = modules[viewPath + "." + viewType];
  }

  if (!result) {
    message.error("未匹配到路由" + viewPath);
  }

  return result;
};

export function uuid(prefix = "") {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0;
    let v = c === "x" ? r : (r & 0x3) | 0x8;
    return prefix + v.toString(16);
  });
}

export function removeSpaces(data) {
  const value = JSON.stringify(data, (key, value) => {
    return typeof value === "string" ? value.trim() : value;
  });
  return JSON.parse(value);
}

/**
 * 二次确认弹框，异步处理
 * @param {title: 弹框说明} title
 * @returns
 */
export const promiseConfirm = (title) => {
  // 在上面引入，会导致modal都出现问题，这里动态引入解决问题
  return import("ant-design-vue").then(({ Modal }) => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        centered: true,
        title,
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject("操作取消");
        },
      });
    });
  });
};
