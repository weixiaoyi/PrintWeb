<template>
  <span class="versionNum">
    <Lang>版本号</Lang>：{{ store.state.app.packJson?.version }}
  </span>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";

const store = useStore();
const state = reactive({});

onMounted(() => {
  window.electron.ipcRendererOn("getPackJsonSuccess", (event, payload) => {
    store.dispatch("app/setPackJson", payload);
  });
  window.electron.ipcRenderer.send("getPackJson");
});
</script>

<style lang="scss" scoped>
.versionNum {
  color: rgba(256, 256, 256, 0.5);
}
</style>
