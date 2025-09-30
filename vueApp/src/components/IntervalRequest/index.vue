<template></template>

<script setup lang="jsx">
import _ from "lodash";
import { onMounted, reactive, useAttrs, watch } from "vue";
import { IntervalSpeed } from "@/constants";

const props = defineProps({
  list: {
    type: Array,
    default: [],
  },
});
/*
list = [fun1,fun1,fun3] // 此种用法表示，轮询速度一致默认为 IntervalSpeed.middle(中等速度)
list = [fun1,fun1,[fun3, 3000]，// 此种用法表示，第三个参数轮询速度为给定的速度（毫秒），其他都默认为 IntervalSpeed.middle
list = [fun1,fun1,[fun3, 3000, true]，// 第三个参数代表是否立即触发，默认为true, 如果不需要立即触发，设置为false。通常不需要传递
* */

const attrs = useAttrs();

const state = reactive({
  records: [],
  _destroyed: false,
});

watch(
  () => props.list,
  (newValue) => {
    const newValueNormalized = newValue
      .map((item) => ({
        fun: item?.[0] || item,
        speed: item?.[1] || IntervalSpeed.middle,
        immediate: item?.[2] !== false,
      }))
      .filter((item) => _.isFunction(item.fun)); // 注意 fun 必须是函数，不然会被过滤掉
    const removeList = state.records.filter(
      (item) => !newValueNormalized.find((one) => one.fun === item.fun) //此次变化需要删除的函数
    );
    const addList = newValueNormalized.filter(
      (item) => !state.records.find((one) => one.fun === item.fun) //此次变化需要新增的函数
    );

    if (addList.length) {
      addList.forEach((item) => {
        const intervalFun = () => {
          if (state._destroyed) return;
          item.fun();
        };
        let interval = setInterval(intervalFun, item.speed);
        state.records.push({
          fun: item.fun,
          pause: () => {
            clearInterval(interval);
            interval = null;
            item.active = false;
          },
          active: true,
        });
        if (item.immediate) {
          intervalFun();
        }
      });
    }

    if (removeList.length) {
      removeList.forEach((item) => {
        item.pause();
        item.active = false;
      });
    }

    state.records = state.records.filter((item) => item.active);
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(() => {});

onBeforeUnmount(() => {
  state._destroyed = true;
  state.records.forEach((item) => {
    item.pause();
  });
});
</script>

<style lang="scss" scoped></style>
