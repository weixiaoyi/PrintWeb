import { createApp } from "vue";
import Cookies from "js-cookie";

import App from "./App";
import store from "./store";
import router from "./router";

import { install } from "@icon-park/vue-next/es/all";
import "@icon-park/vue-next/styles/index.css";
import "ant-design-vue/dist/reset.css";
import "@/assets/styles/index.scss"; // global css
import "./app.css";

import "./permission";

import dayjs from "dayjs";

import Modal from "@/components/Modal";

import Form from "@/components/Form";

import IntervalRequest from "@/components/IntervalRequest";

import Lang from "@/components/Lang";

// 使用jquery
import $ from "jquery";

window.$ = $;
const app = createApp(App);

// 全局方法挂载
app.config.globalProperties.dayjs = dayjs;
app.config.globalProperties.Cookies = Cookies;

// 全局错误处理，避免开发环境的错误卡住页面
app.config.errorHandler = (err, vm, info) => {
  console.error(err);
};
// 全局组件挂载
app.component("Form", Form);
app.component("Modal", Modal);
app.component("IntervalRequest", IntervalRequest);
app.component("Lang", Lang);

app.use(router);
app.use(store);

install(app);
app.mount("#app");
