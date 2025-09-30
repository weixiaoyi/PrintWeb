const { app } = require("electron");
const { execFile, exec } = require("child_process");
const util = require("util");
const execFileAsync = util.promisify(execFile);
const iconv = require("iconv-lite");
const paramsValid = require("@/core/base/ParamsValid")
const standardPapers = require("./_standardPapers")

class Version1 {
    constructor() {
        this.psVersion = null;
    }

    _checkParams(printer) {
        paramsValid.validObject(printer, 'printer')
        paramsValid.validString(printer.name, 'printer.name')
    }

    async _getPowerShellVersion() {
        if (!this.psVersion) {
            const { stdout: versionOutput } = await execFileAsync("PowerShell.exe", [
                "-Command",
                "$PSVersionTable.PSVersion.Major"
            ], {
                encoding: "buffer",
                windowsHide: true
            });
            this.psVersion = parseInt(iconv.decode(versionOutput, 'utf8').trim());
        }
        return this.psVersion
    }

    async getPrinterList() {
        try {
            await this._getPowerShellVersion()

            const fields = `Name, DriverName, PortName, Default`;

            const mapPrinters = (printers = []) => {
                return printers?.map(printer => {
                    return {
                        name: printer.Name,
                        driverName: printer.DriverName,
                        portName: printer.PortName,
                        default: printer.Default
                    }
                }).filter(item => item.name) || []
            }

            if (this.psVersion < 3) {
                // PowerShell 版本过低，使用备选方案
                const { stdout } = await execFileAsync("PowerShell.exe", [
                    "-Command",
                    `Get-WmiObject Win32_Printer | Format-List ${fields}`
                ], {
                    encoding: "buffer",
                    windowsHide: true
                });

                const decodedOutput = iconv.decode(stdout, 'gbk');

                // 解析格式化的输出
                const printers = [];
                let currentBlock = '';

                const processPrinterBlock = (block) => {
                    const nameMatch = block.match(/Name\s*:\s*(.+)/i);
                    const driverNameMatch = block.match(/DriverName\s*:\s*(.+)/i);
                    const portNameMatch = block.match(/PortName\s*:\s*(.+)/i);
                    const defaultMatch = block.match(/Default\s*:\s*(.+)/i);

                    if (nameMatch) {
                        return {
                            Name: nameMatch[1].trim(),
                            DriverName: driverNameMatch ? driverNameMatch[1].trim() : '',
                            PortName: portNameMatch ? portNameMatch[1].trim() : '',
                            Default: defaultMatch ? defaultMatch[1].trim().toLowerCase() === 'true' : false
                        };
                    }
                    return null;
                };

                decodedOutput.split('\n').forEach(line => {
                    line = line.trim();
                    if (!line) {
                        if (currentBlock) {
                            const printer = processPrinterBlock(currentBlock);
                            if (printer) {
                                printers.push(printer);
                            }
                            currentBlock = '';
                        }
                        return;
                    }
                    currentBlock += line + '\n';
                });

                // 处理最后一个块
                if (currentBlock) {
                    const printer = processPrinterBlock(currentBlock);
                    if (printer) {
                        printers.push(printer);
                    }
                }

                return mapPrinters(printers);
            } else {
                // 使用新版本命令和JSON输出
                const { stdout } = await execFileAsync("PowerShell.exe", [
                    "-Command",
                    `Get-WmiObject Win32_Printer | Select-Object ${fields} | ConvertTo-Json`
                ], {
                    encoding: "buffer",
                    windowsHide: true
                });

                const decodedOutput = iconv.decode(stdout, 'gbk');
                const printerList = JSON.parse(decodedOutput);

                return mapPrinters(printerList);
            }
        } catch (error) {
            console.error('获取打印机列表失败, 改为electron方法获取:', error);
            const result = await app._win.webContents.getPrintersAsync()
            return result.reverse();
        }
    }

