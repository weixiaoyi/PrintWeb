<template>
  <div>
    <slot v-if="globalState.port"></slot>
    <IntervalRequest :list="[[getPortLoop, 500]]" v-else />
  </div>
</template>
<script setup lang="jsx">
import { message } from "ant-design-vue";

const [globalState] = [inject("globalState")];

const store = useStore();
const state = reactive({});

const globalLoading = computed(() => store.state.app.globalLoading);

onMounted(() => {
  init();
});

const init = () => {
  window.electron.ipcRendererOn("global/success", (event, payload) => {
    message.success(payload);
  });
  window.electron.ipcRendererOn("global/warning", (event, payload) => {
    message.warning(payload);
  });
  getInitPort();
};

const getInitPort = () => {
  window.electron.ipcRendererOn("getInitPortSuccess", (event, payload) => {
    console.log("获取端口成功", payload);
    window._port = payload;
    globalState.port = payload;
    store.dispatch("app/closeGlobalLoading");
  });
  window.electron.ipcRendererOn("getInitPortFail", (event, payload) => {
    console.log("获取端口失败", payload);
  });
};

const getPortLoop = () => {
  console.log("获取端口中...");
  if (!globalLoading.value.loading) {
    store.dispatch("app/openGlobalLoading", {
      tip: "端口初始化",
    });
  }
  window.electron.ipcRenderer.send("getInitPort");
};
</script>
<style lang="scss" scoped></style>
