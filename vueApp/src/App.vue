<template>
  <AppContainer>
    <a-config-provider :locale="locale">
      <router-view v-if="isRouterAlive" />
    </a-config-provider>
  </AppContainer>
</template>
<script>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import "dayjs/locale/zh-cn";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import Clipboard from "clipboard";
import { message } from "ant-design-vue";
import useRenderWithLang from "@/hooks/useRenderLang";
import AppContainer from "./AppContainer/index.vue";

dayjs.locale("zh-cn");
export default {
  name: "App",
  methods: {},
  components: {
    AppContainer,
  },
  setup() {
    const store = useStore();
    const locale = computed(() => {
      const isEnglish = store.getters.isEnglish;
      return isEnglish ? null : zhCN;
    });
    // 局部组件刷新
    const isRouterAlive = ref(true);
    const reload = () => {
      isRouterAlive.value = false;
      nextTick(() => {
        isRouterAlive.value = true;
      });
    };
    provide("reload", reload);

    const copySuccessText = useRenderWithLang("复制成功！", "Copy Success!");

    onMounted(() => {
      const clipboard = new Clipboard(".clipboardBtn");
      clipboard.on("success", function (e) {
        message.success(copySuccessText.value);
      });
    });
    return {
      isRouterAlive,
      locale,
    };
  },
};
</script>
<style lang="scss"></style>
