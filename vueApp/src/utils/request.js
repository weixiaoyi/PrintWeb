import axios from "axios";
import { message } from "ant-design-vue";
import store from "@/store";

message.config({
  maxCount: 1,
});
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: "/api",
  // 超时
  // timeout: 10000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    if (!config.url.includes("http")) {
      config.url = `http://127.0.0.1:${window._port}${
        config.url.startsWith("/") ? config.url : "/" + config.url
      }`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      return res.data;
    }

    const { config } = res;

    if (config.isSilent) {
      return Promise.resolve(res?.data ?? null);
    }
    if (res.data?.success === false) {
      return Promise.reject(res.data.message);
    }

    if (code === 401) {
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } else if (code === 500) {
      return Promise.reject("服务端错误");
    } else if (code !== 200) {
      return Promise.reject("error");
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error) => {
    const isEnglish = store.getters.isEnglish;
    const { config } = error;
    let errMsg = error.message;
    let { message: msg } = error;
    if (msg === "Network Error") {
      errMsg = isEnglish ? "Abnormal interface connection" : "接口连接异常";
    } else if (msg.includes("timeout")) {
      errMsg = isEnglish
        ? "System interface request timeout"
        : "系统接口请求超时";
    } else if (msg.includes("Request failed with status code")) {
      errMsg = "系统接口" + msg.substr(msg.length - 3) + "异常";
    }
    if (!config?.isSilent) {
      message.error(errMsg);
    }
    return Promise.reject(errMsg);
  }
);

export default service;
