import request from "@/utils/request";

export const getAnalysisData = (params) => {
  // sse
  return `http://127.0.0.1:${window._port}/api/common/sse/getAnalysisData`;
};

export const resetAnalysisData = (params) =>
  request({
    url: `/api/common/resetAnalysisData`,
    method: "post",
    data: params,
  });
