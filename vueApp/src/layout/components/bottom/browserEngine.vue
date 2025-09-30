<template>
  <span>
    <a-tooltip>
      <template #title v-if="canDownloadChromium">
        <Lang>点击下载标准引擎</Lang>
      </template>
      <img :src="EnvLogo" width="12px" @click="switchEngine" alt="pdf engine" />
    </a-tooltip>

    <BrowserEngineSelectModal
      v-if="state.engineModal.show"
      :forceDownload="state.engineModal.forceDownload"
      :close="
        () => {
          state.engineModal.show = false;
          state.engineModal.forceDownload = false;
        }
      "
    />
  </span>
</template>
<script setup lang="jsx">
import { computed, onMounted } from "vue";
import Chrome from "@/assets/svgs/chrome.svg";
import Chromium from "@/assets/svgs/chromium.svg";
import ChromeGray from "@/assets/svgs/chromiumGray.svg";
import Edge from "@/assets/svgs/edge.svg";
import BrowserEngineSelectModal from "@/layout/components/bottom/browserEngineSelectModal.vue";

const store = useStore();

const state = reactive({
  engineModal: {
    show: false,
  },
});

const EnvLogo = computed(() => {
  const analysisData = store.state.app.analysisData;
  return analysisData?.chromeExeChannel === "chromium"
    ? Chromium
    : analysisData?.chromeExeChannel === "chrome"
    ? Chrome
    : analysisData?.chromeExeChannel === "edge"
    ? Edge
    : ChromeGray;
});

const canDownloadChromium = computed(() => {
  const analysisData = store.state.app.analysisData;
  return analysisData?.chromeExeChannel !== "chromium";
});

onMounted(() => {
  window.electron.ipcRendererOn("AutoSelectBrowserEngine", () => {
    state.engineModal.show = true;
    state.engineModal.forceDownload = true;
  });
});

const switchEngine = () => {
  if (canDownloadChromium.value) {
    state.engineModal.show = true;
  }
};
</script>

<style lang="scss" scoped></style>
