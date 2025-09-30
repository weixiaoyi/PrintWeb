<template>
  <div class="notice">
    <RenderDom :render="renderNoticeModal" />
  </div>
</template>
<script setup lang="jsx">
import { onMounted } from "vue";
import RenderDom from "@/components/RenderDom";
import Modal from "@/components/Modal";

const store = useStore();

const state = reactive({
  notice: null,
  close: false,
});

const renderNoticeModal = () => {
  const notice = state.notice;
  if (!notice) return null;
  if (!notice.notice) return null;
  if (state.close) return null;
  const canCancel = notice.canCancel !== false;

  const close = () => {
    if (!canCancel) return;
    state.close = true;
  };

  const getContainer = () => {
    return document.getElementById("AppContainer");
  };

  return (
    <Modal
      title={
        <span>
          <Lang>{notice.title || "通知"}</Lang>
        </span>
      }
      ok={() => {
        close();
      }}
      cancel={() => {
        close();
      }}
      footer={canCancel ? undefined : null}
      getContainer={getContainer}
      closable={canCancel}
    >
      <div>
        {notice.desc && <div>{notice.desc}</div>}
        {notice.html && <div v-html={notice.html}></div>}
      </div>
    </Modal>
  );
};

onMounted(() => {
  window.electron.ipcRendererOn("checkAppNoticeSuccess", (event, payload) => {
    state.notice = payload;
  });
  setTimeout(() => {
    window.electron.ipcRenderer.send("checkAppNotice");
  }, 3000);
});
</script>
<style lang="scss" scoped>
.notice {
}
</style>
