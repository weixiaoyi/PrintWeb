const fs = require("fs-extra");
const path = require("path");
const { PDFDocument, degrees, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const paramsValid = require("@/core/base/ParamsValid");
const { isNotEmptyValue } = require("@/electronApp/helper/index")
const appProgress = require("@/core/base/AppProgress")
const { uuid } = require("@/electronApp/helper");
const { isNull } = require("lodash");

class PdfDocument {
    async _init(filePath) {
        const pdfRes = await fs.readFile(filePath);
        const pdfDoc = await PDFDocument.load(pdfRes, { ignoreEncryption: true });
        const isEncrypted = pdfDoc.isEncrypted
        if (isEncrypted) {
            throw new Error('Encrypting PDF is not allowed!');
        }
        return pdfDoc;
    }

    validWatermarkParams(options, filedName) {
        //* watermark: Object (optional),
        // text { text:"打印专家",  size: 20, x: 200 , y: 100, rows: 4, cols:4, xSpace:20, ySpace:20, angle: 45, opacity:0.5 , color }
        // image { base64: "", x: 200, y: 100, rows: 4, cols:4, angle: 45, xSpace:20, ySpace:20, width: 100, height: 100, opacity:0.5  }
        paramsValid.validObject(options, filedName);
        if (!options.base64 && !options.text) {
            throw new Error('watermark must has "base64" attribute or "text" attribute')
        }
        if (options.base64 && options.text) {
            throw new Error('watermark "base64" and "text" attribute only can exist one')
        }
        const { x, y, rows, cols, xSpace, ySpace, angle, opacity } = options
        if (options.text) {
            const { text, size, color } = options
            paramsValid.validString(text, 'text')
            paramsValid.validObjectHasProperty(options, 'watermark text', [
                'text', 'size', 'x', 'y', 'rows', 'cols', 'xSpace', 'ySpace', 'angle', 'opacity', 'color'
            ])
            if (isNotEmptyValue(size)) {
                paramsValid.validNumber(size, 'size');
            }
            if (isNotEmptyValue(color)) {
                paramsValid.validRGB(color, 'color')
                options.color = rgb(...(color.replace('rgb(', '').replace(')', '').split(',').map(item => {
                    return Number(item) / 255
                })))
            }
        } else if (options.base64) {
            const { base64, width, height } = options
            paramsValid.validString(base64, 'base64');
            paramsValid.validObjectHasProperty(options, 'watermark base64', [
                'base64', 'x', 'y', 'rows', 'cols', 'xSpace', 'ySpace', 'angle', 'opacity', 'width', 'height',
            ])
            if (isNotEmptyValue(width)) {
                paramsValid.validNumber(width, 'width')
            }

            if (isNotEmptyValue(height)) {
                paramsValid.validNumber(height, 'height')
            }
        }

        if (isNotEmptyValue(x)) {
            paramsValid.validNumberOrString(x, 'watermark.x')
            if (typeof x === 'string') {
                paramsValid.validArrayEnums(x, 'string watermark.x', ['alignCenter', 'alignLeft', 'alignRight'])
            }
        }

        if (isNotEmptyValue(y)) {
            paramsValid.validNumberOrString(y, 'watermark.y')
            if (typeof y === 'string') {
                paramsValid.validArrayEnums(y, 'string watermark.y', ['alignCenter', 'alignTop', 'alignBottom'])
            }
        }

        if (isNotEmptyValue(rows)) {
            paramsValid.validInterNumber(rows, 'rows');
            paramsValid.validMinNumber(rows, 'rows', 1);
        }
        if (isNotEmptyValue(cols)) {
            paramsValid.validInterNumber(cols, 'cols');
            paramsValid.validMinNumber(cols, 'cols', 1);
        }
        if (isNotEmptyValue(xSpace)) {
            paramsValid.validNumber(xSpace, 'xSpace')
        }
        if (isNotEmptyValue(ySpace)) {
            paramsValid.validNumber(ySpace, 'ySpace')
        }
        if (isNotEmptyValue(angle)) {
            paramsValid.validNumber(angle, 'angle')
        }
        if (isNotEmptyValue(opacity)) {
            paramsValid.validNumberRange(opacity, 'opacity', 0, 1)
        }
    }

    async watermark(filePath, options) {
        paramsValid.validRequired(filePath, 'filePath');
        const taskId = uuid();
        try {
            appProgress.updateTransPdfTask(taskId, {}, '水印');
            const pdfDoc = await this._init(filePath);
            const { text, base64 } = options;

            const newPdfDoc = await PDFDocument.create();
            const pageCount = pdfDoc.getPageCount();

            const _calPositions = ({
                                       pageWidth,
                                       pageHeight,
                                       objWidth,
                                       objHeight,
                                       rows,
                                       cols,
                                       xSpace,
                                       ySpace,
                                       x,
                                       y
                                   }) => {
                const calcObjWidth = cols * objWidth + xSpace * ((cols - 1) || 0);
                const calcObjHeight = rows * objHeight + ySpace * ((rows - 1) || 0);
                const middleX = pageWidth / 2 - calcObjWidth / 2;
                const middleY = pageHeight / 2 - calcObjHeight / 2;

                const positions = []
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {

                        positions.push({
                            x: {
                                "alignLeft": 0 + xSpace,
                                "alignRight": pageWidth - objWidth - xSpace,
                                "alignCenter": middleX + j * (xSpace + objWidth)
                            }[x] ?? x + j * (xSpace + objWidth),
                            y: {
                                "alignTop": pageHeight - objHeight - ySpace,
                                "alignBottom": 0 + ySpace,
                                "alignCenter": middleY + i * (ySpace + objHeight)
                            }[y] ?? y + i * (ySpace + objHeight),
                        })
                    }
                }

                return positions
            }

            const _drawImage = async () => {
                const image = await newPdfDoc.embedPng(base64).catch(err => {
                    if (err) {
                        if (err?.includes('The input is not a PNG file')) {
                            err = `base64 is not a valid PNG file, please check base64 param`;
                        }
                        throw new Error(err)
                    }
                })
                const {
                    x = 'alignCenter',
                    y = 'alignCenter',
                    rows = 1,
                    cols = 1,
                    angle = 0,
                    xSpace = 0,
                    ySpace = 0,
                    width,
                    height,
                    opacity = 1
                } = options
                for (let j = 0; j < pageCount; j++) {
                    const [PDFPageItem] = await newPdfDoc.copyPages(pdfDoc, [j]);
                    const pageWidth = PDFPageItem.getWidth();
                    const pageHeight = PDFPageItem.getHeight();

                    let calcWidth = width
                    let calcHeight = height
                    if (width && !height) {
                        calcHeight = (image.height / image.width) * width;
                    }
                    if (height && !width) {
                        calcWidth = (image.width / image.height) * height;
                    }

                    const positions = _calPositions({
                        pageWidth,
                        pageHeight,
                        rows,
                        cols,
                        xSpace,
                        ySpace,
                        x,
                        y,
                        objWidth: calcWidth || image.width,
                        objHeight: calcHeight || image.height
                    })
                    positions.forEach(position => {

                        PDFPageItem.drawImage(image, {
                            x: position.x,
                            y: position.y,
                            width: calcWidth || image.width,
                            height: calcHeight || image.height,
                            rotate: angle ? degrees(angle) : undefined,
                            opacity,
                        })
                    })

                    newPdfDoc.addPage(PDFPageItem);
                }
            }

            const _drawText = async () => {
                newPdfDoc.registerFontkit(fontkit);
                const ttf = await fs.readFile(path.join(__dirname, '../../electronApp/pdf/fonts/msyh.ttf'))
                const font = await newPdfDoc.embedFont(ttf)

                const {
                    text,
                    size = 20,
                    x = 'alignCenter',
                    y = 'alignCenter',
                    rows = 1,
                    cols = 1,
                    xSpace = 0,
                    ySpace = 0,
                    angle = 0,
                    opacity = 1,
                    color = rgb(0, 0, 0)
                } = options
                for (let j = 0; j < pageCount; j++) {
                    const [PDFPageItem] = await newPdfDoc.copyPages(pdfDoc, [j]);
                    const pageWidth = PDFPageItem.getWidth();
                    const pageHeight = PDFPageItem.getHeight();
                    PDFPageItem.setFont(font);
                    const fontWidth = font.widthOfTextAtSize(text, size);
                    const fontHeight = font.heightAtSize(size);

                    const positions = _calPositions({
                        pageWidth,
                        pageHeight,
                        rows,
                        cols,
                        xSpace,
                        ySpace,
                        x,
                        y,
                        objWidth: fontWidth,
                        objHeight: fontHeight
                    })
                    positions.forEach(position => {
                        PDFPageItem.drawText(text, {
                            x: position.x,
                            y: position.y,
                            font,
                            size,
                            color,
                            rotate: angle ? degrees(angle) : undefined,
                            opacity,
                        })
                    })

                    newPdfDoc.addPage(PDFPageItem);
                }
            }

            if (text) {
                await _drawText();
            } else if (base64) {
                await _drawImage();
            }

            await this._savePdf(newPdfDoc, undefined, filePath);
        } catch (err) {
            throw new Error(err?.message || err);
        } finally {
            appProgress.clearTransPdfTask(taskId)
        }
    }

    validPageNumberParams(options, filedName) {
        // { start: 1, x: 200 |'alignCenter'|'alignLeft'|'alignRight', y: 100 |'alignCenter'|'alignTop'|'alignBottom', format: '{{page}}/{{totalPage}}, color:'rgb(0,0,0)',  size: 20' }
        paramsValid.validObjectHasProperty(options, filedName, ['start', 'x', 'y', 'format', 'color', 'size', 'xSpace', 'ySpace', 'opacity'])
        const { start, x, y, format, color, size, xSpace, ySpace, opacity } = options
        if (isNotEmptyValue(start)) {
            paramsValid.validInterNumber(start, 'start')
        }
        if (isNotEmptyValue(x)) {
            paramsValid.validNumberOrString(x, 'pageNumber.x')
            if (typeof x === 'string') {
                paramsValid.validArrayEnums(x, 'string pageNumber.x', ['alignCenter', 'alignLeft', 'alignRight'])
            }
        }
        if (isNotEmptyValue(y)) {
            paramsValid.validNumberOrString(y, 'pageNumber.y')
            if (typeof y === 'string') {
                paramsValid.validArrayEnums(y, 'string pageNumber.y', ['alignCenter', 'alignTop', 'alignBottom'])
            }
        }
        if (isNotEmptyValue(format)) {
            paramsValid.validString(format, 'format')
        }
        if (isNotEmptyValue(color)) {
            paramsValid.validRGB(color, 'color')
            options.color = rgb(...(color.replace('rgb(', '').replace(')', '').split(',').map(item => {
                return Number(item) / 255
            })))
        }
        if (isNotEmptyValue(size)) {
            paramsValid.validNumber(size, 'size');
        }
        if (isNotEmptyValue(xSpace)) {
            paramsValid.validNumber(xSpace, 'xSpace');
        }
        if (isNotEmptyValue(ySpace)) {
            paramsValid.validNumber(ySpace, 'ySpace');
        }
        if (isNotEmptyValue(opacity)) {
            paramsValid.validNumberRange(opacity, 'opacity', 0, 1)
        }
    }

    async drawPageNumber(filePath, options) {
        paramsValid.validRequired(filePath, 'filePath');
        const taskId = uuid();
        try {
            appProgress.updateTransPdfTask(taskId, {}, '页码');
            const pdfDoc = await this._init(filePath);
            const newPdfDoc = await PDFDocument.create();
            const pageCount = pdfDoc.getPageCount();

            const _calPositions = ({ pageWidth, pageHeight, objWidth, objHeight, x, y, xSpace, ySpace }) => {
                const middleX = pageWidth / 2 - objWidth / 2;
                const middleY = pageHeight / 2 - objHeight / 2;

                return [{
                    x: {
                        "alignLeft": 0 + xSpace,
                        "alignRight": pageWidth - objWidth - xSpace,
                        "alignCenter": middleX
                    }[x] ?? x,
                    y: {
                        "alignTop": pageHeight - objHeight - ySpace,
                        "alignBottom": 0 + ySpace,
                        "alignCenter": middleY
                    }[y] ?? y,
                }]
            }

            const _drawText = async () => {
                newPdfDoc.registerFontkit(fontkit);
                const ttf = await fs.readFile(path.join(__dirname, '../../electronApp/pdf/fonts/msyh.ttf'))
                const font = await newPdfDoc.embedFont(ttf)
                const {
                    start = 1,
                    format = "{{page}}",
                    size = 10,
                    x = 'alignCenter',
                    y = 10,
                    color = rgb(0, 0, 0),
                    xSpace = 0,
                    ySpace = 0,
                    opacity = 1
                } = options
                for (let j = 0; j < pageCount; j++) {
                    const [PDFPageItem] = await newPdfDoc.copyPages(pdfDoc, [j]);
                    const pageWidth = PDFPageItem.getWidth();
                    const pageHeight = PDFPageItem.getHeight();
                    PDFPageItem.setFont(font);
                    let text = '';
                    if (format?.includes('=>') || format?.includes('function')) {
                        try {
                            text = eval("(" + format + ")")(j + start, pageCount);
                            if (isNull(text)) {
                                text = ''
                            }
                            if (typeof text === 'number') {
                                text = text + ''
                            }
                            paramsValid.validStringNotRequired(text, `function format executed result (got ${text})`)
                        } catch (err) {
                            throw new Error(`function format executed throw an error: ${err?.message}, it should like '(page,totalPage) => page + "/" + totalPage'`);
                        }
                    } else {
                        text = format?.replaceAll('{{page}}', j + start)
                            .replaceAll('{{totalPage}}', pageCount);
                    }
                    const fontWidth = font.widthOfTextAtSize(text, size);
                    const fontHeight = font.heightAtSize(size);

                    const positions = _calPositions({
                        pageWidth,
                        pageHeight,
                        x,
                        y,
                        xSpace,
                        ySpace,
                        objWidth: fontWidth,
                        objHeight: fontHeight
                    })
                    positions.forEach(position => {
                        PDFPageItem.drawText(text, {
                            x: position.x,
                            y: position.y,
                            font,
                            size,
                            color,
                            opacity,
                        })
                    })
                    newPdfDoc.addPage(PDFPageItem);
                }
            }

            await _drawText();
            await this._savePdf(newPdfDoc, undefined, filePath);
        } catch (err) {
            throw new Error(err?.message || err);
        } finally {
            appProgress.clearTransPdfTask(taskId)
        }
    }

    _savePdf = async (newPdfDoc, outputFile, filePath) => {
        const pdfBytes = await newPdfDoc.save();
        if (!outputFile) {
            outputFile = filePath;
        }
        await fs.writeFile(outputFile, pdfBytes);
    };
}

module.exports = new PdfDocument()
