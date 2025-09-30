<template>
  <div>
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      :style="{
        height: autoHeight ? undefined : `${height || 200}px`,
        'overflow-y': 'auto',
      }"
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="state.valueHtml"
      @onCreated="handleCreated"
      @onChange="handleChanged"
    />
  </div>
</template>

<script setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import {
  onBeforeUnmount,
  reactive,
  shallowRef,
  onMounted,
  defineProps,
  defineExpose,
  watch,
} from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

const props = defineProps(["onChange", "disabled", "height", "autoHeight"]);

const editorRef = shallowRef();

watch(
  [() => props.disabled, () => editorRef.value],
  ([v, v2]) => {
    const editor = editorRef.value;
    if (editor == null) return;
    if (v) {
      editor.disable && editor.disable();
    } else {
      editor.enabled && editor.enabled();
    }
  },
  {
    immediate: true,
  }
);

const handleChanged = (editor) => {
  props.onChange && props.onChange(editor, state.valueHtml, editor.isEmpty());
};

// 模拟 ajax 异步获取内容
onMounted(() => {});

const toolbarConfig = {
  excludeKeys: ["uploadImage", "fullScreen"],
};

const editorConfig = { placeholder: "请输入内容..." };

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

defineExpose({
  editor: editorRef,
});

const state = reactive({
  valueHtml: undefined,
});
</script>

<style>
.w-e-text-container [data-slate-editor] {
  border: 1px solid rgb(204, 204, 204);
}
</style>
