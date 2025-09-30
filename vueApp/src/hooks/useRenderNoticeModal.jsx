import { onMounted, reactive } from "vue";
import Modal from "@/components/Modal";

export default function useRenderNoticeModal(params) {
  const isDev = process.env.NODE_ENV === "development";
  const state = reactive({
    notice: null,
    close: false,
  });
  const store = useStore();

  const renderNoticeModal = () => {
    if (isDev || import.meta.env.VITE_APP_NOPAY === "true") return null;
    const notice = state.notice;
    if (!notice) return null;
    if (!notice.notice) return null;
    if (state.close) return null;
    if (notice.matchVersions && store.state.app?.packJson?.version) {
      const currentV = store.state.app.packJson.version.replace(/\./g, "");
      const minV = notice.matchVersions.min.replace(/\./g, "");
      const maxV = notice.matchVersions.max.replace(/\./g, "");
      if (!currentV) return null;
      if (minV && currentV < minV) return null;
      if (maxV && currentV > maxV) return null;
    }
    const canCancel = notice.canCancel !== false;

    const close = () => {
      if (!canCancel) return;
      state.close = true;
    };

    return (
      <Modal
        title={notice.title || "通知"}
        ok={() => {
          close();
        }}
        cancel={() => {
          close();
        }}
        footer={canCancel ? undefined : null}
      >
        <div>
          {notice.desc && <div>{notice.desc}</div>}
          {notice.html && <div v-html={notice.html}></div>}
          {notice?.versionUpdate?.latestVersion &&
            notice?.versionUpdate?.downloadUrl && (
              <div style="margin-top:10px">
                最新版本下载地址
                <a
                  style="margin-left:10px"
                  onClick={() => {
                    window.electron.shell.openExternal(
                      notice?.versionUpdate?.downloadUrl
                    );
                  }}
                >
                  {notice?.versionUpdate?.downloadUrl}
                </a>
              </div>
            )}
        </div>
      </Modal>
    );
  };

  return {
    renderNoticeModal,
  };
}
