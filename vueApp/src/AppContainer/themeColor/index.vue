<script setup lang="jsx">
import { onMounted } from "vue";
import { getThemeColor } from "@/api/app";

const store = useStore();

onMounted(() => {
  if (window.electron?.ipcRendererOn) {
    window.electron.ipcRendererOn("setThemeColorSuccess", getThemeColors);
  }
  getThemeColors();
});

const getThemeColors = async () => {
  const res = await getThemeColor();
  store.dispatch("app/setThemeColor", res.data);
};
</script>
