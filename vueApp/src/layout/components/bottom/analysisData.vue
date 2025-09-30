<template>
  <RenderDom :render="PrinterAnalysisDataRender" />
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import { message } from "ant-design-vue";
import { getAnalysisData, resetAnalysisData } from "@/api/dataAnalysis";
import RenderDom from "@/components/RenderDom";
import Reset from "@/assets/svgs/reset.svg";
import useRenderWithLang from "@/hooks/useRenderLang";

const store = useStore();
const router = useRouter();
let sse;

const state = reactive({
  times: 0,
  analysisData: null,
});

const resetAnalysisDataText = useRenderWithLang(
  "重置任务数据",
  "Reset Task Data"
);

const resetSuccessText = useRenderWithLang("重置成功", "Reset successful");

const showAmount = (num, desc) => {
  let result;
  if (num && num > 100) {
    result = "99+";
  } else {
    result = num;
  }
  return (
    <a-tooltip
      title={
        <span>
          <Lang>{desc}</Lang>：{num}
        </span>
      }
    >
      {result}
    </a-tooltip>
  );
};

const PrinterAnalysisDataRender = () => {
  const printPdfStates = state.analysisData?.printPdfStates;
  const generatePdfStates = state.analysisData?.generatePdfStates;
  return (
    <span
      style="display:flex;align-items:center;color:rgba(256,256,256,.5);cursor:pointer"
      onClick={() => {
        const isDev = process.env.NODE_ENV === "development";
        state.times++;
        if (isDev) {
          if (state.times === 1) {
            state.times = 0;
            router.push({
              name: "devTool",
            });
          }
        } else {
          if (state.times === 5) {
            state.times = 0;
            router.push({
              name: "devTool",
            });
          }
        }
      }}
    >
      {showAmount(
        generatePdfStates?.executeTasksLength,
        "正在执行pdf生成的任务"
      )}
      .{showAmount(generatePdfStates?.tasksLength, "在排队的pdf生成任务")}.
      {showAmount(generatePdfStates?.historyTaskLength, "历史pdf生成任务")}
      <span style="margin:0 2px">|</span>
      {showAmount(
        printPdfStates?.spawnProcessForceCloseNum,
        "打印进程强制关闭数量"
      )}
      .
      {showAmount(
        printPdfStates?.spawnProcessAutoCloseNum,
        "打印进程自动关闭数量"
      )}
      .{showAmount(printPdfStates?.spawnProcessStartNum, "打印进程启动数量")}
      <span style="margin:0 2px">|</span>
      {showAmount(printPdfStates?.executeTasksLength, "正在执行打印的任务")}.
      {showAmount(printPdfStates?.tasksLength, "在排队的打印任务")}.
      {showAmount(printPdfStates?.historyTaskLength, "历史打印任务")}
      {!printPdfStates?.tasksLength &&
        printPdfStates?.executeTasksLength < 5 &&
        !generatePdfStates?.tasksLength &&
        generatePdfStates?.executeTasksLength < 5 && (
          <span style="margin-left:5px">
            <a-tooltip title={resetAnalysisDataText.value}>
              <img src={Reset} width="12px" onClick={handleResetAnalysisData} />
            </a-tooltip>
          </span>
        )}
    </span>
  );
};

onMounted(() => {
  handleGetPrinterAnalysisData();
});

onBeforeUnmount(() => {
  if (sse) {
    sse.close();
  }
});

const handleGetPrinterAnalysisData = async () => {
  sse = new EventSource(getAnalysisData());
  sse.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data) {
      state.analysisData = data;
      store.dispatch("app/setAnalysisData", data);
    }
  };
};

const handleResetAnalysisData = async (e) => {
  e.stopPropagation();
  await resetAnalysisData();
  message.success(resetSuccessText.value);
};
</script>

<style lang="scss" scoped></style>
