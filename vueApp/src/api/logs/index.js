import request from "@/utils/request";

export const getHtmlLogs = (params) =>
    request({
        url: `/api/logs/getHtmlLogs`,
        method: "post",
        data: params,
    });

export const getPdfLogs = (params) =>
    request({
        url: `/api/logs/getPdfLogs`,
        method: "post",
        data: params,
    });

export const getPrintLogs = (params) =>
    request({
        url: `/api/logs/getPrintLogs`,
        method: "post",
        data: params,
    });

export const clearHtmlLogs = (params) =>
    request({
        url: `/api/logs/clearHtmlLogs`,
        method: "post",
        data: params,
    });

export const clearPdfLogs = (params) =>
    request({
        url: `/api/logs/clearPdfLogs`,
        method: "post",
        data: params,
    });

export const clearPrintLogs = (params) =>
    request({
        url: `/api/logs/clearPrintLogs`,
        method: "post",
        data: params,
    });

export const getLogsExpireDay = (params) =>
    request({
        url: `/api/logs/getLogsExpireDay`,
        method: "get",
        params,
    });
