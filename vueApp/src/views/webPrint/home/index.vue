<template>
  <div class="home">
    <a-spin :spinning="state.loading">
      <Tabs
        :tabs="tabs"
        :active="state.activeTab"
        :onChange="doSwitchTab"
        :key="state.activeTab"
      ></Tabs>
      <Component :is="ActiveComponent" />
    </a-spin>
  </div>
</template>

<script setup lang="jsx">
import { useRouter } from "vue-router";
import Tabs from "@/components/Tabs";
import Examples from "./examples/index.vue";
import Printers from "./printers";
import Record from "./record";
import Templates from "./templates";
import BasicInfo from "./basicInfo";
import ContactUs from "./concatUs";
import { getTabsVisibility } from "@/api/app";

const router = useRouter();

const state = reactive({
  activeTab: "BasicInfo",
});

onMounted(() => {
  window.electron.ipcRendererOn("switchTabsVisibilitySuccess", getTabs);
  getTabs();
});

const tabs = computed(() => {
  return [
    {
      label: "基本信息",
      value: "BasicInfo",
    },
    {
      label: "打印机",
      value: "Printers",
    },
    {
      label: "日志",
      value: "Logs",
    },
    {
      label: "运行示例",
      value: "Run Example",
    },
    {
      label: "联系我们",
      value: "ContactUs",
    },
  ]
    .map((item) => {
      return {
        ...item,
        show:
          state.tabsVisibility?.find((one) => one.name === item.value)
            ?.visible !== false,
      };
    })
    .filter((item) => item.show !== false);
});

watch(
  () => tabs.value.length,
  () => {
    state.activeTab = tabs.value?.[0]?.value;
  }
);

const ActiveComponent = computed(() => {
  return {
    BasicInfo: BasicInfo,
    "Run Example": Examples,
    Printers: Printers,
    Logs: Record,
    Templates: Templates,
    ContactUs: ContactUs,
  }[state.activeTab];
});

const doSwitchTab = (value) => {
  state.activeTab = value;
};

const getTabs = async () => {
  state.loading = true;
  const res = await getTabsVisibility().finally(() => {
    state.loading = false;
  });
  state.tabsVisibility = res.data;
};
</script>

<style lang="scss" scoped>
.home {
  flex-grow: 1;
  background: white;
  margin-top: 0;
  padding: 15px 10px 20px;
}
</style>
