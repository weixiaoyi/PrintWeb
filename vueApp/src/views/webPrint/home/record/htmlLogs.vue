<template>
  <div class="table">
    <div class="utils"></div>
    <Table
      :options="options"
      :columns="columns"
      size="small"
      :pagination="false"
    />
  </div>
</template>

<script setup lang="jsx">
import Table from "@/components/Table/index.vue";
import { computed, onMounted, reactive, useCssModule } from "vue";
import { clearHtmlLogs, getHtmlLogs } from "@/api/logs";
import TableTitle from "./components/tableTitle.vue";
import RenderFileNameItem from "@/views/webPrint/home/record/components/renderFileNameItem.vue";

const router = useRouter();
const style = useCssModule();

const state = reactive({
  query: {
    start: 0,
    limit: 6,
  },
  intervalSpeed: 2000,
});

const [columns, options] = [
  computed(() => {
    return [
      {
        title: () => (
          <TableTitle label="Html日志" state={state} clearLog={clearHtmlLogs} />
        ),
        dataIndex: "htmlFileName",
        customRender: ({ record, text }) => {
          return <RenderFileNameItem record={record} text={text} type="html" />;
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
      const res = await getHtmlLogs({
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
      return dataSource.map((item) => {
        return {
          ...item,
          ...(item.message || {}),
        };
      });
    },
  },
];

onMounted(() => {});
</script>

<style lang="scss" scoped></style>
