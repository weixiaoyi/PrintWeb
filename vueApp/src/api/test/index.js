import request from "@/utils/request";

export const doGenerateHtmlToPdfTest = (params) =>
  request({
    url: `/api/test/doGenerateHtmlToPdfTest`,
    method: "post",
    data: params,
  });

export const doPrintTest = (params) =>
  request({
    url: `/api/test/doPrintTest`,
    method: "post",
    data: params,
  });

export const doPrintUploadPdfFileTest = (params) =>
  request({
    url: `/api/test/doPrintUploadPdfFileTest`,
    method: "post",
    data: params,
  });

export const doPrintUploadHtmlFileTest = (params) =>
  request({
    url: `/api/test/doPrintUploadHtmlFileTest`,
    method: "post",
    data: params,
  });
