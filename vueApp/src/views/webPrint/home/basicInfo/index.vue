<template>
  <div class="basicInfo">
    <div class="autoLaunch">
      <a-radio :checked="state.selfStart" @click="switchStart">
        <Lang>开机自启动</Lang>
      </a-radio>
    </div>
    <div class="item">
      <a-card style="width: 100%">
        <template #title>
          <Lang>授权</Lang>
        </template>
        <RenderDom :render="renderLis" />
<!--        <p>-->
<!--          <Upload-->
<!--            uploadText="导入授权证书"-->
<!--            accept=".cert"-->
<!--            :onChange="handleUploadFile"-->
<!--            :key="state.uploadPdfKey"-->
<!--            :showFileList="false"-->
<!--          />-->
<!--        </p>-->
      </a-card>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { onMounted, reactive, useCssModule } from "vue";
import Upload from "@/components/Form/upload.vue";
import {
  doImportAuthorityFile,
  getAuthority,
  getAutoLaunchStatus,
  getMachineId,
  switchAutoLaunchStatus,
} from "@/api/app";
import dayjs from "dayjs";
import RenderDom from "@/components/RenderDom";
import ClipBoard from "@/components/ClipBoard";

const router = useRouter();
const style = useCssModule();

const props = defineProps([]);

const state = reactive({
  selfStart: false,
  machineId: null,
  authority: null,
  uploadPdfKey: Date.now(),
});

const authorityComputed = computed(() => {
  return {
    isNotValid: state.authority?.status === 0 || state.authority?.status === 2,
    authorityText: {
      0: "未授权",
      1: "已授权",
      2: "授权已过期",
    }[state.authority?.status || 0],
    time:
      state.authority?.startTime && state.authority?.endTime
        ? `${dayjs(state.authority?.startTime).format("YYYY-MM-DD")} - ${dayjs(
            state.authority?.endTime
          ).format("YYYY-MM-DD")}`
        : null,
    message: state.authority?.message,
    periodText: {
      1: "试用中",
      2: "试用结束",
    }[state.authority?.periodStatus],
    periodFinished: +state.authority?.periodStatus === 2,
    periodEndTimeShow: dayjs(state.authority?.periodEndTime).format(
      "YYYY-MM-DD"
    ),
  };
});

const renderLis = () => {
  const list = [
    {
      label: "设备特征码",
      value: <ClipBoard>{state.machineId}</ClipBoard>,
    },
    {
      label: "授权状态",
      value: <Lang>{authorityComputed.value.authorityText}</Lang>,
    },
    {
      label: "授权时间",
      value: authorityComputed.value.time,
      show: !!authorityComputed.value.time,
    },
    {
      label: "授权备注",
      value: authorityComputed.value.message,
      show: !!authorityComputed.value.message,
    },
    {
      label: "试用状态",
      value: <Lang>{authorityComputed.value.periodText}</Lang>,
      show: !!authorityComputed.value.isNotValid,
      style: authorityComputed.value.periodFinished
        ? {
            color: "red",
          }
        : {},
    },
    {
      label: "试用截至",
      value: authorityComputed.value.periodEndTimeShow,
      show: !!(
        authorityComputed.value.isNotValid &&
        !authorityComputed.value.periodFinished
      ),
    },
  ].filter((item) => item.show !== false);
  return list.map((item) => {
    return (
      <p>
        <Lang>{item.label}</Lang> : <span style={item.style}>{item.value}</span>
      </p>
    );
  });
};

onMounted(() => {
  getLaunchStatus();
  getMachineUid();
  getAuthorities();
});

const getLaunchStatus = async () => {
  const res = await getAutoLaunchStatus();
  state.selfStart = res.data;
};

const switchStart = async () => {
  await switchAutoLaunchStatus({
    status: !state.selfStart,
  });
  getLaunchStatus();
};

const getMachineUid = async () => {
  const res = await getMachineId();
  state.machineId = res.data;
};

const getAuthorities = async () => {
  const res = await getAuthority();
  state.authority = res.data;
};

const handleUploadFile = async (result) => {
  const uploadFile = result?.[0];
  if (uploadFile) {
    await doImportAuthorityFile({
      fileName: uploadFile.fileName,
      filePath: uploadFile.filePath,
    }).finally(() => {
      state.uploadPdfKey = Date.now();
    });
    getAuthorities();
  }
};
</script>

<style lang="scss" scoped>
.basicInfo {
  flex-grow: 1;
  background: white;
  padding: 20px;

  .autoLaunch {
    margin-bottom: 20px;
  }

  .periodEnd .value {
    color: red;
  }
}
</style>
