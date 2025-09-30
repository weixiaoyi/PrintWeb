<template>
  <div class="progress" v-if="state.show">
    <div class="bar" style="width: 60px; margin-right: 10px">
      <a-progress
        v-if="state.showCertainProgress"
        :showInfo="false"
        :stroke-color="{
          '0%': '#108ee9',
          '90%': '#87d068',
        }"
        :percent="(state.progress || 0) * 100"
        status="active"
      />
      <a-progress
        v-if="state.showNotCertainProgress"
        :showInfo="false"
        :stroke-color="{
          '0%': '#108ee9',
          '90%': '#87d068',
        }"
        :percent="99.9"
        status="active"
      />
    </div>
    <span v-if="state.title" class="title">{{ state.title }}</span>
  </div>
</template>
<script setup lang="jsx">
import { onMounted, reactive } from "vue";

const state = reactive({
  show: false,
  title: null,
  showCertainProgress: false,
  showNotCertainProgress: false,
});

onMounted(() => {
  window.electron.ipcRendererOn("appProgress", (event, payload) => {
    const { progress, title } = payload || {};
    if (
      progress === null ||
      progress === "" ||
      progress === "undefined" ||
      progress === 1 ||
      progress <= 0
    ) {
      state.show = false;
      state.title = null;
      state.showCertainProgress = false;
      state.showNotCertainProgress = false;
    } else {
      state.show = true;
      state.progress = progress;
      if (progress > 1) {
        // 不确定的进度， 实现脉冲式
        state.showNotCertainProgress = true;
        state.showCertainProgress = false;
      } else if (progress > 0 && progress < 1) {
        //具体的进度
        state.showCertainProgress = true;
        state.showNotCertainProgress = false;
      }
      state.title = title;
    }
  });
});
</script>

<style lang="scss" scoped>
.progress {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  margin-left: 10px;

  * {
    line-height: 1 !important;
  }

  ::v-deep {
    .ant-progress-line {
      margin: 0;
      height: 8px;
      padding: 0;
    }

    .ant-progress .ant-progress-inner {
      padding: 0;
      margin: 0;
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .bar {
    position: relative;
    top: -2px;
  }

  .title {
    letter-spacing: 2px;
  }
}
</style>
