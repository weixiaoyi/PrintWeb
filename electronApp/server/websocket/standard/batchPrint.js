const generatePdf = require("@/core/generatePdf");
const printPdf = require("@/core/printPdf");
const paramsValid = require("@/core/base/ParamsValid")
const { isNotEmptyValue } = require("@/electronApp/helper");

const methodOptions = [
    {
        label: "printHtml",
        data: 'content'
    },
    {
        label: "printHtmlByUrl",
        data: 'url'
    },
    {
        label: "printHtmlByBase64",
        data: 'base64'
    },
    {
        label: "printPdfByUrl",
        data: 'url'
    },
    {
        label: "printPdfByBase64",
        data: 'base64'
    },
    {
        label: "printImageByUrl",
        data: 'url'
    },
    {
        label: "printImageByBase64",
        data: 'base64'
    },
]

module.exports = async (payload) => {
    const { printTaskList, pdfOptions, printOptions, extraOptions = {} } = payload;
    paramsValid.validArrayWithLength(printTaskList, 'printTaskList');
    if (isNotEmptyValue(pdfOptions)) {
        generatePdf.globalCheckPdfOptions(pdfOptions);
    }
    if (isNotEmptyValue(printOptions)) {
        printPdf.globalCheckPrintOptions(printOptions);
    }
    if (isNotEmptyValue(extraOptions)) {
        generatePdf.globalCheckExtraOptions(extraOptions);
    }

    printTaskList.forEach((task, index) => {
        paramsValid.validObjectHasProperty(task, `printTaskList[${index}]`, [
            'data', 'type', 'pdfOptions', 'printOptions', 'extraOptions'
        ]);
        paramsValid.validRequired(task.data, `printTaskList[${index}].data`);
        paramsValid.validArrayEnums(task.type, `printTaskList[${index}].type`, methodOptions.map(item => item.label));
        if (isNotEmptyValue(task.pdfOptions)) {
            generatePdf.globalCheckPdfOptions(task.pdfOptions);
        }
        if (isNotEmptyValue(task.extraOptions)) {
            generatePdf.globalCheckExtraOptions(task.extraOptions);
        }
        if (isNotEmptyValue(task.printOptions)) {
            printPdf.globalCheckPrintOptions(task.printOptions);
        }
    })

    const printTaskListMerged = printTaskList.map(task => {
        return {
            ...task,
            ...pdfOptions ? {
                pdfOptions: {
                    ...pdfOptions,
                    ...(task?.pdfOptions || {}),
                }
            } : {},
            ...printOptions ? {
                printOptions: {
                    ...printOptions,
                    ...(task?.printOptions || {}),
                }
            } : {},
            ...extraOptions ? {
                extraOptions: {
                    ...extraOptions,
                    ...(task?.extraOptions || {}),
                }
            } : {},
        }
    })

    const actionsList = printTaskListMerged.reduce((sum, item) => {
        const action = item.extraOptions?.action
        if (action && !sum.find(one => one === action)) {
            sum.push(action);
        }
        return sum
    }, [])

    if (actionsList.length > 1) {
        throw new Error("every printTask's extraOptions.action must be equal in printTaskList when after shallow merged!")
    }

    const pdfResults = await Promise.all(printTaskListMerged.map(task => {
        const findOne = methodOptions.find(one => one.label === task.type)
        return require(`./${task.type}`)({
            ...task,
            [findOne.data]: task.data,
        }, true)
    }));

    if (actionsList?.[0] === 'preview') {
        return {
            pdfs: pdfResults,
            printPreviewUrl: printPdf._generatePrintPdfPreviewUrl({
                printArgs: encodeURIComponent(JSON.stringify(pdfResults.map((item, index) => {
                    const { printOptions = {} } = printTaskListMerged[index];
                    return {
                        pdfFileName: item.pdfFileName,
                        printOptions,
                    }
                })))
            }),
        }
    } else {
        await Promise.all(pdfResults.map((pdfResult, index) => {
            const { printOptions, extraOptions } = printTaskListMerged[index];
            return printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
        }))
    }
};
