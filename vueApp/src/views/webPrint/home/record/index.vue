<template>
  <div class="logs">
    <div class="leftRight">
      <HtmlLogs />
      <PdfLogs />
      <PrintLogs />
    </div>
  </div>
</template>

<script setup lang="jsx">
import { onMounted, reactive, useCssModule } from "vue";
import HtmlLogs from "@/views/webPrint/home/record/htmlLogs.vue";
import PdfLogs from "@/views/webPrint/home/record/pdfLogs.vue";
import PrintLogs from "@/views/webPrint/home/record/printLogs.vue";
import { getLogsExpireDay } from "@/api/logs";

const router = useRouter();
const style = useCssModule();

const state = reactive({});

onMounted(() => {
  getExpireDay();
});

const getExpireDay = async () => {
  const res = await getLogsExpireDay();
  state.logExpireDay = res.data;
};
provide("scopeState", state);
</script>

<style lang="scss" scoped>
.logs {
  flex-grow: 1;
  background: white;
  padding: 20px 0;
  padding-bottom: 0;

  .leftRight {
    display: flex;

    > div {
      flex-grow: 1;
      max-width: 33.33%;
    }

    > div + div {
      margin-left: 20px;
    }
  }
}
</style>
