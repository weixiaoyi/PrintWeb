import { defineComponent } from 'vue';
export default defineComponent({
  name: 'renderDom',
  props: {
    render: Function,
  },
  render() {
    return this.render();
  },
});
