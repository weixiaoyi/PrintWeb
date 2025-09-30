import request from "@/utils/request";

export const getCommonTemplates = (params) =>
  request({
    url: `/api/templates/getCommonTemplates`,
    method: "get",
    params,
  });
