const systemPrinterVersion1 = require("./version1")

class SystemPrinter {

    constructor() {
        this.core = systemPrinterVersion1;
    }

    async getPrinterList() {
        return this.core.getPrinterList()
    }

    async setDefaultPrinter(printer) {
        return this.core.setDefaultPrinter(printer)
    }

    async getPrinterPaperFormats(printer) {
        return this.core.getPrinterPaperFormats(printer)
    }

    async getAbnormalTask(printer) {
        return this.core.getAbnormalTask(printer)
    }
}

module.exports = new SystemPrinter();
