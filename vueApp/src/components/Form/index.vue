<template>
  <Form
    :model="model"
    ref="formRef"
    class="selfForm"
    :class="{
      description: type === 'description',
    }"
  >
    <Row :gutter="gutter" v-for="(col, ins) in formsNormal" :key="ins">
      <Col
        style="flex: 1; width: min-content"
        :span="24 / (item.Col || cols)"
        v-for="item in col"
        :key="item.name"
      >
        <FormItem
          :label="item.label"
          :name="item.name"
          :rules="setCommon(item)?.rules || item.rules"
          :colon="item.colon"
          :class="item.render ? 'renderItem' : null"
          :tooltip="item.tooltip"
          :style="item.style"
        >
          <template v-if="item.render">
            <RenderDom :render="() => item.render(item)" />
          </template>
          <Input
            v-else-if="item.type === 'input'"
            v-model:value="model[item.name]"
            @change="item.change"
            v-bind="setCommon(item)"
          />
          <InputNumber
            style="width: 100%"
            v-else-if="item.type === 'inputNumber'"
            v-model:value="model[item.name]"
            v-bind="setCommon(item)"
            @change="item.change"
          />
          <AutoComplete
            style="width: 100%"
            v-else-if="item.type === 'autoComplete'"
            v-model:value="model[item.name]"
            v-bind="setCommon(item)"
            @change="item.change"
            @select="item.select"
            @search="item.search"
            @focus="item.focus"
          >
          </AutoComplete>
          <Select
            v-else-if="item.type === 'select'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            @search="item.search"
            @focus="item.focus"
            @blur="item.blur"
            v-bind="setCommon(item)"
          />
          <Cascader
            v-else-if="item.type === 'cascader'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            @search="item.search"
            @focus="item.focus"
            v-bind="setCommon(item)"
          />
          <Editor
            v-else-if="item.type === 'editor'"
            v-model:value="model[item.name]"
            :data="data"
            v-bind="setCommon(item)"
          >
          </Editor>
          <a-textarea
            v-else-if="item.type === 'textarea'"
            showCount
            v-model:value="model[item.name]"
            @change="item.change"
            v-bind="setCommon(item)"
          />
          <RadioGroup
            v-else-if="item.type === 'radioGroup'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            v-bind="setCommon(item)"
          />
          <CheckboxGroup
            v-else-if="item.type === 'checkboxGroup'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            v-bind="setCommon(item)"
          />
          <DatePicker
            style="width: 100%"
            v-else-if="item.type === 'date-picker'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            v-bind="setCommon(item)"
          />
          <RangePicker
            style="width: 100%"
            v-else-if="item.type === 'range-picker'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            v-bind="setCommon(item)"
          />
          <TimePicker
            style="width: 100%"
            v-else-if="item.type === 'time-picker'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            v-bind="setCommon(item)"
          />
          <TreeSelect
            style="width: 100%"
            v-else-if="item.type === 'tree-select'"
            v-model:value="model[item.name]"
            @change="item.change"
            @select="item.select"
            @search="item.search"
            @focus="item.focus"
            @treeExpand="item.treeExpand"
            v-bind="setCommon(item)"
          />
          <Upload
            withCredentials
            v-else-if="item.type === 'upload'"
            v-model:value="model[item.name]"
            @change="(params) => uploadFileChange(params, item)"
            :fileList="
              (model[item.name] || []).map((one) => ({
                ...one,
                percent: 0,
                name: one.name || `${one.id ? '文件id ' + one.id : ''}`,
              }))
            "
            :beforeUpload="() => false"
            :accept="uploadDefaultAcceptTypes"
            v-bind="setCommon(item)"
            :showUploadList="false"
          >
            <span>
              <Button
                v-if="item.showButton !== false"
                showType="disabled"
                :type="item.buttonType || 'primary'"
                :disabled="setCommon(item)?.disabled"
                :loading="item.loading"
                :ghost="item.ghost || true"
              >
                <UploadOutlined />
                {{ item.loading ? "上传中" : item.uploadText || "上传文件" }}
                <Tooltip
                  v-if="setCommon(item)?.isNeedTip !== false"
                  overlayClassName="upload__tip"
                >
                  <template #title>
                    <div>{{ getAcceptTipText(item) }}</div>
                  </template>
                  <QuestionCircleOutlined class="ml-8" />
                </Tooltip>
              </Button>
            </span>

            <div style="margin-top: 10px" class="_uploadList">
              <div
                v-for="(file, index) in model[item.name] || []"
                :key="file.name + file.id + index"
              >
                <div style="margin-top: 5px" v-if="file.name">
                  <a
                    @click.stop="
                      () => handleFileClick(model[item.name], item, index)
                    "
                    style="cursor: pointer; word-break: break-all"
                  >
                    {{ file.name }}
                  </a>
                  <a
                    href="javascript:;"
                    @click.stop="
                      () => {
                        model[item.name].splice(index, 1);
                        formRef?.validateFields([item.name]);
                        item.afterChange && item.afterChange(model[item.name]);
                      }
                    "
                    v-if="!setCommon(item)?.disabled"
                    style="margin-left: 10px"
                  >
                    <DeleteOutlined />
                  </a>
                </div>
              </div>
            </div>
          </Upload>
          <template v-if="item.type === 'search-reset'">
            <Button @click="search(item)" type="primary" ghost> 搜索 </Button>
            <Button style="margin-left: 10px" @click="reset(item)">
              重置
            </Button>
          </template>
          <div
            style="display: flex"
            v-else-if="item.type === 'text'"
            :class="item.class || ''"
          >
            <span>{{ item.text || model[item.name] }}</span>
            <span
              style="margin-left: auto"
              v-if="model[item.name]"
              v-html="item.addonAfter"
            ></span>
          </div>

          <template v-else-if="item.slot">
            <!--           用法 <template #testSlotName>123</template> 或者 <template
  v-slot:testSlotName="scope">{{scope.item?.name}}</template> -->
            <slot :name="item.slot" :item="item"></slot>
          </template>
        </FormItem>
      </Col>
    </Row>
  </Form>
