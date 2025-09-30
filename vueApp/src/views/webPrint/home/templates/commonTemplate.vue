<template>
  <div class="commonTemplates">
    <Table
      :options="options"
      :columns="columns"
      size="middle"
      :pagination="false"
    />
  </div>
</template>

<script setup lang="jsx">
import { computed, onMounted, reactive } from "vue";
import Table from "@/components/Table/index.vue";
import { getCommonTemplates } from "@/api/templates";

const [switchView] = [inject("switchView")];

const router = useRouter();

const props = defineProps([]);

const state = reactive({
  query: {},
});

const [columns, options] = [
  computed(() => {
    return [
      {
        title: "模板Id",
        dataIndex: "id",
      },
      {
        title: "模板名称",
        dataIndex: "name",
      },
      {
        title: "模板描述",
        dataIndex: "desc",
      },
      {
        title: "操作",
        fixed: "right",
        customRender: ({ record }) => {
          const isLoading =
            record?.name && state.operationRow?.name === record?.name;
          return (
            <div className="operation-divider">
              <a
                onClick={() => {
                  switchView("edit", record);
                }}
              >
                编辑
              </a>
              <a>预览</a>
            </div>
          );
        },
      },
    ];
  }),
  {
    rowKey: "id",
    query: state.query,
    autoPage: true,
    init: async (queries = {}) => {
      const res = await getCommonTemplates({
        ...queries,
      });
      if (res.data) {
        return {
          data: res.data,
        };
      }
    },
  },
];

onMounted(() => {});
</script>

<style lang="scss" scoped>
.commonTemplates {
}
</style>
