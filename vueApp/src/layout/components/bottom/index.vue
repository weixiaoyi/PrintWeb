<template>
  <div class="bottom">
    <div class="left">
      <span>
        <ConsoleCenterCom />
      </span>
      <span>
        <AppProgress />
      </span>
    </div>
    <div class="middle"></div>
    <div class="right">
      <div style="margin-right: 10px">
        <AnalysisData />
      </div>
      <div style="margin-right: 10px">
        <BrowserEngine />
      </div>
      <div>
        <Version />
      </div>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import ConsoleCenterCom from "./consoleCenter.vue";
import AnalysisData from "@/layout/components/bottom/analysisData.vue";
import Version from "@/layout/components/bottom/version.vue";
import BrowserEngine from "@/layout/components/bottom/browserEngine.vue";
import AppProgress from "@/layout/components/bottom/appProgress.vue";

const store = useStore();
const router = useRouter();

const state = reactive({});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  line-height: 1;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 20px;
  background: black;
  color: white;
  font-size: 10px;

  .left {
    display: flex;
    align-items: center;
  }

  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
