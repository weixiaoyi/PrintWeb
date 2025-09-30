<template>
  <div class="printers">
    <div class="table">
      <div class="utils">
        <span class="btns">
          <a-button
            type="primary"
            @click="doPrintFileTest"
            :loading="state.loading"
          >
            <Lang>打印测试</Lang>
          </a-button>
          <a-button @click="doRefresh">
            <RedoOutlined
              :class="{
                rotate: state.tableLoading,
              }"
            />
            <Lang>刷新</Lang>
          </a-button>
        </span>
      </div>
      <Table :options="options" :columns="columns" size="middle" />
    </div>
  </div>
</template>

<script setup lang="jsx">
import Table from "@/components/Table/index.vue";
import { computed, onMounted, reactive, useCssModule } from "vue";
import { RedoOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { doSetDefaultPrinter, getPrinterList } from "@/api/print";
import { doPrintTest } from "@/api/test";
import ClipBoard from "@/components/ClipBoard";
import useRenderWithLang from "@/hooks/useRenderLang";

const router = useRouter();
const style = useCssModule();

const props = defineProps([]);

const state = reactive({
  query: {},
  loading: false,
  operationRow: null,
  tableLoading: false,
});

const operationSuccessText = useRenderWithLang(
  "操作成功！",
  "Successful operation!"
);

const [columns, options] = [
  computed(() => {
    return [
      {
        title: "打印机",
        width: 700,
        dataIndex: "name",
        customRender: ({ text }) => {
          return <ClipBoard>{text}</ClipBoard>;
        },
      },
      {
        title: "是否默认打印机",
        customRender: ({ record }) => {
          return record.default ? (
            <span className={style.default}>
              <Lang>是</Lang>
            </span>
          ) : (
            <Lang>否</Lang>
          );
        },
      },
      {
        title: "操作",
        fixed: "right",
        customRender: ({ record }) => {
          const isLoading =
            record?.name && state.operationRow?.name === record?.name;
          return (
            <div className="operation-divider">
              {isLoading ? (
                <a>
                  <a-spin />
                </a>
              ) : (
                <a
                  onClick={() => {
                    doSetDefaultPrint(record);
                  }}
                >
                  <Lang>设为默认</Lang>
                </a>
              )}
            </div>
          );
        },
      },
    ].map((item) => {
      return {
        ...item,
        title: () => <Lang>{item.title}</Lang>,
      };
    });
  }),
  {
    rowKey: "id",
    query: state.query,
    autoPage: true,
    paginationMoreProps: {
      hideOnSinglePage: true,
      showTotal: false,
    },
    init: async (queries = {}) => {
      state.tableLoading = true;
      const res = await getPrinterList({
        ...queries,
      }).finally(() => (state.tableLoading = false));
      if (res.data) {
        return {
          data: res.data,
        };
      }
    },
    computed: (dataSource) => {
      const details = state.printerMoreDetails;
      return dataSource.map((item) => {
        const isDefault = details?.defaultPrinter?.name === item.name;
        return {
          ...item,
          isDefault,
        };
      });
    },
  },
];

onMounted(() => {});

const doRefresh = () => {
  state.query.timestamp = Date.now();
};

const doPrintFileTest = async () => {
  state.loading = true;
  await doPrintTest().finally(() => {
    state.loading = false;
  });
  message.success(operationSuccessText.value);
};

const doSetDefaultPrint = async (printer) => {
  state.operationRow = printer;
  await doSetDefaultPrinter({
    printer,
  }).finally(() => {
    state.operationRow = null;
  });
  message.success(operationSuccessText.value);
  state.query.timestamp = Date.now();
};
</script>

<style lang="scss">
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate {
  animation: spin 1s linear infinite;
}
</style>
<style lang="scss" scoped>
.printers {
  flex-grow: 1;
  background: white;
  padding: 20px;

  .utils {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;

    .btns {
      button + button {
        margin-left: 20px;
      }
    }
  }

  .table {
    .utils {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="scss" module>
.default {
  color: red;
}
</style>
