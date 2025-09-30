<template>
  <div class="preview">
    <div class="content">
      <div class="left">
        <a-spin
          :spinning="renderComputedProgress.renderPdfLoading"
          :tip="renderComputedProgress.progressText"
        >
          <div
            :style="{ height: heightNormalized }"
            :class="{
              docContainer: true,
              gray: state.form.colorful === false,
            }"
            v-if="pdfComputedUrl"
          >
            <div class="pagination" v-if="files.length > 1">
              <a-button
                v-if="activeIndex > 0"
                size="small"
                @click="() => switchTo(-1)"
              >
                <Lang>上一页</Lang>
              </a-button>
              <a-button
                v-if="activeIndex !== 0 && files.length > 2"
                size="small"
                @click="() => switchTo(0)"
              >
                <Lang>首页</Lang>
              </a-button>
              <a-button
                v-if="activeIndex < files.length - 1"
                size="small"
                @click="() => switchTo(1)"
              >
                <Lang>下一页</Lang>
              </a-button>
              <span class="pageAnalysis">
                <span v-if="isEnglish">
                  {{ activeIndex + 1 }}
                  <span class="separate">/</span>
                  total {{ files.length }} documents
                </span>
                <span v-else>
                  {{ activeIndex + 1 }}
                  <span class="separate">/</span>
                  共{{ files.length }}份
                </span>
              </span>
            </div>
            <div class="utilsContainer">
              <div
                class="progress"
                v-if="renderComputedProgress.showTopProgress"
              >
                <a-progress :percent="renderComputedProgress.percent" />
                <a-tooltip placement="bottom">
                  <template #title>
                    <span v-if="isEnglish">
                      This progress represents the progress of pdf conversion.
                      As the file is relatively large, some of the converted
                      pages will be displayed first. This progress does not
                      affect the actual printing effect and is only used to
                      preview the configuration effect！
                    </span>
                    <span v-else>
                      此进度代表pdf转换进度。由于文件比较大，优先展示部分转换好的页面。此进度不影响实际的打印效果，仅用来预览配置效果！
                    </span>
                  </template>
                  <QuestionCircleOutlined />
                </a-tooltip>
              </div>
              <div class="showDefaultPdfUtil">
                <span class="label">
                  <Lang>显示系统默认PDF工具栏</Lang>
                </span>
                <a-checkbox
                  @change="handleSelectShowPdfUtil"
                  :checked="state.showPdfUtils"
                />
              </div>
            </div>
            <Iframe
              :key="state.showPdfUtils"
              :src="pdfComputedUrl"
              width="100%"
              height="100%"
            />
          </div>
          <div v-else :style="{ height: heightNormalized }" class="empty">
            <div v-if="state.paperLoading">
              <Lang>获取纸张中</Lang>
              ...
            </div>
          </div>
        </a-spin>
      </div>

      <a-spin :spinning="state.loading">
        <div class="right">
          <div class="title">
            <Lang>打印设置</Lang>
          </div>
          <div class="buttons">
            <a-button
              type="primary"
              @click="handlePrint"
              :loading="state.printLoading"
            >
              <Lang>打印</Lang>
            </a-button>
            <a-button @click="handleReset">
              <Lang>重置</Lang>
            </a-button>
          </div>
          <div class="item">
            <span class="label">
              <Lang>目标打印机</Lang>
            </span>
            <div class="control">
              <a-select
                v-model:value="state.form.printerName"
                :placeholder="
                  isEnglish ? 'Select target printer' : '选择目标打印机'
                "
                style="width: 100%"
                :options="state.printers"
                @change="handlePrinterChange"
              ></a-select>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <a-tooltip placement="topLeft">
                <template #title>
                  <span v-if="isEnglish">
                    This option lists the paper formats supported by the current
                    printer. The paper size is a pre entered reference standard
                    size, which may vary depending on different countries,
                    regions, or industry standards. Here, we will try our best
                    to display the output effect at different sizes. The actual
                    size is subject to the printer output size. A4 paper is used
                    as a reference for items without specified size. All the
                    papers listed in the current list can be used as the
                    "paperFormat" attribute value for the current printer's
                    "printOptions".
                  </span>
                  <span v-else>
                    此选择项列出的是当前打印机支持的纸张格式。
                    纸张尺寸为预录入的参考标准尺寸，不同国家地区或行业标准有所差异，这里尽最大程度展示在不同尺寸下输出效果，实际尺寸以打印机输出尺寸为准。
                    未标明尺寸的以A4纸张作为参考。当前列表列出的所有的纸张，均可作为
                    当前打印机 “printOptions” 的 “paperFormat” 属性值。
                  </span>
                </template>
                <Lang>纸张</Lang>
                <QuestionCircleOutlined style="margin-left: 2px" />
              </a-tooltip>
            </span>
            <div class="control">
              <a-select
                :loading="state.paperLoading"
                v-model:value="state.form.paperFormat"
                show-search
                :placeholder="isEnglish ? 'Select paper' : '选择打印纸张'"
                style="width: 100%"
                :options="state.papers"
                @change="handlePaperChange"
              >
                <template v-slot:option="options">
                  <RenderDom
                    :render="() => dropdownRenderPaperOptions(options)"
                  />
                </template>
              </a-select>

              <div v-if="state.renderPaper" class="valueDesc">
                <span><Lang>尺寸</Lang>：</span>
                <span v-if="state.renderPaper.width">
                  {{ state.renderPaper.width }} x
                  {{ state.renderPaper.height }} mm
                </span>
                <span v-else><Lang>无标准尺寸</Lang></span>
              </div>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>缩放</Lang>
            </span>
            <div class="control">
              <a-select
                v-model:value="state.form.scaleMode"
                :placeholder="isEnglish ? 'Select zoom' : '选择缩放'"
                style="width: 100%"
                :options="scaleModeOptions"
                @change="handleScaleModeChange"
              >
              </a-select>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>内容布局</Lang>
            </span>
            <div class="control">
              <a-radio-group
                v-model:value="state.form.landscape"
                placeholder="选择内容布局"
                style="width: 100%"
                :options="landscapeOptions"
                @change="handleLandscapeChange"
              >
              </a-radio-group>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>单双面</Lang>
            </span>
            <div class="control">
              <a-select
                v-model:value="state.form.duplexMode"
                :placeholder="isEnglish ? 'Select sides' : '选择单双面'"
                style="width: 100%"
                :options="duplexModeOptions"
              >
              </a-select>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>颜色</Lang>
            </span>
            <div class="control">
              <a-select
                v-model:value="state.form.colorful"
                :placeholder="isEnglish ? 'Select color' : '选择颜色'"
                style="width: 100%"
                :options="colorfulOptions"
              >
              </a-select>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>份数</Lang>
            </span>
            <div class="control">
              <a-input-number
                v-model:value="state.form.copies"
                :placeholder="isEnglish ? 'Input copies' : '输入打印份数'"
                style="width: 100%"
                :min="1"
                :step="1"
                :precision="0"
                :controls="false"
              >
              </a-input-number>
            </div>
          </div>
          <div class="item">
            <span class="label">
              <Lang>页面</Lang>
            </span>
            <div class="control">
              <a-select
                v-model:value="state.pageRangeType"
                :placeholder="isEnglish ? 'Select Pages' : '选择页面'"
                style="width: 100%"
                :options="pageRangeTypeOptions"
              >
              </a-select>
              <ul
                class="pageRanges"
                v-if="
                  state.pageRangeType === 2 && state.pageRangesInputs?.length
                "
              >
                <li
                  v-for="(item, index) in state.pageRangesInputs"
                  :key="index"
                >
                  <div class="leftc">
                    <a-input-number
                      v-model:value="item.from"
                      :placeholder="isEnglish ? 'Start page' : '起始页'"
                      :min="1"
                      :max="state.pdfPageCount"
                      :step="1"
                      :precision="0"
                      :controls="false"
                      @change="handleRangeFromChange"
                    />
                    <div style="margin: 0 10px">-</div>
                    <a-input-number
                      v-model:value="item.to"
                      :placeholder="isEnglish ? 'End Page' : '结束页'"
                      :min="1"
                      :max="state.pdfPageCount"
                      :step="1"
                      :precision="0"
                      :controls="false"
                      @change="handleRangeToChange"
                    />
                  </div>
                  <span class="icon">
                    <MinusCircleOutlined
                      v-if="index > 0"
                      @click="() => handleRemoveRange(index)"
                    />
                    <PlusCircleOutlined
                      v-if="index === state.pageRangesInputs?.length - 1"
                      @click="handleAddRange"
                    />
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { degrees, PDFDocument } from "pdf-lib";
import { debounce } from "lodash";
import Iframe from "@/components/Iframe";
import { getPrinterList, getPrinterPaper } from "@/api/print";
import { printPreviewFile } from "@/api/common";
import RenderDom from "@/components/RenderDom";
import { isEmptyValue } from "@/utils/fn";
import {
  MinusCircleOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import useRenderWithLang from "@/hooks/useRenderLang";
import Clipboard from "@/components/clipboard/index.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();

const props = defineProps({
  pdfParams: {
    type: Object,
  },
  files: {
    type: Array,
    default: [],
  },
  switchTo: {
    type: Function,
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
});

let sourcePdf = ref(null);
const state = reactive({
  loading: false,
  paperLoading: false,
  renderPdfLoading: false,
  renderProgress: {
    page: 0,
    totalPages: 0,
    startTime: null,
    updateTime: null,
  },
  printers: [],
  papers: [],
  form: {
    printerName: undefined,
    paperFormat: undefined,
    scaleMode: undefined,
    copies: undefined,
    landscape: undefined,
    duplexMode: undefined,
    colorful: undefined,
    pageRanges: undefined,
  },
  renderPdfDocTimestamp: Date.now(),
  renderPaper: null,
  showPdfUtils:
    localStorage.getItem("showPdfUtils") === "false"
      ? false
      : localStorage.getItem("showPdfUtils"),
  pageRangeType: null,
  pageRangesInputs: [{}],
  pdfPageCount: null,
});

const isEnglish = computed(() => {
  return store.getters.isEnglish;
});

const operationSuccessText = useRenderWithLang(
  "操作成功！",
  "Successful operation!"
);

const scaleModeOptions = computed(() => {
  return [
    {
      label: isEnglish.value
        ? "Reduce the page to a printable area (if necessary) (default)"
        : "将页面缩小至可打印区域 (如果需要) (默认)",
      value: "shrink",
    },
    {
      label: isEnglish.value
        ? "Use the original page size"
        : "使用原始页面大小",
      value: "noscale",
    },
    {
      label: isEnglish.value
        ? "Adjust the page to the printable area"
        : "调整页面至可打印区域",
      value: "fit",
    },
  ];
});

const duplexModeOptions = computed(() => {
  return [
    {
      label: isEnglish.value ? "Single-sided printing" : "单面打印",
      value: "simplex",
    },
    {
      label: isEnglish.value
        ? "Ordinary double-sided printing"
        : "普通双面打印",
      value: "duplex",
    },
    {
      label: isEnglish.value
        ? "Print on both sides along the short edge"
        : "沿短边双面打印",
      value: "duplexshort",
    },
    {
      label: isEnglish.value
        ? "Print on both sides along the long edge"
        : "沿长边双面打印",
      value: "duplexlong",
    },
  ];
});

const colorfulOptions = computed(() => {
  return [
    {
      label: isEnglish.value ? "Color" : "颜色",
      value: true,
    },
    {
      label: isEnglish.value ? "Black and white" : "黑白",
      value: false,
    },
  ];
});

const landscapeOptions = computed(() => {
  return [
    {
      label: isEnglish.value ? "Portrait" : "纵向",
      value: false,
    },
    {
      label: isEnglish.value ? "Landscape" : "横向",
      value: true,
    },
  ];
});

const pageRangeTypeOptions = computed(() => {
  return [
    {
      label: isEnglish.value ? "All" : "全部",
      value: 1,
    },
    {
      label: isEnglish.value ? "Custom" : "自定义",
      value: 2,
    },
  ];
});

const heightNormalized = computed(() => {
  return state.clientHeight;
});

const paramsPdfUrl = computed(() => {
  return {
    pdfUrl: props.pdfParams.pdfUrl,
  };
});

const pdfComputedUrl = computed(() => {
  if (state.pdfUrl) {
    return state.pdfUrl + `#toolbar=${state.showPdfUtils ? 1 : 0}`;
  }
  return null;
});

const renderComputedProgress = computed(() => {
  const { page = 1, totalPages = 1, showNewPdf } = state.renderProgress;
  const isFinish = page === totalPages;
  const wasteTime =
    (state.renderProgress.updateTime - state.renderProgress.startTime) / 1000;

  const showTopProgress = !isFinish && wasteTime > 2;
  if (showTopProgress && !state.pdfUrl) {
    showNewPdf && showNewPdf();
  }
  return {
    progressText: isEnglish.value
      ? `Loading progress ${page}/${totalPages}`
      : `加载进度 ${page}/${totalPages}`,
    percent: ((page / totalPages) * 100).toFixed(0),
    showTopProgress,
    renderPdfLoading: state.renderPdfLoading && !showTopProgress,
  };
});

onMounted(() => {
  getPageHeight();
  window.addEventListener("resize", getPageHeight);
  init();
});

const getPageHeight = debounce(() => {
  const height = +getComputedStyle(
    document.getElementById("_printPreview")
  )?.height?.replace("px", "");
  state.clientHeight = height - 20 + "px";
}, 500);

const pageRangesNormalized = computed(() => {
  let pageRanges = null;
  if (+state.pageRangeType === 1) {
  } else if (+state.pageRangeType === 2) {
    pageRanges = state.pageRangesInputs?.filter((item) => item.from && item.to);
  }
  return {
    pageRanges,
    pageRangesLength: pageRanges?.length,
  };
});

watch(
  () => JSON.stringify(pageRangesNormalized.value.pageRanges),
  (v1, v2) => {
    if (v1 !== v2) {
      state.form.pageRanges = pageRangesNormalized.value.pageRanges;
      renderPdfDoc();
    }
  }
);

const mmToPoints = (mmValue) => {
  return (mmValue * 72) / 25.4;
};

const init = async () => {
  const { printerName } = props.pdfParams.printOptions || {};
  await getPrinters();
  await getPapers(printerName);
  getDefaultPaper();
  getDefaultScaleMode();
  getDefaultLayout();
  getDefaultCopies();
  getDefaultDuplexMode();
  getDefaultColorful();
  getDefaultPageRangeType();
  renderPdfDoc();
};

const _renderPdfDoc = async () => {
  state.pdfUrl = null;
  state.renderProgress = {
    startTime: Date.now(),
  };
  const currentRenderPdfDocTimestamp = state.renderPdfDocTimestamp;
  const checkIsBreak = () => {
    return currentRenderPdfDocTimestamp !== state.renderPdfDocTimestamp;
  };
  let paper;
  if (state.form.paperFormat) {
    const paperFormat = state.form.paperFormat;
    paper = state.papers?.find((one) => one.value === paperFormat);
    if (state.form.paperFormat !== state.renderPaper?.name) {
      state.renderPaper = paper;
    }
  }

  const scaleMode = state.form.scaleMode;

  const landscape = state.form.landscape;

  const pageRangesComputed = pageRangesNormalized.value.pageRanges;

  if (paper && paper.width && paper.height) {
    try {
      if (!sourcePdf.value) {
        sourcePdf.value = await fetch(paramsPdfUrl.value.pdfUrl).then((res) =>
          res?.arrayBuffer()
        );
      }
      const newPaperWidth = mmToPoints(paper.width);
      const newPaperHeight = mmToPoints(paper.height);
      if (checkIsBreak()) return;
      state.renderPdfLoading = true;
      const newPdfDoc = await PDFDocument.create();

      const showNewPdf = async () => {
        if (checkIsBreak()) return;
        const pdfBytes = await newPdfDoc.save();
        if (checkIsBreak()) return;
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        state.pdfUrl = URL.createObjectURL(blob);
      };

      if (checkIsBreak()) return;
      const pdfDoc = await PDFDocument.load(sourcePdf.value, {
        parseSpeed: Infinity,
      });
      if (checkIsBreak()) return;
      const pageCount = pdfDoc.getPageCount();
      state.pdfPageCount = pageCount;
      for (let j = 0; j < pageCount; j++) {
        if (checkIsBreak()) {
          break;
        }
        state.renderProgress = {
          ...state.renderProgress,
          page: j + 1,
          totalPages: state.pdfPageCount,
          updateTime: Date.now(),
          showNewPdf,
        };
        if (
          pageRangesComputed?.length &&
          !pageRangesComputed?.find((one) => {
            const ins = j + 1;
            const min = Math.min(one.from, one.to);
            const max = Math.max(one.from, one.to);
            return ins >= min && ins <= max;
          })
        ) {
          continue;
        }
        const page = newPdfDoc.addPage([newPaperWidth, newPaperHeight]);
        const [embeddedPage] = await newPdfDoc.embedPdf(sourcePdf.value, [j]);
        /*
         * 好的，去掉 printableArea 的边界逻辑，只关注核心的缩放逻辑：
         * shrink 模式：
         * 计算缩放比例 = min(纸张宽度/页面宽度, 纸张高度/页面高度)
         * 如果计算出的缩放比例 > 1.0（即页面小于纸张），就使用 1.0（保持原始大小）
         * 如果计算出的缩放比例 < 1.0（即页面大于纸张），就使用计算出的缩放比例（缩小）
         * 最后居中显示
         * fit 模式：
         * 计算缩放比例 = min(纸张宽度/页面宽度, 纸张高度/页面高度)
         * 直接使用计算出的缩放比例
         * 如果页面小于纸张，缩放比例 > 1.0，会放大
         * 如果页面大于纸张，缩放比例 < 1.0，会缩小
         * 最后居中显示
         * 简单来说：
         * shrink：只缩小，不放大
         * fit：既可能缩小，也可能放大，总之要填满纸张
         */

        const { width, height } = embeddedPage.size();
        const [oldPageWidth, oldPageHeight] = [width, height];
        let x;
        let y;
        let rotate;
        const scale_x = newPaperWidth / oldPageWidth;
        const scale_y = newPaperHeight / oldPageHeight;
        let zoom = Math.min(scale_x, scale_y);
        if (landscape) {
          const scale_x = newPaperWidth / oldPageHeight;
          const scale_y = newPaperHeight / oldPageWidth;
          zoom = Math.min(scale_x, scale_y);
        }

        if (scaleMode === "noscale") {
          x = 0;
          y = newPaperHeight - oldPageHeight;
          zoom = 1;
          if (landscape) {
            y = newPaperHeight;
          }
        } else {
          if (scaleMode === "shrink" && zoom > 1) {
            zoom = 1;
          }
          x = newPaperWidth / 2 - (oldPageWidth * zoom) / 2;
          y = newPaperHeight / 2 - (oldPageHeight * zoom) / 2;
          if (landscape) {
            x = newPaperWidth / 2 - (oldPageHeight * zoom) / 2;
            y = newPaperHeight / 2 + (oldPageWidth * zoom) / 2;
          }
        }

        if (landscape) {
          rotate = degrees(-90);
        }

        page.drawPage(embeddedPage, {
          x,
          y,
          xScale: zoom,
          yScale: zoom,
          ...(rotate ? { rotate } : {}),
        });
      }
      await showNewPdf();
    } catch (err) {
      console.error(err);
      message.error(err?.message || err);
      state.pdfUrl = paramsPdfUrl.value.pdfUrl;
    } finally {
      if (checkIsBreak()) return;
      state.renderPdfLoading = false;
      state.renderProgress = {};
    }
  } else {
    state.renderPdfLoading = false;
    state.pdfUrl = paramsPdfUrl.value.pdfUrl;
    state.renderProgress = {};
  }
};

const renderPdfDoc = () => {
  state.renderPdfDocTimestamp = Date.now();
  _renderPdfDoc();
};

const getPrinters = async () => {
  if (sessionStorage.getItem("printers")) {
    try {
      state.printers = JSON.parse(sessionStorage.getItem("printers"));
      return;
    } catch {}
  }
  state.loading = true;
  const res = await getPrinterList()
    .catch(message.error)
    .finally(() => {
      state.loading = false;
    });
  if (res?.data) {
    state.printers = res.data.map((item) => {
      return {
        ...item,
        label: item.name,
        value: item.name,
      };
    });
    sessionStorage.setItem("printers", JSON.stringify(state.printers));
  }
};

const getPapers = async (printerNameInput) => {
  state.form.paperFormat = null;
  state.papers = [];
  state.renderPaper = null;
  if (!state.printers?.length) return;
  let printerName = printerNameInput;
  if (printerName) {
    printerName = state.printers.find(
      (one) => one.value === printerName
    )?.value;
  }
  if (!printerName) {
    printerName = state.printers.find((one) => one.default)?.label;
  }

  if (!printerName) return;
  state.form.printerName = printerName;
  state.paperLoading = true;
  const res = await getPrinterPaper({
    printer: {
      name: printerName,
    },
  })
    .catch(message.error)
    .finally(() => {
      state.paperLoading = false;
    });
  if (res?.data) {
    state.papers = res.data.map((item) => {
      return {
        ...item,
        label: item.name,
        value: item.name,
      };
    });
  }
};

const getDefaultPaper = () => {
  let { paperFormat } = props.pdfParams.printOptions || {};
  if (paperFormat) {
    const paper = state.papers.find((one) => one.value === paperFormat);
    if (paper) {
      state.form.paperFormat = paper.value;
    }
  } else if (state.papers.find((one) => one.value === "A4")) {
    state.form.paperFormat = "A4";
  }
};

const getDefaultScaleMode = () => {
  let { scaleMode } = props.pdfParams.printOptions || {};
  if (scaleMode) {
    scaleMode = scaleModeOptions.value.find(
      (one) => one.value === scaleMode
    )?.value;
  } else {
    scaleMode = "shrink";
  }
  state.form.scaleMode = scaleMode;
};

const getDefaultCopies = () => {
  let { copies } = props.pdfParams.printOptions || {};
  if (copies && copies >= 1) {
    state.form.copies = copies;
  }
};

const getDefaultLayout = () => {
  let { landscape } = props.pdfParams.printOptions || {};
  state.form.landscape = Boolean(landscape);
};

const getDefaultColorful = () => {
  let { colorful } = props.pdfParams.printOptions || {};
  if (!isEmptyValue(colorful)) {
    state.form.colorful = !!colorful;
  }
};

const getDefaultDuplexMode = () => {
  let { duplexMode } = props.pdfParams.printOptions || {};
  const findOne = duplexModeOptions.value?.find(
    (one) => one.value === duplexMode
  );
  if (findOne) {
    state.form.duplexMode = duplexMode;
  } else {
    state.form.duplexMode = "simplex";
  }
};

const getDefaultPageRangeType = () => {
  let { pageRanges } = props.pdfParams.printOptions || {};
  if (
    !isEmptyValue(pageRanges) &&
    Array.isArray(pageRanges) &&
    pageRanges?.length
  ) {
    state.pageRangeType = 2;
    state.pageRangesInputs = pageRanges.map((item) => {
      return {
        from: item.from,
        to: item.to,
      };
    });
  } else {
    state.pageRangeType = 1;
  }
};

const handlePrinterChange = async (v, item) => {
  await getPapers(item.name);
  if (state.papers?.find((one) => one.value === "A4")) {
    state.form.paperFormat = "A4";
  }
  renderPdfDoc();
};

const handlePaperChange = (v, item) => {
  state.form.paperFormat = item.name;
  renderPdfDoc();
};

const handleScaleModeChange = (v) => {
  state.form.scaleMode = v;
  renderPdfDoc();
};

const handleLandscapeChange = (e) => {
  state.form.landscape = e.target.value;
  renderPdfDoc();
};

const handleSelectShowPdfUtil = (e) => {
  state.showPdfUtils = e.target.checked;
  localStorage.setItem("showPdfUtils", e.target.checked);
};

const handleAddRange = () => {
  state.pageRangesInputs.push({});
};

const handleRemoveRange = (index) => {
  state.pageRangesInputs.splice(index, 1);
};

const dropdownRenderPaperOptions = (options) => {
  return (
    <div style="display: flex;justify-content: space-between;">
      <span style="max-width:150px;text-overflow: ellipsis;overflow: hidden;">
        <Clipboard mode={2}>{options.label}</Clipboard>
      </span>
      {options.width && (
        <span>
          {options.width}x{options.height}
        </span>
      )}
    </div>
  );
};

onUnmounted(() => {
  window.removeEventListener("resize", getPageHeight);
});

const handlePrint = async () => {
  const printOptions = {
    ...(props.pdfParams?.printOptions || {}),
    ...JSON.parse(JSON.stringify(state.form)),
  };
  state.printLoading = true;
  await printPreviewFile({
    pdfFilePath: props.pdfParams.pdfFilePath,
    printOptions,
  })
    .then(() => {
      message.success(operationSuccessText.value);
    })
    .catch((err) => {
      if (err?.message) {
        message.error(err.message);
      } else if (typeof err === "string") {
        message.error(err);
      } else {
        message.error(`catch an error: ${err}`);
      }
    })
    .finally(() => {
      state.printLoading = false;
    });
};

const handleReset = () => {
  sessionStorage.removeItem("printers");
  window.location.reload();
};
</script>

<style lang="scss" scoped>
.preview {
  padding: 10px;
  width: 100%;
  height: 100%;
  padding-right: 20px;
  display: flex;
  justify-content: center;

  .content {
    width: 100%;
    display: flex;
    justify-content: space-between;

    .left {
      flex-grow: 2;
      background: rgb(235, 235, 235);

      .docContainer {
        display: flex;
        flex-direction: column;

        &.gray {
          filter: grayscale(100%);
          -webkit-filter: grayscale(100%);
          -moz-filter: grayscale(100%);
          -o-filter: grayscale(100%);
          -webkit-filter: grayscale(1);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          padding-bottom: 10px;

          button + button {
            margin-left: 10px;
          }

          .pageAnalysis {
            margin-left: 10px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            white-space: nowrap;

            .separate {
              margin: 0 2px;
            }
          }
        }

        .utilsContainer {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          .showDefaultPdfUtil {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-top: 5px;
            margin-bottom: 5px;
            margin-right: 10px;
            font-size: 12px;

            .label {
              margin-right: 10px;
              color: rgba(0, 0, 0, 0.5);
            }
          }

          .progress {
            display: flex;
            align-items: center;
            flex-grow: 1;
            padding: 0 10px;
            margin-right: 40px;
          }
        }
      }

      iframe {
        border: none;
        width: 100%;
      }

      .empty {
        display: flex;
        justify-content: center;
        padding-top: 200px;
      }
    }

    .right {
      margin-left: 30px;
      width: 400px;
      flex-grow: 1;

      .title {
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 1;
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        margin-bottom: 20px;

        button + button {
          margin-left: 10px;
        }
      }

      .item + .item {
        margin-top: 30px;
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .label {
          white-space: nowrap;
        }

        .control {
          width: 300px;

          .valueDesc {
            font-size: 12px;
            margin-top: 5px;
            color: rgba(0, 0, 0, 0.4);
          }
        }
      }

      .pageRanges {
        margin-top: 10px;

        li + li {
          margin-top: 10px;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .leftc {
            display: flex;
            align-items: center;
          }

          .icon {
            cursor: pointer;
            margin-left: 10px;
            font-size: 16px;
            color: #005aac;

            > span + span {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
