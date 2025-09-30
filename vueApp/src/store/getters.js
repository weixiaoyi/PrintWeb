const getters = {
  size: (state) => state.app.size,
  isEnglish: (state) => {
    const lang = state.app.lang;
    return ["en", '"en"', "'en'"].includes(lang);
  },
};
export default getters;
