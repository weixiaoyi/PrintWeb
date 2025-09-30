<template>
  <div class="mirrorCom">
    <div class="mirrorUtils" v-if="reset">
      <span class="wrapCheck">
        <label for="wrap"><Lang>自动换行</Lang></label>
        <input
          type="checkbox"
          name="wrap"
          :checked="state.wrap"
          @change="(e) => (state.wrap = e.target.checked)"
        />
      </span>
      <span>
        <button @click="reset"><Lang>重置</Lang></button>
      </span>
    </div>
    <div v-if="errMessage" class="errMsg">
      <a-alert :message="errMessage" type="error" style="margin-bottom: 10px" />
      <a-alert :message="resetWarnText" type="warning"></a-alert>
    </div>
    <Codemirror
      v-model:value="value"
      :options="cmOptions"
      border
      ref="cmRef"
      @change="handleChange"
      @ready="handleReady"
      class="codemirror"
    />
  </div>
</template>

<script setup lang="jsx">
import { onMounted, onUnmounted, ref } from "vue";
import Codemirror from "codemirror-editor-vue3";
import "codemirror/theme/abcdef.css";
import "codemirror/mode/javascript/javascript.js";
import { JSHINT } from "jshint";
import "codemirror/addon/lint/javascript-lint";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import webPrintPdf from "web-print-pdf";
import useRenderWithLang from "@/hooks/useRenderLang";

window.webPrintPdf = webPrintPdf;
window.JSHINT = JSHINT;

const props = defineProps({
  code: {
    type: String,
  },
  lang: {
    type: String,
    default: "js",
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  onChange: {
    type: Function,
  },
  reset: {
    type: Function,
  },
  errMessage: {
    type: String,
  },
});

const state = reactive({
  wrap: false,
});

const value = ref(props.code);

const cmRef = ref();

const cmOptions = computed(() => {
  return {
    mode: {
      js: "text/javascript",
    }[props.lang],
    theme: "abcdef",
    readOnly: props.readOnly,
    lineWrapping: state.wrap,
    gutters: ["CodeMirror-lint-markers"],
    lint: {
      esversion: "9",
    },
    tabSize: 4,
    indentUnit: 4,
  };
});

const resetWarnText = useRenderWithLang(
  "您可点击 “重置” 按钮，使用初始代码",
  "You can click the 'Reset' button to use the initial code"
);

onMounted(() => {});

const handleReady = (cm) => {
  cm?.doc?.markText(
    {
      line: 0,
      ch: 0,
    },
    {
      line: 0,
      ch: 200,
    },
    {
      readOnly: true,
    }
  );
};

const handleChange = (val, cm) => {
  handleReady(cm);
  value.value = cm.getValue();
  props.onChange && props.onChange(value.value, cm);
};

onUnmounted(() => {
  cmRef.value?.destroy();
});

defineExpose({
  getValue: () => value.value,
  setValue: (val) => (value.value = val),
});
</script>

<style lang="scss" scoped>
.mirrorCom {
  overflow-x: auto;
  width: 1px;
  min-width: 100%;
  max-width: 100%;

  .codemirror {
    font-size: 16px;
  }

  .mirrorUtils {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;

    > span + span {
      margin-left: 10px;
    }

    button {
      cursor: pointer;
      font-size: 12px;
    }

    .wrapCheck {
      display: flex;
      align-items: center;

      label {
        margin-right: 5px;
      }

      input {
        cursor: pointer;
      }
    }
  }

  .errMsg {
    margin-bottom: 10px;
  }
}
</style>
