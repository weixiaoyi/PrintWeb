const util = require("util");
const { execFile } = require("child_process");
const execFileAsync = util.promisify(execFile);
const { app } = require("electron");
const iconv = require("iconv-lite");
const platformType = require("@/core/base/PlatformType")

class Version0 {
    constructor() {
        // map windows-printer key to final printerData key
        this.properties = {
            DeviceID: "deviceId",
            Name: "name",
            PrinterPaperNames: "paperSizes",
            Location: "printer-location",
            PrinterState: "printer-state",
            PrinterStatus: "printer-status",
            Description: "description",
        };
    }

    _formatPrinterListStdout(stdout) {
        const printers = []
        stdout.split(/(\r?\n){2,}/).map(item => item.trim()).filter(item => !!item).forEach(printer => {
            const printerData = {
                _prev: {}
            }
            printer.split(/\r?\n/).forEach(line => {
                let [label, value] = line.split(":").map((el) => el.trim());
                if (value.match(/^{(.*)(\.{3})}$/)) {
                    value = value.replace("...}", "}");
                }
                const matches = value.match(/^{(.*)}$/);
                if (matches && matches[1]) {
                    value = matches[1].split(", ");
                }
                printerData._prev[label] = value;
                const key = this.properties[label];
                if (key === undefined) return;
                printerData[key] = value;
                // printerData[label] = value;
            })
            printers.push(printerData);
        })
        return printers.filter(printer => printer.deviceId && printer.name);
    }

    _formatDefaultPrintStdout(stdout) {
        const printers = []
        stdout.split(/(\r?\n){2,}/).map(item => item.trim()).filter(item => !!item).forEach(printer => {
            const printerData = {
                _prev: {}
            }
            printer.split(/\r?\n/).forEach(line => {
                let [label, value] = line.split(":").map((el) => el.trim());
                if (value.match(/^{(.*)(\.{3})}$/)) {
                    value = value.replace("...}", "}");
                }
                const matches = value.match(/^{(.*)}$/);
                if (matches && matches[1]) {
                    value = matches[1].split(", ");
                }
                printerData._prev[label] = value;
                const key = this.properties[label];
                if (key === undefined) return;
                printerData[key] = value;
                // printerData[label] = value;
            })
            printers.push(printerData);
        })
        return printers;
    }

    async _getPrinterList() {
        if (platformType.isWindowsSystem) {
            try {
                const { stdout } = await execFileAsync("PowerShell.exe", [
                    "-Command",
                    `Get-CimInstance Win32_Printer -Property DeviceID,Name,PrinterPaperNames`,
                ], {
                    encoding: "buffer",
                    windowsHide: true
                });
                const _de = iconv.decode(stdout, 'gbk')
                const _en = iconv.encode(_de, 'utf-8').toString();
                const printers = this._formatPrinterListStdout(_en);
                return printers;
            } catch (err) {
                console.error('_getPrinterList execution error：', err)
                return null
            }
        } else {
            const result = await app._win.webContents.getPrintersAsync()
            return result.reverse();
        }
    }

    async getPrinterList() {
        const result = await app._win.webContents.getPrintersAsync()
        return result.reverse();
    }

    async getPrinterListMoreDetail() {
        // 更详细的打印机列表
        const printers = await this._getPrinterList();
        const defaultPrinter = await this._getDefaultPrinter()
        return {
            printers,
            defaultPrinter
        }
    }

    async setDefaultPrinter(printer) {
        if (platformType.isWindowsSystem) {
            const { stdout } = await execFileAsync("PowerShell.exe", [
                "-Command",
                `$printer = Get-CimInstance -Class Win32_Printer -Filter "Name='${printer.name}'"
Invoke-CimMethod -InputObject $printer -MethodName SetDefaultPrinter`
            ]);
            return stdout
        } else {
            throw new Error('仅支持Windows系统（only support Windows）！')
        }
    }

    async _getDefaultPrinter() {
        try {
            if (platformType.isWindowsSystem) {
                const { stdout } = await execFileAsync("PowerShell.exe", [
                    "-Command",
                    `get-wmiObject -class win32_printer -Namespace "root\\cimv2" | where-object { $_.Default -eq 'True' }`
                ], {
                    encoding: "buffer",
                    windowsHide: true
                });
                const _de = iconv.decode(stdout, 'gbk')
                const _en = iconv.encode(_de, 'utf-8').toString();
                const stdoutNormalized = this._formatDefaultPrintStdout(_en);
                return stdoutNormalized?.[0]
            } else {
                throw new Error('仅支持Windows系统（only support Windows）！')
            }
        } catch (err) {
            console.error('_getDefaultPrinter execution error：', err)
            return null
        }
    }
}

module.exports = new Version0();