</template>

<script setup lang="jsx">
import {
  Form,
  FormItem,
  Button,
  Input,
  Row,
  Col,
  Select,
  Cascader,
  Textarea,
  RadioGroup,
  CheckboxGroup,
  DatePicker,
  RangePicker,
  TimePicker,
  InputNumber,
  TreeSelect,
  Upload,
  Tooltip,
  message,
  AutoComplete,
} from "ant-design-vue";
import RenderDom from "../RenderDom/index.jsx";
import {
  DeleteOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { previewFile, isEmptyValue, removeSpaces } from "@/utils/fn.js";
import { uploadFile } from "@/api/publicFile";
import uploadDefaultAcceptTypes from "@/components/Form/uploadDefaultAcceptTypes";

const props = defineProps({
  model: {
    default: {},
  },
  forms: {
    default: [],
  },
  cols: {
    default: 1,
  },
  gutter: {
    default: 12,
  },
  type: {
    default: "form", // form：正常表单，description: 结合了Description组件 风格的表单
  },
  labelWidth: {
    // form === ’description‘ 才有用，左边 label区域 宽度
    type: String,
    default: "250px",
  },
  valueMinWidth: {
    // form === ’description‘ 才有用, 右边 value区域 宽度
    type: String,
    default: "100px",
  },
  data: {},
});
const emit = defineEmits(["getFile", "removeFile"]);
const groupByCount = (arrays, cols) => {
  return arrays.reduce((sum, item) => {
    let newOne = sum.pop();
    if (item.Row === true || newOne?.length === cols || newOne?.[0]?.Row) {
      if (newOne) sum.push(newOne);
      newOne = [];
    }
    if (!newOne) {
      newOne = [];
    }
    newOne.push(item);
    sum.push(newOne);
    return sum;
  }, []);
};
const formsNormal = computed(() => {
  let forms = groupByCount(props.forms, props.cols);
  if (props.type === "description" && forms?.length) {
    forms = forms.reduce((sum, item = []) => {
      if (
        item?.length < props.cols &&
        !item?.find((one) => one.Row || one.Col === 1)
      ) {
        const emptyLength = props.cols - item.length;
        const emptyList = new Array(emptyLength).fill({ label: " " });
        item = item.concat(emptyList);
      }
      sum.push(item);
      return sum;
    }, []);
  }
  return forms;
});

const labelWidthComputed = computed(() => {
  function getTextWidth(text = "") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `14px 微软雅黑`;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  const widthList = props.forms.map((item) => getTextWidth(item.label));
  let max = Math.max(...widthList);
  if (!max) {
    return props.labelWidth;
  } else {
    max = max + 50;
    return `${max}px`;
  }
});

const formRef = ref();

const setCommon = (item = {}) => {
  const setLabel = (pleaseText) => {
    if (typeof item.label === "object") {
      return pleaseText;
    } else {
      return pleaseText + item.label;
    }
  };

  const placeholder = item.placeholder
    ? item.placeholder
    : ["input", "textarea", "inputNumber"].includes(item.type)
    ? setLabel("请输入")
    : setLabel("请选择");

  const setRules = (item) => {
    const rules = item.rules?.map((one) => {
      if (!isEmptyValue(one.required)) {
        return {
          ...one,
          message: one.message || placeholder,
        };
      }
      return one;
    });
    if (rules?.length) {
      if (rules.find((one) => one?.required)) {
        if (["input", "textarea"].includes(item.type)) {
          return [
            ...rules,
            {
              whitespace: true, // 必填项请输入有效字符（非完全空格）！
            },
          ];
        }
      }
    }
    return rules;
  };

  return {
    ...(props.type === "description" ? { bordered: false } : {}),
    disabled: item.disabled,
    options: item.options,
    style: item.styles, // 注意 style 换成了styles
    placeholder,
    rules: setRules(item),
    ...(item.type === "select" || item.type === "input"
      ? { allowClear: true }
      : {}),
    ...(item.type === "select"
      ? {
          filterOption: (inputValue, option) => {
            return option?.label?.includes(inputValue);
          },
        }
      : {}),
    ...(item.prop || {}), // 可自由传递各种属性
  };
};

const reset = (item) => {
  if (item.reset) {
    item.reset(formRef, item);
  } else {
    formRef.value.resetFields();
    item.afterReset && item.afterReset(formRef, item);
  }
};

const search = async (item) => {
  if (item.search) {
    item.search(formRef, item);
  } else {
    const values = await formRef.value.validate();
    const removeSpacesValues = values ? removeSpaces(values) : values;
    item.afterSearch && item.afterSearch(removeSpacesValues, formRef, item);
  }
};

const uploadFileChange = async (UploadChangeParam, one) => {
  console.log(UploadChangeParam, "----文件上传 params");
  let value;
  let changeFile; // 每一次的变化文件, 新增的或删除的
  let action = "";
  if (UploadChangeParam.file.status === "removed") {
    value = props.model[one.name].filter(
      (item) => item.id !== UploadChangeParam.file.id
    );
    changeFile = fileListNormalized.value.find(
      (item) => item.id === UploadChangeParam.file.id
    );
    action = "remove";
  } else {
    if (
      UploadChangeParam?.fileList?.some(
        (one) =>
          one.name?.substring(0, one.name?.lastIndexOf("."))?.length > 100
      )
    ) {
      return message.warning("文件名称长度不能超过100个字符！");
    }
    one.loading = true;
    let res = await uploadFile(UploadChangeParam)
      .catch((err) => {
        one.loading = false;
        setFieldsValue({
          [one.name]: props.model[one.name], // 触发loading结束
        });
        return Promise.reject(err);
      })
      .finally(() => {
        one.loading = false;
      });
    console.log(res, "----文件上传 res");
    if (res.msg) {
      const copyValue = JSON.parse(
        JSON.stringify(
          (props.model[one.name] || []).map((item) => {
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
        id: res.msg,
      };
      action = "add";
      value = copyValue.concat(changeFile);
    }
  }
  setFieldsValue({
    [one.name]: one.multiple ? value : value.slice(-1),
  });
  one.afterChange &&
    one.afterChange(value, changeFile ? [changeFile] : changeFile, action);
};

const handleFileClick = async (modelItem, item, index = 0) => {
  const fileId = modelItem?.[index]?.id;
  const fileName = modelItem?.[index]?.name;
  const fileType = fileName?.substring(fileName?.lastIndexOf("."));
  if (item.onFileClick) {
    item.onFileClick(modelItem, item);
  } else if (typeof fileId !== "undefined" && item.canPreview !== false) {
    previewFile(fileId);
  }
};

const setFieldsValue = (obj = {}, validateTrigger = true) => {
  Object.entries(obj).forEach(([key, value]) => {
    props.model[key] = value;
    if (validateTrigger !== false) {
      // 如果没有指定不需要校验，会立即触发校验，通常初始化的时候不需要触发，提交才需要触发
      formRef.value.validateFields([key]); // 及时校验
    }
  });
};

// 获取支持类型提示
const getAcceptTipText = (target) => {
  const accept =
    target?.prop?.accept || target?.accept || uploadDefaultAcceptTypes;
  const acceptTypesText = Array.isArray(accept)
    ? accept.join("，")
    : accept.replace(/,/g, "，");
  return `支持上传类型： ${acceptTypesText}`;
};

const validate = async () => {
  try {
    const res = await formRef.value.validate();
    let value;
    if (res) {
      value = removeSpaces(res);
    }
    return value;
  } catch (err) {
    return Promise.reject(err);
  }
};

formRef.validate = validate;

defineExpose({
  formRef,
  setFieldsValue,
});
</script>

<style scoped lang="scss">
@import "@/assets/styles/variables.module.scss";

.selfForm {
  &::v-deep .renderItem .ant-form-item {
    margin-bottom: 0;
  }

  &::v-deep .ant-form-item.renderItem {
    .ant-form-item-control-input {
      min-height: unset;
    }
  }

  ::v-deep .ant-row {
    padding: 0 !important;
    margin: 0 !important;
  }
}

.description {
  ::v-deep {
    .ant-row + .ant-row {
      .ant-form-item {
        border-top: 0;
      }
    }

    .ant-form-item {
      line-height: 1;
      border: 1px solid $border;
      margin-bottom: 0;
      height: 100%;
      overflow-x: hidden;
      background: $light-blue;
    }

    .ant-row,
    .ant-col {
      padding: 0 !important;
      margin: 0 !important;
    }

    .ant-form-item-label {
      // flex-grow: 1;
      width: v-bind(labelWidthComputed);
      // min-width: v-bind(labelWidth);
      max-width: v-bind(labelWidthComputed);
      background: $light-blue;
      text-align: right;
      padding: 10px !important;

      &.ant-form-item-label > label::after {
        content: "";
      }
    }

    .ant-form-item-control-input {
      height: 100%;
    }

    .ant-form-item-control {
      flex-grow: 100;
      min-height: 52px;
      padding: 10px !important;
      max-width: none !important;
      background: white;
      min-width: v-bind(valueMinWidth);
    }

    .ant-form-item-with-help .ant-form-item-control-input {
      height: unset;
    }

    .ant-form-item-control-input-content {
      word-break: break-all;
      line-height: 1.2;
    }

    .ant-select-borderless .ant-select-selector {
      border: 0px solid red !important;
    }
  }
}

.ml-8 {
  margin-left: 8px;
}
</style>
