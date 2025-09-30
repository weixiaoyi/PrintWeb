import request from "@/utils/request";

// 获取oss的授权信息
export function ossInfo() {
  return request({
    url: "tool/fileUpload/sign",
    method: "get",
  });
}

// 文件上传
export function upLoadFile(data) {
  return request({
    url: "platform/bidder/uploadFile",
    method: "post",
    data,
  });
}

// 获取文件地址

// export function reviewUrl(fileId) {
//     return request({
//         url: `file/upload/${fileId}`,
//         method: 'GET',
//     })
// }

//获取url
export function reviewUrl(fileId) {
  return request({
    url: `tool/fileUpload/exp/${fileId}`,
    method: "GET",
  });
}

//第三方接口
export function third() {
  return request({
    url: `supplier/supplier/saveSupOrEnt`,
    method: "GET",
  });
}

/**
 * 获取文件地址
 */
export function getFileUrl(fileId) {
  return request({
    url: `purchase/fileUpload/mate/${fileId}`,
    method: "get",
  });
}

export function getInfo() {}

export function uploadFile(params) {
  return request({
    url: `api/common/uploadFile`,
    method: "post",
    data: params,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
