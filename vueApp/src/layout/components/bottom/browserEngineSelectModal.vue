<template>
  <Modal
    :title="title"
    v-if="true"
    :closable="true"
    :footer="null"
    @cancel="close"
    :getContainer="getContainer"
  >
    <Lang>当前PDF引擎</Lang>
    ：{{ channel }}
    <a-button
      block
      type="primary"
      style="margin-top: 20px"
      @click="switchToStandardPdfEngine"
    >
      <Lang>下载标准引擎</Lang>
    </a-button>
  </Modal>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import useRenderWithLang from "@/hooks/useRenderLang";
import { downloadStandardPdfEngine } from "@/api/app";

const props = defineProps(["close", "forceDownload"]);
const store = useStore();

const state = reactive({
  show: false,
  progressList: [],
});

const title = useRenderWithLang("PDF 引擎", "PDF Engine");

const channel = computed(() => {
  const analysisData = store.state.app.analysisData;
  return analysisData?.chromeExeChannel;
});

onMounted(() => {});

const getContainer = () => {
  return document.getElementById("AppContainer");
};

const switchToStandardPdfEngine = async () => {
  await downloadStandardPdfEngine({
    forceDownload: !!props.forceDownload,
  });
  props.close && props.close();
};
</script>
<style lang="scss" scoped></style>
