const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { treeFn } = require("../helper/index");
const util = require("util");
const html2pdf = require("./html2pdf");
const { appStoragePath } = require("../helper");

const readFilePromisify = util.promisify(fs.readFile); // 转化为 promise
const writeFilePromisify = util.promisify(fs.writeFile);
const menuItemLength = 45; //目录展示的项数量（最多45个）

const _getTestFilePath = (fileName) => {
    return path.join(__dirname, "/test", fileName);
};

const _getFontFilePath = (fileName) => {
    return path.join(__dirname, "/fonts", fileName);
};

const _checkPDFSize = async ({ sourceFiles = [] }) => {
    let byteSize = 0; // 字节总大小
    let pageSize = 0; // 页码总数量
    for (let i = 0; i < sourceFiles.length; i++) {
        const localPath = sourceFiles[i];
        if (localPath) {
            const readFileBuffer = await readFilePromisify(localPath);
            const PDFItem = await PDFDocument.load(readFileBuffer);
            const pageCount = PDFItem.getPageCount();
            pageSize += pageCount;
            byteSize += Buffer.byteLength(readFileBuffer);
        }
    }
    const byteSizeGB = byteSize / 1024 / 1024 / 1024;
    const result = {
        pageSize,
        byteSizeGB,
        byteSizeGBShow: byteSizeGB.toFixed(2),
    };
    if (result.pageSize > 40000) {
        return Promise.reject({
            code: "maxPageSize",
            message: `所有Pdf总页数不可超过 4万 页，当前已上传的Pdf总页数 ${result.pageSize} 页`,
        });
    } else if (result.byteSizeGB > 1.95) {
        return Promise.reject({
            code: "maxByteSize",
            message: `所有Pdf文件体积总大小不可超过 1.95G，当前已上传的Pdf总大小 ${result.byteSizeGBShow}G`,
        });
    }
};

const _mergePDF = async ({ pdfDoc, sourceFiles = [] }) => {
    //合并PDF
    const pdfDocCounts = {};
    if (!pdfDoc) {
        pdfDoc = await PDFDocument.create();
    }
    for (let i = 0; i < sourceFiles.length; i++) {
        const localPath = sourceFiles[i];
        if (localPath) {
            const readFileBuffer = await readFilePromisify(localPath);
            const PDFItem = await PDFDocument.load(readFileBuffer);
            const pageCount = PDFItem.getPageCount();
            pdfDocCounts[localPath] = pageCount;
            for (let j = 0; j < pageCount; j++) {
                const [PDFPageItem] = await pdfDoc.copyPages(PDFItem, [j]);
                pdfDoc.addPage(PDFPageItem);
            }
        }
    }
    return {
        pdfDoc,
        pdfDocCounts,
    };
};

const _savePdf = async (pdfDoc, { outputFile }) => {
    const pdfBytes = await pdfDoc.save();
    await writeFilePromisify(outputFile, pdfBytes);
};

const _createPageLinkAnnotation = (
    pdfDoc,
    pageRef,
    anchorBounds = [],
    showBorder = true
) => {
    // 创建internal page link（内部页面跳转）
    return pdfDoc.context.register(
        pdfDoc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            /* Bounds of the link on the page */
            Rect: [
                anchorBounds[0], // lower left x coord
                anchorBounds[1], // lower left y coord
                anchorBounds[2], // upper right x coord
                anchorBounds[3], // upper right y coord
            ],
            /* Give the link a 2-unit-wide border, with sharp corners */
            Border: [0, 0, showBorder ? 2 : 0],
            /* Make the border color blue: rgb(0, 0, 1) */
            C: [0, 0, 1],
            /* Page to be visited when the link is clicked */
            Dest: [pageRef, "XYZ", null, null, null],
        })
    );
};

const _getSourceFilesFromMenus = (menus = []) => {
    const result = [];
    treeFn(menus, (item) => {
        if (item.title) {
            result.push({
                ...item,
                title: item.title?.slice(0, 45)?.replace(/\n/g, ""),
                range: item.index + 1,
                sourceFile: item.sourceFile,
            });
        }
        return item;
    });
    return result;
};

