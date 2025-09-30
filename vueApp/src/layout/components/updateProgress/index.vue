<template>
  <div
    class="update"
    v-if="!isEmptyValue(updateProgress) && updateProgress < 100"
  >
    <div style="width: 80%">
      <a-progress :percent="updateProgress" status="active" />
      <div style="margin-top: 10px; text-align: center">
        <span>
          <Lang>
            {{
              updateProgress < 100 ? "新版本更新中，请稍后" : "新版本下载完成"
            }}
          </Lang>
          <span v-if="state.updateInfo?.version" style="margin-left: 5px">
            ({{ state.updateInfo?.version }})
          </span>
        </span>
        <span
          v-if="updateTargetVersion && updateProgress < 100"
          class="directDownload"
          @click="downloadLatest"
        >
          <Lang>速度太慢了？去这里下载</Lang>
        </span>
      </div>
      <div class="moreDownloadChannels" v-if="downloadChannels">
        <h4>
          <Lang>更多下载渠道</Lang>
        </h4>
        <ul>
          <li v-for="item in downloadChannels" :key="item.value">
            <a @click="() => openDownloadChannel(item)">{{ item.label }}</a>
          </li>
        </ul>
      </div>
      <div class="moreUpdateLogs" v-if="updateLogs">
        <h4>
          <Lang>更新日志</Lang>
        </h4>
        <ul>
          <li v-for="(item, index) in updateLogs" :key="item.value">
            <span>{{ index + 1 }}、{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import { isEmptyValue } from "@/utils/fn";
import { shellOpenExternal } from "@/api/common";

const updateProgress = ref(null);
const updateTargetVersion = ref(null);
const store = useStore();

const state = reactive({
  updateInfo: null,
  getRemoteInfosLoading: null,
  downloadChannels: null,
  updateLogs: null,
});

const downloadChannels = computed(() => {
  return state.downloadChannels?.channels?.map((item) => {
    if (store.getters.isEnglish) {
      return {
        label: item.en,
        value: item.value,
      };
    } else {
      return {
        label: item.cn,
        value: item.value,
      };
    }
  });
});

const updateLogs = computed(() => {
  return state.updateLogs?.logs?.map((item) => {
    if (store.getters.isEnglish) {
      return {
        label: item.en,
        value: item.value,
      };
    } else {
      return {
        label: item.cn,
        value: item.value,
      };
    }
  });
});

onMounted(() => {
  window.electron.ipcRendererOn(
    "global/checkAppNewVersion",
    (event, payload) => {
      if (isEmptyValue(updateProgress.value)) {
        updateProgress.value = payload;
      }
    }
  );

  window.electron.ipcRendererOn(
    "global/checkAppNewVersionInfo",
    (event, payload) => {
      if (payload) {
        const parsed = JSON.parse(payload);
        updateTargetVersion.value = parsed.path;
        state.updateInfo = parsed.info;
        if (state.getRemoteInfosLoading === null) {
          console.log(parsed, "--global/checkAppNewVersionInfo--");
          getNewVersionRemoteInfos();
        }
      }
    }
  );

  window.electron.ipcRendererOn("global/updateApp", (event, payload) => {
    updateProgress.value = payload;
  });

  window.electron.ipcRenderer.send("checkAppVersionUpdating");
});

const downloadLatest = () => {
  shellOpenExternal({
    path: "http://webprintpdf.com/downloadApp",
  });
};

const getNewVersionRemoteInfos = () => {
  state.getRemoteInfosLoading = true;
  if (state.updateInfo.downloadChannels) {
    window
      .fetch(state.updateInfo.downloadChannels + `?timestamp=${Date.now()}`, {})
      .then(async (res) => {
        if (res?.ok) {
          const result = await res.json();
          if (result?.version) {
            state.downloadChannels = result;
          }
        }
      })
      .finally(() => {
        state.getRemoteInfosLoading = false;
      });
  }
  if (state.updateInfo.updateLogs) {
    window
      .fetch(state.updateInfo.updateLogs + `?timestamp=${Date.now()}`)
      .then(async (res) => {
        if (res?.ok) {
          const result = await res.json();
          if (result?.time) {
            state.updateLogs = result;
          }
        }
      })
      .finally(() => {
        state.getRemoteInfosLoading = false;
      });
  }
};

const openDownloadChannel = (item) => {
  shellOpenExternal({
    path: item.value,
  });
};
</script>
<style lang="scss" scoped>
.update {
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1000000;
  background: rgba(255, 255, 255, 1);
}

.directDownload {
  cursor: pointer;
  margin-left: 20px;
  font-size: 12px;
  color: rgb(20, 86, 240);
}

ul,
li {
  margin: 0;
  padding: 0;
}

.moreDownloadChannels {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ul {
    margin-top: 5px;
    display: flex;

    li + li {
      margin-left: 20px;
    }
  }
}

.moreUpdateLogs {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ul {
    margin-top: 5px;

    li + li {
      margin-top: 10px;
    }

    li {
      color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
