const {BrowserWindow, WebContentsView} = require('electron');
const path = require('path');
const fs = require('fs-extra');

module.exports = async (pdfPath, printOptions) => {
    return new Promise((resolve, reject) => {
        const window = new BrowserWindow({
            show: false,
            width: 1920,
            height: 1080,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: false,
            webSecurity: false,
        });

        // 添加错误处理
        window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Failed to load PDF:', errorDescription);
            reject(new Error(`Failed to load PDF: ${errorDescription}`));
        });

        window.webContents.on('dom-ready', () => {
            console.log('DOM is ready');
        });

        window.webContents.on('did-finish-load', async () => {
            console.log('PDF finished loading');
            try {
                const printConfig = {
                    silent: true,
                    deviceName: 'HP LaserJet MFP M28-M31 PCLm-S (网络)'
                    // pageSize: 'A4',
                };

                console.log('Starting print with config:', printConfig);

                window.webContents.print(printConfig, (success, errorType) => {
                    if (!success) {
                        console.error('Print failed:', errorType);
                        reject(new Error(`Print failed: ${errorType}`));
                    } else {
                        console.log('Print completed successfully');
                        resolve();
                    }
                    window.close();
                });
            } catch (error) {
                console.error('Print error:', error);
                reject(error);
                window.close();
            }
        });

        console.log('Loading PDF file...');
        window.loadFile(pdfPath);
    });
};
