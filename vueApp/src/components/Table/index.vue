<template>
  <div>
    <div v-if="options?.renderHeader" class="buttons">
      <RenderDom :render="renderTableHeader" />
    </div>
    <Table
      :row-key="options?.rowKey || '_uuid'"
      :loading="state.loading"
      :columns="columnsNormalized"
      :dataSource="dataSourceNormalized"
      :pagination="{
        ...state.pagination,
        pageSize: state.pagination.size,
        size: undefined,
        showSizeChanger: true,
        pageSizeOptions: PageSizeOptions,
        showTotal: (total, range) => `共 ${total} 条`,
        ...(props?.options?.paginationMoreProps || {}),
      }"
      @change="({ pageSize: size, current }) => init({ current, size })"
      :rowSelection="rowSelection"
      v-bind="attrs"
    >
      <template
        #bodyCell="{ text, record, index, column }"
        v-if="attrs.bodyCell"
      >
        <RenderDom
          :render="() => attrs.bodyCell({ text, record, index, column })"
        />
      </template>
      <template
        #expandedRowRender="{ record, index }"
        v-if="attrs.expandedRowRender"
      >
        <RenderDom :render="() => attrs.expandedRowRender({ record, index })" />
      </template>
      <template #expandColumnTitle v-if="attrs.expandColumnTitle">
        <RenderDom :render="() => attrs.expandColumnTitle()" />
      </template>
      <template #summary v-if="attrs.renderSummary">
        <RenderDom :render="attrs.renderSummary" />
      </template>
    </Table>
    <IntervalRequest
      :list="[
        props.options?.intervalSpeed
          ? [init, props.options?.intervalSpeed, false]
          : null,
      ]"
    />
  </div>
</template>

<script setup lang="jsx">
import _ from "lodash";
import { computed, reactive, useAttrs } from "vue";
import { message, Table, Tooltip } from "ant-design-vue";
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { uuid } from "@/utils/fn";
import RenderDom from "@/components/RenderDom";
import { PageSizeOptions } from "@/constants/index";

const props = defineProps({
  columns: {
    type: Array,
    default: [],
  },
  options: {
    rowKey: {
      type: String, // rowKey, 开启行选择必须传递rowkey
    },
    name: {
      type: String, // 必须传递的名称，用来做表格列的控制，后端存 json 的key
      required: true,
    },
    intervalSpeed: {
      type: Number, //轮询请求速度，需要开启的必须给个速度
    },
    query: {}, // table请求数据的参数依赖, 必须是一个 reactive 或者 computed 对象, 依赖的数据变化，table默认会重新请求第一页数据
    beforeInit: {
      type: Function, // table数据初始化函数执行之前的逻辑
    },
    init: {
      type: Function, // table数据初始化函数
    },
    computed: {
      type: Function, // table数据computed计算的getter函数
    },
    renderHeader: {
      type: Function, // JSX内容，表格按钮区域渲染，可以是按钮，也可以是任意内容
    },
    rowSelection: {
      type: Function, //行选择回调
    },
    getCheckboxProps: {
      type: Function, // 选择框的默认属性配置
    },
    paginationMoreProps: {
      // 更多分页组件配置，如改变 pageSizeOptions等各种，参考 pagination 所有配置可以用
      // 此属性不与默认的 pagination 属性冲突，依然可以直接被pagination属性覆盖
      type: Object,
      default: {},
    },
    renderSummary: {
      type: Function,
    },
  },
});

const attrs = useAttrs();

const state = reactive({
  queries: {},
  pagination: {
    current: 1,
    size: 10,
    total: 0,
  },
  dataSource: [],
  loading: false,
  firstInterval: true,
});

const notHideColumns = (column) => {
  //不需要隐藏的列
  return (
    ["_sort", "_operation"].find((one) => one === column.dataIndex) ||
    column.title === "操作" ||
    column.title === "序号"
  );
};

const [columnsNormalized] = [
  computed(() => {
    return (props?.columns || [])
      .filter((item) => {
        if (item.show === false) return false;
        if (notHideColumns(item)) return true;
        return true;
      })
      .map((one) => {
        if (one.dataIndex === "_sort") {
          // 序号列
          return {
            title: "序号",
            customRender: ({ index }) => {
              return (
                index +
                1 +
                (state.pagination?.size || 0) *
                  (state.pagination?.current - 1 || 0)
              );
            },
            ...one,
          };
        } else if (one.dataIndex === "_operation" || one.title === "操作") {
          // 操作列
          return {
            fixed: "right",
            ...one,
          };
        }
        return one;
      })
      .map((item) => {
        const _title = item._title || item.title;
        return {
          ...item,
          _title,
          ...(item.toolTip
            ? {
                title: () => {
                  return (
                    <span>
                      {_title}
                      <Tooltip title={item.toolTip}>
                        <span style="margin-left:5px">
                          <QuestionCircleOutlined />
                        </span>
                      </Tooltip>
                    </span>
                  );
                },
              }
            : {}),
          ...(item.customRender
            ? {
                customRender: (params) => {
                  return item.customRender({
                    ...params,
                    _record: state.dataSource?.[params.index],
                  });
                },
              }
            : {}),
        };
      });
  }),
];

