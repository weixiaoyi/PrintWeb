<template>
  <span>
    <span v-if="mode === 2">
      <span class="clipboardBtn" :data-clipboard-target="'#' + state.id">
        <img :src="copy" width="16px" style="margin-right: 10px" />
      </span>
      <span :id="state.id"><slot></slot></span>
    </span>
    <span v-else>
      <span :id="state.id"><slot></slot></span>
      <span class="clipboardBtn" :data-clipboard-target="'#' + state.id">
        <img :src="copy" width="16px" style="margin-left: 10px" />
      </span>
    </span>
  </span>
</template>

<script lang="jsx" setup>
import { onMounted } from "vue";
import { uuid } from "@/utils/fn";
import copy from "@/assets/svgs/copy.svg";

const props = defineProps({
  mode: {
    type: Number,
    default: 1,
  },
});

const state = reactive({
  id: uuid("_copy"),
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.clipboardBtn {
  cursor: pointer;
}
</style>