const _generateMenus = ({
                            pdfDoc,
                            menus = [],
                            menuPageNums,
                            font,
                            fontSize = 10,
                            paddingLeftRight = 40,
                            paddingTopBottom = 80,
                            lineGap = 5, // 行间距
                        }) => {
    //生成目录
    const lineHeight = fontSize; // 行高
    new Array(menuPageNums).fill().forEach((undefined, pageNum) => {
        const page = pdfDoc.getPage(pageNum);
        page.setFont(font);
        const PageWidth = page.getWidth();
        const PageHeight = page.getHeight();
        const statePosition = [paddingLeftRight, PageHeight - paddingTopBottom]; // 起始位置

        const drawMenuTitle = () => {
            const menuTitle = pageNum === 0 ? "目录" : "";
            const menuTitleSpaceWidth = font.widthOfTextAtSize(menuTitle, fontSize);
            page.moveTo(PageWidth / 2 - menuTitleSpaceWidth / 2, statePosition[1]);
            page.drawText(menuTitle, { size: fontSize, lineHeight });
        };

        drawMenuTitle();

        const statePositionNew = [
            statePosition[0],
            statePosition[1] - lineHeight - lineGap * 2,
        ];

        menus
            .slice(pageNum * menuItemLength, (pageNum + 1) * menuItemLength)
            .forEach((menuItem, index) => {
                const { title = "", pageStart, range = 1 } = menuItem;
                const currentY = statePositionNew[1] - (lineHeight + lineGap) * index;
                const leftBlankSpace = new Array(range - 1)
                    .fill(undefined)
                    .map(() => "      ")
                    .join(""); // 6 个空格

                const leftBlankSpaceWidth = font.widthOfTextAtSize(
                    leftBlankSpace,
                    fontSize
                );

                const { drawTitle, drawPageStart, drawPageStartWithCoverPage } = {
                    drawTitle: leftBlankSpace + title,
                    drawPageStart: pageStart ? `${pageStart + menuPageNums}` : "",
                    drawPageStartWithCoverPage: pageStart
                        ? `${pageStart + menuPageNums + 1}`
                        : "", //加上封面实际的页码
                };

                const drawPageStartWidth = font.widthOfTextAtSize(
                    drawPageStart,
                    fontSize
                );

                page.moveTo(statePositionNew[0], currentY);
                page.drawText(drawTitle, { size: fontSize, lineHeight });
                page.moveTo(
                    PageWidth - paddingLeftRight - drawPageStartWidth,
                    currentY
                );
                page.drawText(drawPageStart, { size: fontSize, lineHeight });

                const drawLineStartWidth = font.widthOfTextAtSize(drawTitle, fontSize);

                page.drawLine({
                    start: {
                        x: statePositionNew[0] + drawLineStartWidth + 10,
                        y: currentY + lineHeight / 2 - 2,
                    },
                    end: {
                        x: PageWidth - paddingLeftRight - drawPageStartWidth - 10,
                        y: currentY + lineHeight / 2 - 2,
                    },
                    dashArray: [1],
                    dashPhase: 20,
                    thickness: 1,
                    opacity: 0.75,
                });

                const textBounds = [
                    statePositionNew[0] + leftBlankSpaceWidth,
                    statePositionNew[1] - (lineHeight + lineGap) * index - 3,
                    PageWidth - paddingLeftRight,
                    statePositionNew[1] -
                    (lineHeight + lineGap) * index -
                    3 +
                    lineHeight +
                    3,
                ];

                const link = _createPageLinkAnnotation(
                    pdfDoc,
                    pdfDoc.getPage(pageStart).ref,
                    textBounds,
                    false
                );
                pageStart && page.node.addAnnot(link);
                menuItem.page = drawPageStartWithCoverPage; // 加上封面实际的页码
            });
    });

    // 回到顶部，查看时默认展示第一页
    const page = pdfDoc.getPage(0);
    page.moveTo(0, 0);
};

const _generatePageNum = ({ pdfDoc, font }) => {
    // 生成页码
    const pageCount = pdfDoc.getPageCount();
    for (let j = 0; j < pageCount; j++) {
        const page = pdfDoc.getPage(j);
        page.setFont(font);
        const PageWidth = page.getWidth();
        page.moveTo(PageWidth / 2, 20);
        page.drawText(`${j + 1}`, {
            size: 10,
            lineHeight: 5,
            color: rgb(0.2, 0.2, 0.2),
        });
    }

    const page = pdfDoc.getPage(0);
    page.moveTo(0, 0);
};

