<template>
  <div class="examples">
    <div class="util">
      <a-select
        v-model:value="state.methodName"
        :options="methodOptions"
        style="width: 200px"
        placeholder="请选择方法"
      />
      <a-button type="primary" @click="handleRun" :loading="state.loading">
        <Lang>运行</Lang>
      </a-button>
    </div>
    <div class="mirrorLay">
      <CodemirrorJson
        :code="state.code"
        ref="codeRef"
        :onChange="handleChange"
        lang="js"
        :reset="reset"
        :errMessage="state.runResult"
      />
    </div>
  </div>
</template>

<script setup lang="jsx">
import { message } from "ant-design-vue";
import CodemirrorJson from "./codemirrorJson/index";
import {
  getCommonOptions,
  getCommonString,
  getCommonStringReplaceStr,
  getHtmlBase64,
  getImageBase64,
  getPdfBase64,
} from "@/views/webPrint/home/examples/generateCode";
import { getStore, updateStore } from "@/api/electronStore";
import { debounce } from "lodash";
import { Localstorage } from "@/utils/fn";
import { shellOpenExternal } from "@/api/common";
import useRenderWithLang from "@/hooks/useRenderLang";

const state = reactive({
  methodName: null,
  code: "",
  keysInit: {},
});

const codeRef = ref();

const methodOptions = ref(
  [
    {
      label: "printHtml",
    },
    {
      label: "printHtmlByUrl",
    },
    {
      label: "printHtmlByBase64",
    },
    {
      label: "printPdfByUrl",
    },
    {
      label: "printPdfByBase64",
    },
    {
      label: "printImageByUrl",
    },
    {
      label: "printImageByBase64",
    },
    {
      label: "batchPrint",
    },
  ].map((item) => ({
    label: item.label,
    value: item.label,
  }))
);

const operationSuccessText = useRenderWithLang(
  "操作成功！",
  "Successful operation!"
);

watch(
  () => state.methodName,
  async (val) => {
    if (val) {
      state.keysInit = {};
      Localstorage.set("exampleMethod", val);
      const storageValueRes = await getStore({ key: val });
      if (storageValueRes?.data) {
        codeRef.value && codeRef.value.setValue(storageValueRes.data);
      } else {
        setDefaultValue(val);
      }
    }
  }
);

const handleRun = async () => {
  try {
    state.runResult = null;
    const code = codeRef.value
      .getValue()
      .replace(getCommonStringReplaceStr(), "");
    const value = eval("(" + code + ")");
    state.loading = true;
    const res = await value();
    if (res?.data?.printPreviewUrl) {
      shellOpenExternal({
        path: res.data.printPreviewUrl,
      });
    }
    console.log(res);
    message.success(operationSuccessText.value);
  } catch (err) {
    if (err?.message) {
      state.runResult = err.message;
    } else if (err?.code && err.type === "close") {
      state.runResult = `catch Websocket connection error code: ${err?.code}`;
    } else if (typeof err === "string") {
      state.runResult = err;
    } else {
      state.runResult = `caught an unknown error: ${err}`;
    }
    message.warning(err.message);
    return Promise.reject(err);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  const findOne = methodOptions.value.find(
    (one) => one.value === Localstorage.get("exampleMethod")
  );
  state.methodName = findOne?.value || "printHtml";
});

const handleShellOpenExternal = (params) => {
  shellOpenExternal(params);
};

const handleChange = debounce((value) => {
  if (!state.keysInit[state.methodName]) {
    state.keysInit[state.methodName] = true;
  } else {
    updateStore({
      key: state.methodName,
      value: value,
    });
  }
}, 500);

const setDefaultValue = (methodName) => {
  let fun;
  if (methodName === "printHtml") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printHtml
    getCommonOptions();
    const content = \`<div>have a nice day!</div>\`;
    const res = await webPrintPdf.printHtml(content, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printHtmlByUrl") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printHtmlByUrl
    getCommonOptions();
    const url = "http://127.0.0.1:${window._port}/api/test/getTestHtml";
    const res = await webPrintPdf.printHtmlByUrl(url, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printHtmlByBase64") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printHtmlByBase64
    getCommonOptions();
    const htmlBase64 = getHtmlBase64();
    const res = await webPrintPdf.printHtmlByBase64(htmlBase64, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printPdfByUrl") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printPdfByUrl
    getCommonOptions();
    const url = "http://127.0.0.1:${window._port}/api/test/getTestPdf";
    const res = await webPrintPdf.printPdfByUrl(url, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printPdfByBase64") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printPdfByBase64
    getCommonOptions();
    const pdfBase64= getPdfBase64();
    const res = await webPrintPdf.printPdfByBase64(pdfBase64, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printImageByUrl") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printImageByUrl
    getCommonOptions();
    const url = "http://127.0.0.1:${window._port}/api/test/getTestImage";
    pdfOptions.landscape = true;
    printOptions.landscape = true;
    const res = await webPrintPdf.printImageByUrl(url, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "printImageByBase64") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：printImageByBase64
    getCommonOptions();
    const base64 = getImageBase64();
    pdfOptions.landscape = true;
    printOptions.landscape = true;
    const res = await webPrintPdf.printImageByBase64(base64, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  } else if (methodName === "batchPrint") {
    fun = `async function handleClick() {
    // 这里的内容，可自由编辑 （editable），当前方法：batchPrint
    getCommonOptions();
    // printTaskListItem: [{ data: '', type: '', pdfOptions:{}, printOptions:{}, extraOptions:{}  }];
    // printTaskList :[printTaskListItem, printTaskListItem,...], printTaskListItem 的配置项pdfOptions、printOptions、extraOptions 会与batchPrint的做浅层合并，并优先于batchPrint的配置.
    const printTaskList = [{ data: "<div>have a nice day!</div>", type: 'printHtml', pdfOptions:{ margin:{ top:10, left:10, right:10, bottom:10 } } }, { data: "http://127.0.0.1:16794/api/test/getTestPdf", type: 'printPdfByUrl' }];
    const res = await webPrintPdf.batchPrint(printTaskList, pdfOptions, printOptions, extraOptions);
    consoleLogHandleOnClickRes;
    }`;
  }
  if (fun) {
    state.code = `${getCommonString()}${fun
      .toString()
      .replace("getCommonOptions();", getCommonOptions())
      .replace("getHtmlBase64();", `"${getHtmlBase64()}"`)
      .replace("getPdfBase64();", `"${getPdfBase64()}"`)
      .replace("getImageBase64();", `"${getImageBase64()}"`)
      .replace("extraOptions);", "extraOptions);\n")
      .replace("consoleLogHandleOnClickRes;", "return res;\n")}`;
    codeRef.value && codeRef.value.setValue(state.code);
  } else {
    codeRef.value && codeRef.value.setValue("");
  }
};

const reset = () => {
  setDefaultValue(state.methodName);
  state.runResult = null;
  message.success(operationSuccessText.value);
};
</script>

<style lang="scss" scoped>
.examples {
  padding: 20px 0;

  .util {
    display: flex;
    margin-bottom: 20px;

    button {
      margin-left: 20px;
    }
  }

  .mirrorLay {
  }
}
</style>
