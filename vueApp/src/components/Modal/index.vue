<template>
  <a-modal
    :visible="true"
    :title="title"
    @ok="ok"
    @cancel="cancel"
    :destroyOnClose="true"
    :centered="true"
    v-bind="attars"
  >
    <template #footer>
      <div class="footer">
        <a-button type="primary" key="submit" :loading="loading" @click="ok">
          <Lang>
            {{ okText }}
          </Lang>
        </a-button>
        <a-button key="back" @click="cancel">
          <Lang>{{ cancelText }}</Lang>
        </a-button>
      </div>
    </template>
    <slot></slot>
  </a-modal>
</template>

<script setup>
import { useAttrs } from "vue";

const attars = useAttrs();
const props = defineProps({
  okText: {
    default: "确定",
  },
  cancelText: {
    default: "取消",
  },
  ok: Function,
  cancel: Function,
  loading: Boolean,
  title: String,
});
</script>

<style scoped lang="scss">
.footer {
  display: flex;
  justify-content: center;
}
</style>
