<template>
  <Upload
    withCredentials
    @change="(params) => uploadFileChange(params)"
    @remove="remove"
    :fileList="fileListNormalized"
    :beforeUpload="beforeUpload"
    :accept="uploadDefaultAcceptTypes"
    :disabled="disabled"
    :multiple="multiple"
    :class="{
      textUpload: uploadType === 'text',
      noneFileList: showFileList === false,
    }"
  >
    <span>
      <Button
        v-if="uploadType !== 'text'"
        :type="uploadType"
        :disabled="disabled"
        :loading="state.loading"
        v-bind="buttonProps"
      >
        <UploadOutlined v-if="prefixIconShow"></UploadOutlined>
        <Lang>
          {{ state.loading ? "上传中" : props.uploadText || "上传文件" }}
        </Lang>
        <RenderDom :render="renderSuffix" v-if="renderSuffix" />
        <Tooltip v-if="isNeedTips" overlayClassName="upload__tip">
          <template #title>
            <div><Lang>支持上传类型</Lang>： {{ acceptTipText }}</div>
          </template>
          <QuestionCircleOutlined class="ml-8" />
        </Tooltip>
      </Button>
    </span>
    <template #itemRender="{ file, actions }">
      <div
        class="fileList"
        v-if="file.name && props.showFileList"
        style="margin-top: 10px; word-break: break-all"
      >
        <a
          @click="() => handleFileClick(file)"
          style="cursor: pointer; color: #005aac"
        >
          {{ file.name }}
        </a>
        <a
          href="javascript:;"
          @click="actions.remove"
          v-if="!disabled && uploadType !== 'text' && canDelete"
          style="margin-left: 10px"
        >
          <DeleteOutlined />
        </a>
      </div>
    </template>
  </Upload>
</template>

<script setup>
import { Button, message, Tooltip, Upload } from "ant-design-vue";
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";
import { previewFile } from "@/utils/fn.js";
import { uploadFile } from "@/api/publicFile";
import { computed, defineEmits, reactive, watch } from "vue";
import uploadDefaultAcceptTypes from "@/components/Form/uploadDefaultAcceptTypes";
import RenderDom from "@/components/RenderDom";
import Lang from "@/components/Lang/index.vue";

const props = defineProps({
  value: {
    type: Array,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  uploadType: {
    // 当这个等于text时，不展示上传按钮，只展示文件列表
    type: String,
    default: "default",
  },
  uploadText: {
    type: String,
    default: "上传文件",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  onChange: {
    type: Function,
  },
  remove: {
    type: Function,
    /* upload 组件如果要单独写文件删除逻辑（直接走接口一个个删除）有两种做法，
     * 一是用这个 remove 函数去做;
     * 二是用 props.onChange 里去做，onChange 是可以接收三个参数的，这个看下面的 uploadFileChange 可以了解
     * remove 函数如果在函数末尾直接返回 false， 可以做到文件不消失，删除接口成功后，通过刷新文件列表接口再消失的效果
     * remove 函数如果传递了，uploadFileChange 就不会生效
     *  */
  },
  onFileClick: {
    type: Function,
  },
  canPreview: {
    type: Boolean,
    default: true,
  },
  canDelete: {
    type: Boolean,
    default: true,
  },
  fn: {
    type: Function,
  },
  showFileList: {
    type: Boolean,
    default: true,
  },
  prefixIconShow: {
    type: Boolean,
    default: true,
  },
  renderSuffix: {
    // 增加自定义后缀，任务JSX Dom，一般展示提示、帮助信息
    type: Function,
    required: false,
  },
  isNeedTips: {
    type: Boolean,
    default: true,
  },
  buttonProps: {
    type: Object,
  },
});
const attrs = useAttrs();

const emit = defineEmits(["update:value"]);

const stringfy = (v) => {
  try {
    return JSON.stringify(v);
  } catch (e) {
    return v;
  }
};

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (stringfy(newValue) !== stringfy(oldValue)) {
      state.fileList = newValue;
    }
  },
  {
    deep: true,
  }
);
const state = reactive({
  fileList: props.value,
  loading: false,
  targetFileList: [],
});

