<template>
  <div class="editTemplates">
    <div class="header">
      编辑模板
      <a-button size="small" @click="handleBack">返回</a-button>
    </div>
    <div>muban</div>
  </div>
</template>

<script setup lang="jsx">
import { computed, onMounted, reactive } from "vue";
import { getCommonTemplates } from "@/api/templates";

const [switchView, globalState] = [inject("switchView"), inject("globalState")];

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
              <a>查看</a>
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

onMounted(() => {
  console.log(globalState, "---globalState");
});

const handleBack = () => {
  switchView("main");
};
</script>

<style lang="scss" scoped>
.editTemplates {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
