<template>
  <div class="printLog">
    <div class="utils"></div>
    <Table
      :options="options"
      :columns="columns"
      size="small"
      :pagination="false"
      :expandedRowRender="expandedRowRender"
    />
  </div>
</template>

<script setup lang="jsx">
import Table from "@/components/Table/index.vue";
import { computed, onMounted, reactive, useCssModule } from "vue";
import { clearPrintLogs, getPrintLogs } from "@/api/logs";
import TableTitle from "./components/tableTitle.vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import RenderFileNameItem from "@/views/webPrint/home/record/components/renderFileNameItem.vue";
import { isEmptyObject } from "@/utils/fn";

const router = useRouter();
const style = useCssModule();

const state = reactive({
  query: {
    start: 0,
    limit: 6,
  },
  intervalSpeed: 2000,
});

const [columns, options, expandedRowRender] = [
  computed(() => {
    return [
      {
        title: () => (
          <TableTitle
            label="打印日志"
            state={state}
            clearLog={clearPrintLogs}
          />
        ),
        dataIndex: "pdfFileName",
        customRender: ({ record, text }) => {
          return <RenderFileNameItem record={record} text={text} type="pdf" />;
        },
      },
    ];
  }),
  {
    rowKey: "id",
    query: state.query,
    autoPage: true,
    intervalSpeed: state.intervalSpeed,
    init: async (queries = {}) => {
      const res = await getPrintLogs({
        ...queries,
      });
      state.hasNextPage = res?.data?.length >= state.query.limit;
      if (res.data) {
        return {
          data: res.data,
        };
      }
    },
    computed: (dataSource) => {
      return dataSource.map((item, index) => {
        return {
          id: item.timestamp + index,
          ...item,
          ...(item.message || {}),
        };
      });
    },
  },
  ({ record }) => {
    return record.printOptions ? (
      <div>
        {record.msg && (
          <div style="margin-bottom:20px">
            <div style="color:rgba(0,0,0,.4)">error：</div>
            <div style="word-break:break-all">
              <Clipboard>{record.msg}</Clipboard>
            </div>
          </div>
        )}
        <div style="color:rgba(0,0,0,.4)">printOptions：</div>
        <VueJsonPretty data={record.printOptions} />
        <br />
        {!isEmptyObject(record.extraOptions) && (
          <>
            <div style="color:rgba(0,0,0,.4)">extraOptions：</div>
            <VueJsonPretty data={record.extraOptions} />
          </>
        )}
      </div>
    ) : (
      "无"
    );
  },
];

onMounted(() => {});
</script>

<style lang="scss" scoped>
.printLog {
  ::v-deep table th.ant-table-row-expand-icon-cell {
    padding: 0 !important;
  }
}
</style>
