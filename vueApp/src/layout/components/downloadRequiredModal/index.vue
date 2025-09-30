<template>
  <Modal
    :title="title"
    v-if="state.show"
    :closable="false"
    :footer="null"
    :getContainer="getContainer"
  >
    <div v-if="state.progressList.length > 0" class="progressList">
      <div :key="type" v-for="(item, type) in state.progressList">
        <div>
          <span>
            <Lang>{{ item.desc }}</Lang>
          </span>
          <span
            v-if="item.type === 'chromeExe' && !state.isDownloadStandardEngine"
          >
            <span v-if="isEnglish">
              （This component can be resolved by manually installing
              <a @click="downloadChrome">Chrome browser</a>
              或
              <a @click="downloadEdge">Edge browser</a>
              ）
            </span>
            <span v-else>
              （此组件可通过手动安装
              <a @click="downloadChrome">Chrome浏览器</a>
              或
              <a @click="downloadEdge">Edge浏览器</a>
              解决）
            </span>
          </span>
        </div>
        <a-progress :percent="item.percent" />
      </div>
    </div>
    <div class="spin" v-else>
      <a-spin tip="downloading..."></a-spin>
    </div>
  </Modal>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import useRenderWithLang from "@/hooks/useRenderLang";
import { shellOpenExternal } from "@/api/common";

const store = useStore();

const state = reactive({
  show: false,
  progressList: [],
});

const title = useRenderWithLang(
  "下载必要的环境中...",
  "Download the necessary environment..."
);

const getContainer = () => {
  return document.getElementById("AppContainer");
};

const isEnglish = computed(() => {
  return store.getters.isEnglish;
});

onMounted(() => {
  window.electron.ipcRendererOn(
    "getRequiredEnvDownloading",
    (event, payload) => {
      if (!state.show) {
        state.show = true;
      }
      if (payload === "standard engine") {
        state.isDownloadStandardEngine = true;
      }
    }
  );
  window.electron.ipcRendererOn(
    "getRequiredEnvDownloadingSuccess",
    (event, { type }) => {
      state.progressList = state.progressList.filter(
        (item) => item.type !== type
      );
      if (state.progressList.length === 0) {
        state.show = false;
      }
    }
  );
  window.electron.ipcRendererOn(
    "getRequiredEnvDownloadingProgress",
    (event, { type, progress, url, desc }) => {
      const item = {
        type,
        progress,
        url,
        desc,
        percent: +((progress?.percent || 0) * 100).toFixed(0),
      };
      const findTypeIndex = state.progressList.findIndex(
        (one) => one.type === type
      );
      if (findTypeIndex > -1) {
        state.progressList.splice(findTypeIndex, 1, item);
      } else {
        state.progressList.push(item);
      }
    }
  );
  window.electron.ipcRenderer.send("getRequiredEnv");
});

const downloadChrome = () => {
  shellOpenExternal({
    path: "https://www.google.cn/chrome/",
  });
};

const downloadEdge = () => {
  shellOpenExternal({
    path: "https://www.microsoft.com/zh-cn/edge",
  });
};
</script>
<style lang="scss" scoped>
.progressList {
  > div + div {
    margin-top: 20px;
  }
}

.spin {
  display: flex;
  justify-content: center;
}
</style>
