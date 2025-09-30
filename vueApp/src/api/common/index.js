import request from "@/utils/request";

export const shellOpenPath = (params) =>
  request({
    url: `/api/common/shellOpenPath`,
    method: "post",
    data: params,
  });

export const shellOpenExternal = (params) =>
  request({
    url: `/api/common/shellOpenExternal`,
    method: "post",
    data: params,
  });

export const shellShowItemInFolder = (params) =>
  request({
    url: `/api/common/shellShowItemInFolder`,
    method: "post",
    data: params,
  });

export const openConsole = (params) =>
  request({
    url: `/api/common/openConsole`,
    method: "get",
    params,
  });

export const printPreviewFile = (params) =>
  request({
    url: `/api/common/printPreviewFile`,
    method: "post",
    data: params,
  });