const _generateFrontCoverPage = async ({ pdfDoc, data = {} }) => {
    // 生成封面，封面是动态的，需要用到项目的数据
    await fse.ensureDir(appStoragePath.getStorageHtmlTemplates2PdfFolder());
    const outPutFile = path.join(
        appStoragePath.getStorageHtmlTemplates2PdfFolder(),
        "coverPageDist.pdf"
    );
    const emptyValue = "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp";
    const outPutFileBuffer = await readFilePromisify(outPutFile);
    const outPutFileDoc = await PDFDocument.load(outPutFileBuffer);
    const copiedPages = await pdfDoc.copyPages(outPutFileDoc, [0]);
    const [firstPage] = copiedPages;
    pdfDoc.insertPage(0, firstPage);
};

const generateCompletePdf = async ({ menus, outputFile, data }) => {
    // data是数据，用来动态生成携带数据的封面
    // 生成合成后的PDF并插入目录页面
    const menuNormalized = _getSourceFilesFromMenus(menus);
    const sourceFiles = menuNormalized.map((item) => item.sourceFile);
    let pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const menuPageNums = Math.ceil(menuNormalized.length / menuItemLength);
    new Array(menuPageNums).fill().forEach(() => {
        pdfDoc.addPage(); //通过计算决定加几页目录
    });

    await _checkPDFSize({ sourceFiles });
    const mergeResult = await _mergePDF({ pdfDoc, sourceFiles });
    pdfDoc = mergeResult.pdfDoc;

    const ttf = await readFilePromisify(_getFontFilePath("msyh.ttf"));
    const msFont = await pdfDoc.embedFont(ttf);

    const menuNormalizedWithPages = menuNormalized.map((item) => {
        return {
            ...item,
            pages: mergeResult.pdfDocCounts?.[item.sourceFile] || 0, // 每个pdf包含的页面数
        };
    });

    const menuCalcPage = menuNormalizedWithPages.reduce((sum, item, index) => {
        const calcSum = menuNormalizedWithPages
            .slice(0, index)
            .reduce((sum2, item2) => {
                sum2 = sum2 + item2.pages;
                return sum2;
            }, 0);
        sum.push({
            ...item,
            pageStart: item.pages ? calcSum + 1 : 0,
        });
        return sum;
    }, []); // 计算每个层级的起始页面

    _generateMenus({
        pdfDoc,
        font: msFont,
        menus: menuCalcPage,
        menuPageNums,
    });

    _generatePageNum({
        pdfDoc,
        font: msFont,
    });
    if (data) {
        await _generateFrontCoverPage({ pdfDoc, data });
    }
    await _savePdf(pdfDoc, { outputFile });
    return menuCalcPage;
};

// pdf合并导出的方法
const generateCompletePdfByManyPdf = async (sourceFiles = [], outputFile = '') => {
    // sourceFiles: ['D:\\desktop\\pdf\\test.pdf','D:\\desktop\\pdf\\viewSignPdf.pdf']
    // outputFile: 可防止到 user_temp 文件夹 'C:\Users\PC\AppData\Roaming\purchase-scheme-electron-taizhou-muluwai\\user_temp\\_merge.pdf'
    const pdfDoc = await PDFDocument.create();
    const mergeResult = await _mergePDF({ pdfDoc, sourceFiles });
    await _savePdf(pdfDoc, { outputFile })
}

exports.generateCompletePdfByManyPdf = generateCompletePdfByManyPdf

// generateCompletePdfByManyPdf(['D:\\desktop\\pdf\\test.pdf','D:\\desktop\\pdf\\viewSignPdf.pdf'],'D:\\desktop\\pdf\\trans.pdf')

module.exports = {
    generateCompletePdfByManyPdf,
    generateCompletePdf
}

// generateCompletePdf({
//   menus: new Array(10000).fill().map((item) => {
//     return {
//       title: "标题1",
//       sourceFile: _getTestFilePath("你好啊.pdf"),
//     };
//   }),
//   outputFile: _getTestFilePath("dist.pdf"),
// });