const dataSourceNormalized = computed(() => {
  // 自动给每条数据生成uuid
  const geUid = (item = {}) => ({ ...item, _uuid: uuid() });
  return _.isFunction(props.options?.computed)
    ? props.options.computed(state.dataSource, state.queries)?.map(geUid)
    : state.dataSource?.map(geUid);
});

const init = async (query = {}) => {
  if (props?.options?.rowSelection && !props.options?.rowKey) {
    return message.warning("开启多选，必须给Table传递rowKey");
  }
  if (_.isFunction(props.options?.init)) {
    if (state.firstInterval) {
      state.loading = true;
    }
    const params = {
      current: state.pagination?.current,
      size: state.pagination?.size,
      ...(state.queries || {}),
      ...query,
    };
    state.queries = params;
    if (props.options?.beforeInit) props.options?.beforeInit(state, params);
    const res = await props.options?.init(params).finally(() => {
      state.loading = false;
    });
    if (res.data) {
      // dataSource
      state.dataSource = res.data;
      if (res.pagination) {
        // 分页
        state.pagination.total = +res.pagination.total;
        state.pagination.size = +res.pagination.size;
        state.pagination.current = +res.pagination.current;
      }

      if (props.options?.autoPage) {
        // 如果传递了此参数，代表前端分页
        state.pagination.current = params.current;
        state.pagination.size = params.size || 10;
      }
    } else {
      if (props.options?.autoPage) {
        // 如果传递了此参数，代表前端分页
        state.pagination.current = params.current;
        state.pagination.size = params.size || 10;
      }
    }
  }
};

const refreshFirstPage = (query = {}) => {
  return init({
    ...query,
    current: 1,
  });
};

watch(
  () => props?.options?.query,
  (newValue) => {
    refreshFirstPage(newValue);
    if (state.firstInterval && props.options?.intervalSpeed) {
      state.firstInterval = false;
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const renderTableHeader = () => {
  return props.options?.renderHeader({});
};

const rowSelection = props.options?.rowSelection
  ? {
      preserveSelectedRowKeys: true,
      ...(props.options?.selectedRowKeys
        ? {
            selectedRowKeys: props.options.selectedRowKeys,
          }
        : {}),
      onChange: (selectedKeys = [], selectedRows = []) => {
        // 在这里处理组件多选问题： 注意selectedRows会有一个问题，当selectedKeys存在对应的key, 但是数据源里没有这个key对应
        // 的某条数据，selectedRows 数组里对应的key的数据是一个 undefined，这是一个底层源码的问题，实际上肯定会有这个问题（数据分页，对应的key的数据还没加载），
        // 所以，如果需要 selectedRows 返回正确，必须传递 props.options.selectedRows 属性，在这里统一解决这个问题
        // 使用注意：
        // selectedRowKeys, selectedRows需要用 计算属性 传递才能正常工作，不用计算属性，外界变化了，组件无法响应
        // selectedRowKeys: computed(() => state.selectRows.map((item) => item.id),
        // selectedRows: computed(() => state.selectRows),
        const selectedRowsNormalized = selectedKeys?.reduce((sum, item) => {
          const _selectedRows =
            props.options?.selectedRows?.value ||
            props.options?.selectedRows ||
            [];
          let findOne = selectedRows
            ?.filter((item) => item)
            ?.find((one) => one[props.options?.rowKey] === item);
          if (!findOne && props.options?.selectedRows) {
            findOne = _selectedRows?.find(
              (one) => one[props.options?.rowKey] === item
            );
          }
          sum.push(findOne);
          return sum;
        }, []);
        props.options.rowSelection &&
          props.options.rowSelection(selectedKeys, selectedRowsNormalized);
      },
      getCheckboxProps: (record) =>
        props.options.getCheckboxProps &&
        props.options.getCheckboxProps(record),
    }
  : undefined;

const getSelectedColumns = () => {
  return state.selectColumns;
};

defineExpose({
  refreshCurrentPage: () => init(), // 刷新当前页数据, 只需要暴露刷新当前页的接口，供列表编辑、删除时手动调用
});
</script>

<style lang="scss" scoped>
.buttons {
  :deep(.ant-btn + .ant-btn) {
    margin-left: 10px;
  }
}
</style>
