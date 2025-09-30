import { computed } from "vue";
import { useStore } from "vuex";

export default function useRenderWithLang(cnShow, enShow) {
  const store = useStore();

  return computed(() => {
    const isEnglish = store.getters.isEnglish;
    if (isEnglish) {
      return enShow;
    } else {
      return cnShow;
    }
  });
}
