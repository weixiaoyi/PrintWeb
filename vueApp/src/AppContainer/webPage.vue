<template>
  <div>
    <a-result
      status="403"
      :title="errText"
      sub-title=""
      v-if="state.showErrorPage"
    />
    <slot v-if="globalState.port"></slot>
    <Language v-if="globalState.port" style="display: none" />
  </div>
</template>
<script setup lang="jsx">
import useRenderWithLang from "@/hooks/useRenderLang";
import Language from "@/layout/components/header/language.vue";

const [globalState, query] = [inject("globalState"), inject("query")];

const store = useStore();
const state = reactive({
  showErrorPage: false,
});

const errText = useRenderWithLang(
  "地址错误，请重试！",
  "Address error. Please try again!"
);

onMounted(() => {
  init();
});

const init = () => {
  if (!query?._port) {
    state.showErrorPage = true;
  } else {
    window._port = query._port;
    globalState.port = query._port;
  }
};
</script>
<style lang="scss" scoped></style>
