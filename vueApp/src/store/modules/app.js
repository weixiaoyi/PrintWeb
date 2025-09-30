import { Localstorage } from "@/utils/fn";

const getRgbColor = (color) => {
  if (color) {
    color = color?.replace(/"(.*?)"/, "$1");
  }
  if (/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.test(color)) {
    return color;
  } else {
    return "#005AAC";
  }
};

const state = {
  packJson: {},
  globalLoading: {
    loading: false,
    tip: null,
  },
  analysisData: null,
  lang: localStorage.getItem("lang"),
  themeColor: getRgbColor(localStorage.getItem("themeColor")),
};

const mutations = {
  setGlobalLoading: (state, payload) => {
    state.globalLoading = payload;
  },
  SET_PACK_JSON: (state, payload = {}) => {
    state.packJson = payload;
  },
  SET_ANALYSIS_DATA: (state, payload = {}) => {
    state.analysisData = payload;
  },
  SET_LANGUAGE: (state, payload) => {
    state.lang = payload;
    Localstorage.set("lang", payload);
  },
  SET_THEME_COLOR: (state, payload) => {
    state.themeColor = payload || "#005AAC";
    Localstorage.set("themeColor", payload);
  },
};

const actions = {
  openGlobalLoading({ commit }, { tip } = {}) {
    commit("setGlobalLoading", {
      loading: true,
      tip,
    });
  },
  closeGlobalLoading({ commit }) {
    commit("setGlobalLoading", {
      loading: false,
      tip: null,
    });
  },
  setPackJson({ commit }, payload) {
    commit("SET_PACK_JSON", payload);
  },
  setAnalysisData({ commit }, payload) {
    commit("SET_ANALYSIS_DATA", payload);
  },
  setLang({ commit }, payload) {
    commit("SET_LANGUAGE", payload);
  },
  setThemeColor({ commit }, payload) {
    commit("SET_THEME_COLOR", payload);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
