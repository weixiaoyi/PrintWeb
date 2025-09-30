<template>
  <span>
    <span v-if="text"> {{ text }}</span>
    <slot v-else />
  </span>
</template>

<script setup>
import langConfig from "./langConfig";

const store = useStore();
const slots = useSlots();

const text = computed(() => {
  const slotsAll = slots.default();
  const text = slotsAll?.[0]?.children;
  const isEnglish = store.getters.isEnglish;
  if (typeof text === "string") {
    if (isEnglish) {
      if (langConfig?.[text]) {
        return langConfig?.[text];
      }
    }
    return text;
  }
});
</script>
