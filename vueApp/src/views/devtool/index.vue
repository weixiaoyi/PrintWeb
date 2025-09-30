<template>
  <div class="devtool">
    <div class="title">
      <span> <Lang>开发者页面, 开发者使用</Lang>！ </span>
      <a-button type="primary" @click="back">
        <Lang>返回</Lang>
      </a-button>
    </div>
    <div class="content">
      <div class="block">
        <h3>
          <Lang>压力测试</Lang>
        </h3>
      </div>
      <div class="block">
        <a-button @click="doPrintPdfTest" :loading="state.printPdfLoading">
          <Lang>打印测试</Lang>
        </a-button>
        <a-input-number
          placeholder="打印数量"
          v-model:value="state.printNum"
          :addon-after="copiesText"
        >
        </a-input-number>
      </div>
      <div class="block">
        <a-button
          :loading="state.generatePdfLoading"
          @click="doGenerateHtmlToPdf"
        >
          <Lang>生成html和Pdf测试 (仅根据固定html生成pdf)</Lang>
        </a-button>
        <a-input-number
          placeholder="生成数量"
          v-model:value="state.generatePdfNum"
          :addon-after="copiesText"
        ></a-input-number>
      </div>
      <div class="block">
        <div>
          <a-button
            @click="doPrintUploadHtmlTest"
            :disabled="!state.uploadHtmlFile"
            :loading="state.uploadHtmlLoading"
          >
            <Lang>打印上传Html测试</Lang>
          </a-button>
          <a-input-number
            placeholder="生成数量"
            v-model:value="state.uploadHtmlNum"
            :addon-after="copiesText"
          ></a-input-number>
        </div>
        <upload
          style="margin-left: 10px"
          :onChange="handleUploadHtmlFile"
          :key="state.uploadHtmlKey"
          accept=".html"
        />
      </div>
      <div class="block">
        <div>
          <a-button
            @click="doPrintUploadPdfTest"
            :disabled="!state.uploadPdfFile"
            :loading="state.uploadPdfLoading"
          >
            <Lang>打印上传Pdf测试</Lang>
          </a-button>
          <a-input-number
            placeholder="生成数量"
            v-model:value="state.uploadPdfNum"
            :addon-after="copiesText"
          ></a-input-number>
        </div>
        <upload
          style="margin-left: 10px"
          :onChange="handleUploadPdfFile"
          :key="state.uploadPdfKey"
          accept=".pdf"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="jsx">
import {
  doGenerateHtmlToPdfTest,
  doPrintTest,
  doPrintUploadHtmlFileTest,
  doPrintUploadPdfFileTest,
} from "@/api/test";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import useRenderWithLang from "@/hooks/useRenderLang";

const state = reactive({
  printNum: 1,
  generatePdfNum: 1,
  uploadPdfNum: 1,
  generatePdfLoading: false,
  printPdfLoading: false,
  uploadHtmlNum: 1,
});
const router = useRouter();

const back = router.back;

const operationSuccessText = useRenderWithLang(
  "操作成功！",
  "Successful operation!"
);

const copiesText = useRenderWithLang("份", "copies");

const doPrintPdfTest = async () => {
  state.printPdfLoading = true;
  await doPrintTest({
    num: state.printNum,
  }).finally(() => (state.printPdfLoading = false));
  message.success(operationSuccessText.value);
};

const doGenerateHtmlToPdf = async () => {
  state.generatePdfLoading = true;
  const res = await doGenerateHtmlToPdfTest({
    content: `<div>这是html片段，生成pdf测试：${dayjs(Date.now()).format(
      "YYYYMMDD HH:mm:ss"
    )}</div>`,
    pdfOptions: {
      paperFormat: "A4",
    },
    printOptions: {},
    num: state.generatePdfNum,
  }).finally(() => (state.generatePdfLoading = false));
  message.success(operationSuccessText.value);
};

const handleUploadPdfFile = (result) => {
  state.uploadPdfFile = result?.[0];
};

const doPrintUploadPdfTest = async () => {
  state.uploadPdfLoading = true;
  await doPrintUploadPdfFileTest({
    fileName: state.uploadPdfFile.fileName,
    filePath: state.uploadPdfFile.filePath,
    num: state.uploadPdfNum,
  }).finally(() => {
    state.uploadPdfKey = Date.now();
    state.uploadPdfLoading = false;
  });
  message.success(operationSuccessText.value);
};

const handleUploadHtmlFile = (result) => {
  state.uploadHtmlFile = result?.[0];
};

const doPrintUploadHtmlTest = async () => {
  state.uploadHtmlLoading = true;
  await doPrintUploadHtmlFileTest({
    fileName: state.uploadHtmlFile.fileName,
    filePath: state.uploadHtmlFile.filePath,
    num: state.uploadHtmlNum,
  }).finally(() => {
    state.uploadHtmlKey = Date.now();
    state.uploadHtmlLoading = false;
  });
  message.success(operationSuccessText.value);
};
</script>

<style lang="scss" scoped>
.devtool {
  width: 100%;
  background: white;
  padding: 20px;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content {
    margin-top: 30px;

    .block + .block {
      margin-top: 20px;
    }

    .block {
      display: flex;

      button {
        margin-right: 20px;
      }
    }
  }
}
</style>
