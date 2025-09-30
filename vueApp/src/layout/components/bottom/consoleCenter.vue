<template>
  <a-tooltip>
    <template #title>
      <Lang>控制台（Ctrl + Shift + I）</Lang>
    </template>
    <img
      style="cursor: pointer"
      :src="ConsoleCenter"
      width="12px"
      @click="handleOpenConsole"
    />
  </a-tooltip>
</template>
<script setup lang="jsx">
import ConsoleCenter from "@/assets/svgs/console.svg";
import { openConsole } from "@/api/common";

const handleOpenConsole = () => {
  openConsole();
};
</script>

<style lang="scss" scoped></style>
