<template>
  <div>
    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div class="time">
        <span style="color: #008dfd">
          <span>{{ actions.timestamp }}</span>
          <span v-if="record.success === false" style="color: red">
            <a-tooltip :title="record.msg">
              失败 <ExclamationCircleOutlined />
            </a-tooltip>
          </span>
        </span>
      </div>
      <span class="operation">
        <span class="spentTime">{{ actions.spentTime }} s</span>
        <a v-if="record.pdfPath || record.htmlPath">
          <img
            :src="Folder"
            :width="15"
            @click="
              () => {
                handleShellShowItemInFolder({
                  path: {
                    html: record.htmlPath,
                    pdf: record.pdfPath,
                  }[type],
                });
              }
            "
          />
        </a>
        <a v-if="record.pdfUrl || record.htmlUrl">
          <img
            :src="Browser"
            :width="15"
            @click="
              () => {
                handleShellOpenExternal({
                  path: {
                    html: record.htmlUrl,
                    pdf: record.pdfUrl,
                  }[type],
                });
              }
            "
          />
        </a>
      </span>
    </div>
    <span style="word-break: break-all" class="textShow">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="jsx">
import { onMounted, reactive } from "vue";
import { shellOpenExternal, shellShowItemInFolder } from "@/api/common";
import Folder from "@/assets/svgs/folder.svg";
import Browser from "@/assets/svgs/browser.svg";
import dayjs from "dayjs";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  record: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
  },
  text: {
    type: String,
  },
});

const actions = computed(() => {
  return {
    timestamp: dayjs(props.record.timestamp).format("MM-DD HH:mm:ss"),
    spentTime: (props.record.spentTime / 1000).toFixed(2),
  };
});

const state = reactive({});

onMounted(() => {});

const handleShellShowItemInFolder = (params) => {
  shellShowItemInFolder(params);
};

const handleShellOpenExternal = (params) => {
  shellOpenExternal(params);
};
</script>

<style lang="scss" scoped>
.time {
  display: flex;
}

.operation {
  display: flex;
  align-items: center;
  line-height: 1;

  .spentTime {
    line-height: 1;
    margin-right: 10px;
    display: flex;
    align-items: center;
    color: rgb(82, 196, 26);
    font-size: 12px;
  }

  a + a {
    margin-left: 10px;
  }
}

.textShow {
}
</style>
