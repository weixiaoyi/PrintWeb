<template>
  <div class="tabs" :style="style" :class="className">
    <div
      class="tab"
      :class="{
        active: (item.value || index) === activeTab,
        disabled: item.disabled,
      }"
      v-for="(item, index) in tabs"
      :key="item.value"
      @click="!item.disabled && switchTab(item.value, index)"
    >
      <span>
        <Lang>{{ item.label }}</Lang>
      </span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

const store = useStore();
const props = defineProps({
  tabs: {
    default: [],
  },
  active: {
    default: "",
  },
  onChange: Function,
  style: Object,
  className: String,
});

// 注意 activeTab 非 computed, 如果active 并非一开始就确定，是动态确定的，这个组件在使用时，应该 加上 v-if = "active"，
// 或者v-if="tabs?.length > 0" 只有需要出现，才渲染组件
const activeTab = ref(props.active || props.tabs?.[0]?.value || 0);

const themeColor = computed(() => {
  return store.state.app.themeColor;
});

const switchTab = async (tabValue, index) => {
  if (props.onChange) {
    let allow = await props.onChange(tabValue, index);
    allow !== false && (activeTab.value = tabValue || index);
  }
};

onMounted(async () => {});
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  overflow-x: auto;
  min-width: 100%;
  width: 1px;

  .tab {
    white-space: nowrap;
    color: #999999;
    padding: 5px 20px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    border-left: 1px solid #e6e6e6;
    border-top: 1px solid #e6e6e6;
    border-bottom: 1px solid #e6e6e6;

    &:last-child {
      border-right: 1px solid #e6e6e6;
    }

    &.active {
      border-top: 2px solid v-bind(themeColor);
      color: v-bind(themeColor);
    }

    &.disabled {
      cursor: not-allowed;
      background: #ccc;
    }
  }
}
</style>
