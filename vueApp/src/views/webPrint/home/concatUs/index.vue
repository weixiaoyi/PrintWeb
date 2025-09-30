<template>
  <div>
    <a-spin :spinning="state.loading">
      <template v-if="state.html">
        <div v-html="state.html"></div>
      </template>
      <div class="_concat_" v-else>
        <ul v-if="state.finished">
          <li>
            <a class="link" @click="openLink">
              <Lang>杭州把把胡科技有限公司</Lang>
            </a>
          </li>
          <li style="margin-top: 10px">
            <span class="icons">
              <svg
                t="1753348516791"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="8253"
                width="15"
                height="15"
              >
                <path
                  d="M880.64 204.8h-737.28A61.44 61.44 0 0 0 81.92 265.0112v493.9776a61.44 61.44 0 0 0 18.0224 43.4176 59.8016 59.8016 0 0 0 41.7792 16.7936h737.28a61.44 61.44 0 0 0 61.44-61.44v-491.52A61.44 61.44 0 0 0 880.64 204.8z m0 573.44h-737.28a20.8896 20.8896 0 0 1-20.48-20.48V341.1968l358.8096 206.848a58.9824 58.9824 0 0 0 61.44 0L901.12 341.1968v417.792a20.48 20.48 0 0 1-20.48 19.2512zM901.12 294.0928l-378.88 218.7264a20.48 20.48 0 0 1-20.48 0L122.88 294.0928v-29.0816A20.48 20.48 0 0 1 143.36 245.76h737.28a20.48 20.48 0 0 1 20.48 20.48v26.624z"
                  p-id="8254"
                ></path>
              </svg>
              wxy18353268994@gmail.com
            </span>
            <span class="icons">
              <svg
                t="1753348442233"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="5390"
                width="15"
                height="15"
              >
                <path
                  d="M496.115756 914.261583m-39.980478 0a39.980478 39.980478 0 1 0 79.960956 0 39.980478 39.980478 0 1 0-79.960956 0Z"
                  fill="#999999"
                  p-id="5391"
                ></path>
                <path
                  d="M845.94694 804.183332l-0.001-603.174481V80.460713c0-44.161437-35.79852-79.960957-79.960956-79.960957h-539.736457c-44.161437 0-79.960957 35.79952-79.960956 79.960957v70.57354h-0.001v49.975598h0.001v603.174481h-0.001v49.975598h0.001V944.039043c0 44.161437 35.79952 79.960957 79.960956 79.960957h539.736457c44.162436 0 79.960957-35.79952 79.960956-79.960957v-89.880113h0.001v-49.975598zM196.263168 80.460713c0-16.533927 13.451432-29.985359 29.985359-29.985359h539.736457c16.533927 0 29.985359 13.451432 29.985359 29.985359v70.57354h-599.707175V80.460713z m0 120.548138h599.707175v603.174481h-599.707175V201.008851z m599.707175 743.030192c0 16.533927-13.451432 29.985359-29.985359 29.985359h-539.736457c-16.533927 0-29.985359-13.451432-29.985359-29.985359v-89.880113h599.707175V944.039043z"
                  fill="#999999"
                  p-id="5392"
                ></path>
              </svg>
              18353268994
            </span>
          </li>
          <li>
            <img :src="WeiXin" width="280" />
          </li>
          <li class="desc">
            <span v-if="isEnglish">
              This page and the overall theme color can be freely customized
              through the <a @click="openLinkNpm">web-print-pdf</a> API in the
              npm package
            </span>
            <span v-else>
              此页面及整体主题色可通过npm包
              <a @click="openLinkNpm">web-print-pdf</a>
              的Api自由定制
            </span>
          </li>
        </ul>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="jsx">
import { onMounted, reactive, useCssModule } from "vue";
import WeiXin from "@/assets/images/weixin.jpg";
import { shellOpenExternal } from "@/api/common";
import { getContactUsTabInnerHtml } from "@/api/app";

const router = useRouter();
const style = useCssModule();
const store = useStore();

const props = defineProps([]);

const state = reactive({
  loading: false,
  html: null,
});

const themeColor = computed(() => {
  return store.state.app.themeColor;
});

const isEnglish = computed(() => {
  return store.getters.isEnglish;
});

onMounted(() => {
  window.electron.ipcRendererOn(
    "setContactUsTabInnerHtmlSuccess",
    getContactUsTabInner
  );

  getContactUsTabInner();
});

const openLink = () => {
  shellOpenExternal({
    path: "http://webprintpdf.com",
  });
};

const openLinkNpm = () => {
  // https://www.npmjs.com/package/web-print-pdf
  shellOpenExternal({
    path: "https://www.npmjs.com/package/web-print-pdf",
  });
};

const getContactUsTabInner = async () => {
  state.loading = true;
  const res = await getContactUsTabInnerHtml().finally(() => {
    state.loading = false;
    state.finished = true;
  });
  state.html = res.data;
};
</script>

<style lang="scss" scoped>
._concat_ {
  flex-grow: 1;
  background: white;
  padding: 20px;
  display: flex;
  justify-content: center;

  ul {
    margin-top: 5px;

    li + li {
      margin-top: 10px;
    }

    li {
      display: flex;
      justify-content: center;
      align-items: center;

      .link {
        color: v-bind(themeColor);
      }

      > span + span {
        margin-left: 20px;
      }

      > span.icons {
        display: flex;
        align-items: center;

        svg {
          margin-right: 5px;
        }
      }
    }

    .desc {
      text-align: center;
      color: rgba(0, 0, 0, 0.4);
      max-width: 460px;
      margin-top: 20px;
    }
  }
}
</style>
