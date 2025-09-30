<template>
  <Spin
    :spinning="globalLoading.loading"
    :tip="globalLoading.tip"
    wrapperClassName="globalLoading"
  >
    <div class="AppContainer" id="AppContainer">
      <WebPage v-if="isPreviewPage">
        <slot></slot>
      </WebPage>
      <ElectronPage v-else>
        <slot></slot>
      </ElectronPage>
    </div>
    <ThemeColor v-if="state.port" />
  </Spin>
</template>
<script setup lang="jsx">
import { Spin } from "ant-design-vue";
import ElectronPage from "@/AppContainer/electronPage.vue";
import WebPage from "@/AppContainer/webPage.vue";
import ThemeColor from "@/AppContainer/themeColor/index.vue";

const getHashQueryParams = () => {
  const hash = window.location.hash;
  if (hash.includes("?")) {
    const queryString = hash?.split("?")?.[1]; // 提取hash后的查询字符串
    return queryString.split("&").reduce((acc, param) => {
      const [key, value] = param.split("=");
      acc[key] = value;
      return acc;
    }, {}); // 返回指定的参数值
  }
  return {}; // 如果没有找到指定的参数或没有查询参数，返回null
};

const query = getHashQueryParams();
const store = useStore();
const state = reactive({
  showErrorPage: false,
  port: null,
});

const globalLoading = computed(() => store.state.app.globalLoading);

const themeColor = computed(() => {
  return store.state.app.themeColor;
});

const isPreviewPage = computed(() => {
  return window.location.href?.includes("viewPrintPreview");
});

onMounted(() => {});
provide("globalState", state);
provide("query", query);
</script>
<style lang="scss" scoped>
.globalLoading {
  width: 100%;
  height: 100%;

  ::v-deep(.ant-spin-container) {
    width: 100%;
    height: 100%;
  }
}

.AppContainer {
  height: 100%;

  > div {
    height: 100%;
  }

  ::v-deep {
    .ant-btn-primary {
      &:not(.ant-btn-background-ghost) {
        background: v-bind(themeColor);
      }
    }

    .ant-radio-checked .ant-radio-inner,
    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: v-bind(themeColor) !important;
      border-color: v-bind(themeColor) !important;
    }

    .ant-radio-wrapper:hover .ant-radio-inner {
      border-color: v-bind(themeColor) !important;
    }

    .ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover
      .ant-checkbox-checked:not(.ant-checkbox-disabled):after {
      border-color: v-bind(themeColor) !important;
    }

    .ant-progress .ant-progress-bg {
      background-color: v-bind(themeColor) !important;
    }
  }
}
</style>
