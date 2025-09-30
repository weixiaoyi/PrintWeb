import request from "@/utils/request";

export const batchSearchPdf = (params) =>
  request({
    url: "/api/printView/batchSearchPdf",
    method: "post",
    data: params,
  });
