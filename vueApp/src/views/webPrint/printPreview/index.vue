<template>
  <div class="printPreview" id="_printPreview">
    <div v-if="state.paramsIsNotValid" class="errorPage">
      <a-result status="403" :title="errText" sub-title="" />
    </div>
    <a-spin :spinning="state.loading" v-else>
      <div v-if="state.loading" style="min-height: 200px">Loading...</div>
      <Preview
        v-else
        :pdfParams="activeOne"
        :switchTo="switchTo"
        :files="state.files"
        :activeIndex="state.activeIndex"
        :key="state.activeIndex"
      />
    </a-spin>
  </div>
</template>

<script setup lang="jsx">
import { useRouter } from "vue-router";
import { batchSearchPdf } from "@/api/printPreview";
import { message } from "ant-design-vue";
import Preview from "./preview.vue";
import useRenderWithLang from "@/hooks/useRenderLang";

const router = useRouter();
const route = useRoute();

const state = reactive({
  loading: true,
  params: null,
  files: [],
  activeIndex: 0,
});

const errText = useRenderWithLang(
  "地址错误 或 文件已经被清除！",
  "Address error or file has been cleared！"
);

const activeOne = computed(() => {
  return state.files[state.activeIndex];
});

onMounted(() => {
  init();
});

const init = () => {
  checkQuery();
};

const switchTo = (to) => {
  if (to === -1) {
    state.activeIndex -= 1;
  } else if (to === 1) {
    state.activeIndex += 1;
  } else if (to === 0) {
    state.activeIndex = 0;
  }
};

const checkQuery = async () => {
  if (!route.query?.printParams) {
    state.paramsIsNotValid = true;
    return;
  }
  const printParams = decodeURIComponent(route.query.printParams);
  if (!printParams) {
    state.paramsIsNotValid = true;
    return;
  }
  let params = null;
  try {
    params = JSON.parse(printParams);
  } catch (err) {
    state.paramsIsNotValid = true;
    return;
  }
  if (!Array.isArray(params)) {
    state.paramsIsNotValid = true;
    return;
  }
  if (!params.every((param) => param?.pdfFileName && param?.printOptions)) {
    state.paramsIsNotValid = true;
    return;
  }
  state.params = params;
  await getParams();
};

const getParams = async () => {
  state.loading = true;
  await batchSearchPdf({
    pdfs: state.params,
  })
    .then((result) => {
      state.files = result?.data || [];
    })
    .catch((err) => {
      state.paramsIsNotValid = true;
      message.error(err);
    })
    .finally(() => {
      state.loading = false;
    });
};
</script>

<style lang="scss" scoped>
.printPreview {
  height: 100%;

  .errorPage {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
