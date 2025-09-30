<template>
  <a
    v-for="item in showList"
    :key="item.fileId"
    @click="() => previewFile(item.fileId)"
    style="margin-right: 10px"
  >
    {{ item.fileName }}
  </a>
  <Dropdown v-if="dropList.length > 0">
    <span @click.prevent style="margin-left: 10px; cursor: pointer">
      {{ text }}
      <DownOutlined />
    </span>
    <template #overlay>
      <Menu>
        <MenuItem
          :key="item.fileId"
          v-for="item in dropList"
          @click="() => previewFile(item.fileId)"
        >
          <a style="color: #40a9ff">{{ item.fileName }}</a>
        </MenuItem>
      </Menu>
    </template>
  </Dropdown>
</template>

<script setup>
import { onMounted, defineProps, reactive, computed } from "vue";
import { DownOutlined } from "@ant-design/icons-vue";
import { Dropdown, Menu, MenuItem } from "ant-design-vue";
import { previewFile } from "@/utils/fn";

const props = defineProps({
  fileList: {
    default: [],
  },
  count: {
    default: 1,
  },
  text: {
    default: "更多文件",
  },
});

const showList = computed(() => {
  return (
    props.fileList
      ?.filter((item) => item.fileName && item.fileId)
      ?.slice(0, props.count) || []
  );
});
const dropList = computed(() => {
  return (
    props.fileList
      ?.filter((item) => item.fileName && item.fileId)
      ?.slice(props.count) || []
  );
});

onMounted(async () => {});
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  margin-bottom: 20px;

  .tab + .tab {
    margin-left: 10px;
  }

  .tab {
    background: #e6e6e6;
    box-shadow: 0px 2px 20px 0px rgba(204, 204, 204, 0.3);
    border-radius: 2px;
    color: #999999;
    padding: 5px 10px;
    cursor: pointer;

    &.active {
      background: #5b8cff;
      color: #ffffff;
    }
  }
}
</style>
