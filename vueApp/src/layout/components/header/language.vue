<template>
  <span class="language">
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      class="iconLanguage_nlXk"
    >
      <path
        fill="currentColor"
        d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
      ></path>
    </svg>
    <span class="currentLanguage">
      <a-dropdown placement="bottomRight">
        <span class="current" @click.prevent>
          <span style="margin-right: 5px">{{ langText }}</span>
          <DownOutlined />
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="() => switchLang('cn')"> 中文 </a-menu-item>
            <a-menu-item @click="() => switchLang('en')"> English </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </span>
  </span>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { getLanguage, setLanguage } from "@/api/app";

const store = useStore();
const state = reactive({
  lang: null,
});

const langText = computed(() => {
  return {
    cn: "中文",
    en: "English",
  }[state.lang];
});

onMounted(() => {
  getLang();
});

const getLang = async () => {
  const res = await getLanguage();
  if (res.data) {
    state.lang = res.data;
    store.dispatch("app/setLang", res.data);
  }
};

const switchLang = async (lang) => {
  await setLanguage({ lang });
  getLang();
};
</script>
<style lang="scss" scoped>
.language {
  display: flex;
  align-items: center;

  .currentLanguage {
    color: white;
    display: flex;
    align-items: center;
    margin-left: 2px;
    font-size: 12px;

    .current {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}
</style>
