import request from "@/utils/request";

export const doSetDefaultPrinter = (params) =>
  request({
    url: `/api/printer/doSetDefaultPrinter`,
    method: "post",
    data: params,
  });

export const getPrinterList = (params) =>
  request({
    url: `/api/printer/getPrinterList`,
    method: "get",
    params,
  });

export const getPrinterPaper = (params) =>
  request({
    url: `/api/printer/getPrinterPapers`,
    method: "post",
    data: params,
  });
