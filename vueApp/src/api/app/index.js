import request from "@/utils/request";

export const getAutoLaunchStatus = (params) =>
  request({
    url: `/api/appSetting/getAutoLaunchStatus`,
    method: "get",
    params,
  });

export const switchAutoLaunchStatus = (params) =>
  request({
    url: `/api/appSetting/switchAutoLaunchStatus`,
    method: "post",
    data: params,
  });

export const getMachineId = (params) =>
  request({
    url: `/api/appSetting/getMachineId`,
    method: "get",
    params,
  });

export const getAuthority = (params) =>
  request({
    url: `/api/appSetting/getAuthority`,
    method: "get",
    params,
  });

export const doImportAuthorityFile = (params) =>
  request({
    url: `/api/appSetting/importAuthorityCert`,
    method: "post",
    data: params,
  });

export const getLanguage = (params) =>
  request({
    url: `/api/appSetting/getLanguage`,
    method: "get",
    params,
  });

export const setLanguage = (params) =>
  request({
    url: `/api/appSetting/setLanguage`,
    method: "post",
    data: params,
  });

export const downloadStandardPdfEngine = (params) =>
  request({
    url: `/api/appSetting/downloadStandardPdfEngine`,
    method: "post",
    data: params,
  });

export const getTabsVisibility = (params) =>
  request({
    url: `/api/appSetting/getTabsVisibility`,
    method: "get",
    params,
  });

export const getContactUsTabInnerHtml = (params) =>
  request({
    url: `/api/appSetting/getContactUsTabInnerHtml`,
    method: "get",
    params,
  });

export const getTitle = (params) =>
  request({
    url: `/api/appSetting/getTitle`,
    method: "get",
    params,
  });

export const getThemeColor = (params) =>
  request({
    url: `/api/appSetting/getThemeColor`,
    method: "get",
    params,
  });