// 支持类型提示
const acceptTipText = computed(() => {
  const accept = attrs.accept || uploadDefaultAcceptTypes;
  const acceptTypesText = Array.isArray(accept)
    ? accept.join("，")
    : accept.replace(/,/g, "，");
  return `${acceptTypesText}`;
});

const fileListNormalized = computed(() => {
  let list = state.fileList;
  if (typeof list === "string" || typeof list === "number") {
    list = [{ id: state.fileList }];
  }
  return (list || [])?.map((item) => ({
    ...item,
    percent: 0,
    name: item.name || `${item.id ? "文件id " + item.id : ""}`,
  }));
});

const beforeUpload = (file, fileList = []) => {
  state.targetFileList = fileList;
  return false;
};

const checkMaxCount = () => {
  if (
    attrs.maxCount &&
    (state.targetFileList.length > attrs.maxCount ||
      state.fileList?.length >= attrs.maxCount)
  ) {
    message.error(`最多上传 ${attrs.maxCount} 个文件`);
    return false;
  }
  return true;
};

const uploadFileChange = async (UploadChangeParam) => {
  console.log(UploadChangeParam, "----文件上传 params");
  let value;
  let changeFile; // 每一次的变化文件, 新增的或删除的
  let action = "";
  if (UploadChangeParam.file.status === "removed") {
    value = fileListNormalized.value.filter(
      (item) => item.id !== UploadChangeParam.file.id
    );
    changeFile = fileListNormalized.value.find(
      (item) => item.id === UploadChangeParam.file.id
    );
    action = "remove";
  } else {
    if (!checkMaxCount()) return;
    if (
      UploadChangeParam?.fileList?.some(
        (one) =>
          one.name?.substring(0, one.name?.lastIndexOf("."))?.length > 100
      )
    ) {
      return message.warning("文件名称长度不能超过100个字符！");
    }
    state.loading = true;
    let fun = props.fn || uploadFile;
    let formData = new FormData();
    formData.append("file", UploadChangeParam.fileList[0].originFileObj);
    let res = await fun(formData)
      ?.catch((err) => {
        state.loading = false;
        return Promise.reject(err);
      })
      ?.finally(() => (state.loading = false));
    console.log(res, "----文件上传 res");
    if (res?.data) {
      const copyValue = JSON.parse(
        JSON.stringify(
          (state.fileList || []).map((item) => {
            return {
              ...item,
              id: item.id ? BigInt(item.id).toString() : item.id,
            };
          })
        )
      );
      const findOne = UploadChangeParam.fileList.find((one) => {
        return one.uid === UploadChangeParam.file.uid;
      });
      changeFile = {
        ...findOne,
        ...res.data,
      };
      action = "add";
      value = copyValue.concat(changeFile);
    }
  }
  if (!value) return;
  const result = props.multiple ? value : value.slice(-1);
  state.fileList = result;
  emit(
    "update:value",
    result.map((item) => ({
      fileName: item.fileName,
      filePath: item.filePath,
    }))
  );
  props.onChange &&
    props.onChange(result, changeFile ? [changeFile] : changeFile, action);
};

const handleFileClick = async (file) => {
  const fileId = file?.id;
  const fileName = file?.name;
  const fileType = fileName?.substring(fileName?.lastIndexOf("."));
  if (props.onFileClick) {
    props.onFileClick(file);
  } else if (typeof fileId !== "undefined" && props.canPreview) {
    previewFile(fileId);
  }
};

defineExpose({});
</script>

<style scoped lang="scss">
.textUpload {
  ::v-deep .ant-upload-select {
    display: none;
  }

  ::v-deep .ant-upload-list-text-container:first-child .fileList {
    margin-top: 0 !important;
  }
}

.noneFileList {
  ::v-deep .ant-upload-list {
    display: none;
  }
}

.ml-8 {
  margin-left: 8px;
}
</style>