    async setDefaultPrinter(printer) {
        try {
            this._checkParams(printer);

            await this._getPowerShellVersion();

            let command;
            if (this.psVersion < 3) {
                // PowerShell 3.0 以下版本使用 WMI，直接获取 ReturnValue
                command = `$result = (Get-WmiObject -Class Win32_Printer -Filter "Name='${printer.name}'" | Invoke-WmiMethod -Name SetDefaultPrinter).ReturnValue; Write-Output $result`;
            } else {
                // PowerShell 3.0 及以上版本使用 CIM 和 JSON
                command = `$printer = Get-CimInstance -Class Win32_Printer -Filter "Name='${printer.name}'"
Invoke-CimMethod -InputObject $printer -MethodName SetDefaultPrinter | ConvertTo-Json`;
            }

            const { stdout } = await execFileAsync("PowerShell.exe", [
                "-Command",
                command
            ], {
                encoding: "buffer",
                windowsHide: true
            });

            const decodedOutput = iconv.decode(stdout, 'gbk').trim();
            let returnValue;
            if (this.psVersion < 3) {
                // PowerShell 2.0 直接返回数字
                returnValue = parseInt(decodedOutput);
            } else {
                // PowerShell 3.0+ 返回 JSON
                const result = JSON.parse(decodedOutput);
                returnValue = result.ReturnValue;
            }

            if (returnValue === 0) {
                return {
                    success: true,
                    data: printer,
                };
            } else {
                throw new Error(`setDefaultPrinter Failed, return code: ${returnValue}`);
            }
        } catch (error) {
            console.error(error);
            throw new Error(`setDefaultPrinter Failed: ${error}`);
        }
    }

    async getPrinterPaperFormats(printer) {
        this._checkParams(printer);
        try {
            await this._getPowerShellVersion();

            // 根据 PowerShell 版本选择命令
            let paperNamesCommand;
            if (this.psVersion < 3) {
                // PowerShell 2.0 及以下版本使用 WMI 命令，返回格式化字符串
                paperNamesCommand = `Get-WmiObject -Class Win32_Printer -Filter "Name='${printer.name}'" | Select-Object -ExpandProperty PrinterPaperNames`;
            } else {
                // PowerShell 3.0 及以上版本使用 CIM 命令，返回 JSON
                paperNamesCommand = `Get-CimInstance -Class Win32_Printer -Filter "Name='${printer.name}'" | Select-Object -ExpandProperty PrinterPaperNames | ConvertTo-Json -Compress`;
            }

            const { stdout: namesStdout } = await execFileAsync("PowerShell.exe", [
                "-Command",
                paperNamesCommand
            ], {
                encoding: "buffer",
                windowsHide: true
            });

            let paperNames;
            if (this.psVersion < 3) {
                // PowerShell 2.0 返回格式化字符串，按换行符分割
                const decodedOutput = iconv.decode(namesStdout, 'gbk').trim();
                try {
                    // 尝试解析为 JSON 数组
                    paperNames = JSON.parse(decodedOutput);
                } catch (e) {
                    // 如果不是 JSON，则按换行符分割
                    paperNames = decodedOutput.split(/\r\n/).map(name => name.trim()).filter(Boolean);
                }
            } else {
                // PowerShell 3.0+ 返回 JSON
                try {
                    paperNames = JSON.parse(iconv.decode(namesStdout, 'gbk').trim());
                } catch (e) {
                    paperNames = [];
                }
            }
            if (!Array.isArray(paperNames)) {
                paperNames = [paperNames];
            }
            paperNames = paperNames.filter(Boolean);

            // 标准化纸张格式名称和尺寸
            const standardFormats = standardPapers;
            // 组装最终结果
            return paperNames?.map(name => {
                if (standardFormats[name]) {
                    return {
                        name: standardFormats[name].name,
                        width: standardFormats[name].width,
                        height: standardFormats[name].height,
                        isStandard: true,
                        unit: 'mm'
                    };
                }
                return {
                    name,
                    width: null,
                    height: null,
                    isStandard: false,
                    unit: 'mm'
                };
            })
        } catch (error) {
            console.error('获取打印机纸张格式失败:', error);
            throw new Error(`获取打印机纸张格式失败: ${error.message}`);
        }
    }

