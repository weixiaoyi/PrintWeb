<template>
  <div class="fixed-header">
    <div class="left">
      <div v-if="state.finished">
        <div v-if="state.title" v-html="state.title"></div>
        <Lang v-else>{{ title }}</Lang>
      </div>
    </div>
    <div class="right">
      <Language />
    </div>
  </div>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import Language from "./language.vue";
import { getTitle } from "@/api/app";

const store = useStore();
const state = reactive({});

const themeColor = computed(() => {
  return store.state.app.themeColor;
});

onMounted(() => {
  window.electron.ipcRendererOn("setTitleSuccess", getTitles);
  getTitles();
});

const title = "Web打印专家";

const getTitles = async () => {
  const res = await getTitle().finally(() => {
    state.finished = true;
  });
  state.title = res.data;
};
</script>
<style lang="scss" scoped>
.fixed-header {
  color: white;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: 100%;
  height: 40px;
  padding: 0 20px;
  background: v-bind(themeColor);
  display: flex;
  align-items: center;
  justify-content: space-between;

  * {
    line-height: 1;
  }

  .left {
    ul {
      display: flex;
      align-items: center;
      height: 100%;

      li {
        cursor: pointer;
        font-size: 16px;
        font-weight: 400;
      }
    }
  }

  .right {
  }
}
</style>
