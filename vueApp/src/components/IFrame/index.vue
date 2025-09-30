<template>
  <div :style="'height:' + (props.height || heightNormalized)">
    <iframe
      :src="url"
      frameborder="0"
      style="width: 100%; height: 100%; border: none"
      scrolling="auto"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  height: { type: String, default: "" },
});

const heightNormalized = ref(
  document.documentElement.clientHeight - 94.5 + "px;"
);
const loading = ref(true);
const url = computed(() => props.src);

onMounted(() => {});
</script>
