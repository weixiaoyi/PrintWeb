<template>
  <div class="tableTitle">
    <div class="label">
      <Lang>{{ attrs.label }}</Lang>
      <a-tooltip
        :title="actions.expireDayTooltip"
        v-if="actions.expireDayTooltip"
      >
        <span class="help"><ExclamationCircleOutlined /></span>
      </a-tooltip>
    </div>
    <div style="margin-top: 10px">
      <div class="selectDay">
        <a-range-picker
          style="margin-bottom: 10px"
          :show-time="{ format: 'HH:mm' }"
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="searchTimePlaceholder"
          @change="onRangeChange"
        />
      </div>
      <span class="pagination">
        <span>
          <a-button
            size="small"
            @click="doClearLogs"
            :loading="state.clearLoading"
          >
            <Lang>清除</Lang>
          </a-button>
        </span>
        <span>
          <a-button
            size="small"
            :disabled="actions.disabledHome"
            @click="doHomePage"
          >
            <span class="nextPage">
              <Lang>{{ actions.disabledHome ? "首页" : "回到首页" }}</Lang>
            </span>
          </a-button>
          <a-button
            size="small"
            :disabled="actions.disabledPrev"
            @click="doPrevPage"
          >
            <span class="nextPage"> <Lang>上一页</Lang> </span>
          </a-button>
          <a-button
            size="small"
            :disabled="actions.disabledNext"
            @click="doNextPage"
          >
            <span class="nextPage"> <Lang>下一页</Lang> </span>
          </a-button>
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { computed, reactive, useCssModule } from "vue";
import { message } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { debounce } from "lodash";
import useRenderWithLang from "@/hooks/useRenderLang";

const router = useRouter();
const style = useCssModule();
const attrs = useAttrs();
const [scopeState] = [inject("scopeState")];

const state = reactive({});

const operationSuccessText = useRenderWithLang(
  "操作成功！",
  "Successful operation!"
);

const searchTimePlaceholder = useRenderWithLang(
  ["起始时间", "结束时间"],
  ["startTime", "endTime"]
);

const expireText = useRenderWithLang(
  computed(
    () =>
      `日志与临时文件（.pdf，.html，.log）的保留期是${scopeState.logExpireDay}天`
  ),
  computed(
    () =>
      `The retention period for logs and temporary files (.pdf, .html, .log) is ${scopeState.logExpireDay} day`
  )
);

const actions = computed(() => {
  return {
    disabledHome: attrs.state.query.start === 0,
    disabledPrev: attrs.state.query.start === 0,
    disabledNext: !attrs.state.hasNextPage,
    expireDayTooltip: scopeState.logExpireDay && expireText.value?.value,
  };
});

const doHomePage = () => {
  attrs.state.query.start = 0;
};

const doNextPage = () => {
  attrs.state.query.start = attrs.state.query.start + attrs.state.query.limit;
};

const doPrevPage = () => {
  attrs.state.query.start = attrs.state.query.start - attrs.state.query.limit;
};

const onRangeChange = (v) => {
  if (v) {
    attrs.state.query.startTime = v[0].valueOf();
    attrs.state.query.endTime = v[1].valueOf();
    attrs.state.query.start = 0;
  } else {
    attrs.state.query.startTime = undefined;
    attrs.state.query.endTime = undefined;
    attrs.state.query.start = 0;
    attrs.state.query.timestamp = Date.now();
  }
};

const doClearLogs = debounce(
  async () => {
    if (attrs.clearLog) {
      state.clearLoading = true;
      await attrs.clearLog().finally(() => {
        state.clearLoading = false;
      });
      message.success(operationSuccessText.value);
    }
  },
  2000,
  {
    leading: true,
    trailing: false,
  }
);
</script>

<style lang="scss" scoped>
.tableTitle {
  .label {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .help {
    margin-left: 10px;
  }

  .nextPage {
    font-size: 12px;
  }

  .selectDay {
    display: flex;
    justify-content: center;

    > div {
      width: 100%;
    }
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;

    button + button {
      margin-left: 10px;
    }
  }
}
</style>
