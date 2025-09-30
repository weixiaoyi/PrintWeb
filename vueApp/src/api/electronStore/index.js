import request from "@/utils/request";

export const updateStore = (params) =>
  request({
    url: `/api/electronStore/updateStore`,
    method: "post",
    data: params,
  });

export const getStore = (params) =>
  request({
    url: `/api/electronStore/getStore`,
    method: "get",
    params,
  });
