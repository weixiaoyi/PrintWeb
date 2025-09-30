<template>
  <div class="app-wrapper">
    <Headers />
    <div class="main-container" style="background-color: #ebebeb">
      <div style="display: flex; margin-top: 40px; flex-grow: 1">
        <div style="flex-grow: 1" class="mainContentWrapper">
          <app-main />
        </div>
      </div>
    </div>
    <Bottom />
    <UpdateProgress />
    <DownLoadRequiredModal />
    <CheckNotice />
  </div>
</template>

<script setup>
import { AppMain } from "./components";
import UpdateProgress from "@/layout/components/updateProgress/index.vue";
import Headers from "@/layout/components/header";
import Bottom from "@/layout/components/bottom/index.vue";
import DownLoadRequiredModal from "@/layout/components/downloadRequiredModal/index.vue";
import CheckNotice from "@/layout/components/checkNotice/index.vue";
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #eaeaea;
}

.main-container {
  flex: 1;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.mainContentWrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
