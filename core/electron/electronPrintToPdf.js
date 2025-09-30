const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
module.exports = async (pdfPath, destPath) => {
    return new Promise((resolve, reject) => {
        const win = new BrowserWindow({
            show: false,
            width: 1920,
            height: 1080,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: false,
            webSecurity: false,
        })
        win.loadFile(pdfPath)

        win.webContents.on('did-finish-load', () => {
            // Use default printing options
            win.webContents.printToPDF({}).then(data => {
                fs.writeFile(destPath, data, (error) => {
                    if (error) {
                        return reject(error)
                    }
                    console.log(`Wrote PDF successfully to ${destPath}`)
                    resolve()
                })
            }).catch(error => {
                console.log(`Failed to write PDF to ${destPath}: `, error)
                reject(error)
            })
        })
    })

}
