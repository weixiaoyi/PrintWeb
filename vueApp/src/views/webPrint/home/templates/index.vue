<template>
  <div class="templates">
    <EditTemplate v-if="state.view.name === 'edit'" />
    <CommonTemplate v-else />
  </div>
</template>

<script setup lang="jsx">
import { onMounted, reactive } from "vue";
import CommonTemplate from "./commonTemplate.vue";
import EditTemplate from "./editTemplate.vue";

const state = reactive({
  view: {
    name: "main",
    data: null,
  },
});

onMounted(() => {});

provide("switchView", (view, viewData) => {
  state.view.data = viewData;
  state.view.name = view;
});

provide("globalState", state);
</script>

<style lang="scss" scoped>
.templates {
  padding: 10px;
}
</style>