    async getAbnormalTask(printer) {
        paramsValid.validObject(printer, 'printer')
        paramsValid.validString(printer.name, 'printer.name')
        try {
            const printerName = printer.name
            if (!printerName) throw new Error('printerName is required');
            await this._getPowerShellVersion();
            let psCmd;
            if (this.psVersion >= 3) {
                // PowerShell 3.0 及以上
                psCmd = `
$jobs = Get-PrintJob -PrinterName "${printerName}"
$jobs | Where-Object {
    ($_.JobStatus -match '错误|Error|Blocked|PaperOut|UserInterventionRequired') -or
    ($_.Status -match '错误|Error|Blocked|PaperOut|UserInterventionRequired')
} | Select-Object ID, DocumentName, JobStatus, Status, SubmittedBy, TotalPages, PagesPrinted, TimeJobSubmitted, PrinterName | ConvertTo-Json -Compress
`;
            } else {
                // 兼容低版本 PowerShell
                psCmd = `
Get-WmiObject Win32_PrintJob | Where-Object {
    $_.Name -like "*${printerName}*" -and (
        ($_.JobStatus -match '错误|Error|Blocked|PaperOut|UserInterventionRequired') -or
        ($_.Status -match '错误|Error|Blocked|PaperOut|UserInterventionRequired')
    )
} | Select-Object JobId, Document, Status, Owner, TotalPages, PagesPrinted, Submitted, Name | ConvertTo-Json -Compress
`;
            }

            // 状态码解析逻辑
            function parsePrintJobStatus(status) {
                const statusMap = {
                    0x0001: 'Paused',                    // 1
                    0x0002: 'Error',                     // 2
                    0x0004: 'Deleting',                  // 4
                    0x0008: 'Spooling',                  // 8
                    0x0010: 'Printing',                  // 16
                    0x0020: 'Offline',                   // 32
                    0x0040: 'Paper Out',                 // 64
                    0x0080: 'Printed',                   // 128
                    0x0100: 'Deleted',                   // 256
                    0x0200: 'Blocked Device Queue',      // 512
                    0x0400: 'User Intervention Required',// 1024
                    0x0800: 'Restarted',                 // 2048
                    0x1000: 'Complete',                  // 4096
                    0x2000: 'Restarted',                 // 8192
                };
                const result = [];
                if (typeof status !== 'number') return result;
                for (const [bit, desc] of Object.entries(statusMap)) {
                    if ((status & bit) !== 0) result.push(desc);
                }
                return result;
            }

            const { stdout } = await execFileAsync("PowerShell.exe", ["-Command", psCmd], {
                encoding: "buffer",
                windowsHide: true
            });
            const decoded = iconv.decode(stdout, 'gbk').trim();
            if (!decoded) return [];
            let result = JSON.parse(decoded);
            if (!Array.isArray(result)) result = result ? [result] : [];
            // 字段兼容处理，并加上 StatusDesc
            return result.map(item => {
                const statusVal = item.JobStatus || item.Status;
                let statusNum = statusVal;
                if (typeof statusVal === 'string' && /^\d+$/.test(statusVal)) {
                    statusNum = parseInt(statusVal, 10);
                }
                if (typeof statusNum !== 'number') statusNum = Number(statusNum);
                return {
                    JobId: item.ID || item.JobId,
                    Document: item.DocumentName || item.Document,
                    Status: statusVal,
                    StatusDesc: parsePrintJobStatus(statusNum),
                    Owner: item.SubmittedBy || item.Owner,
                    TotalPages: item.TotalPages,
                    PagesPrinted: item.PagesPrinted,
                    Submitted: item.TimeJobSubmitted || item.Submitted,
                    PrinterName: item.PrinterName || (item.Name ? item.Name.split(',')[0] : undefined)
                };
            });
        } catch (err) {
            console.error('获取异常打印任务失败:', err);
            return []
        }
    }
}

module.exports = new Version1();
