const os = require("os")

class PlatformType {
    constructor() {
        this.isMacOSSystem = undefined;
        this.isWindowsSystem = undefined;
        this.isLinuxSystem = undefined;
        this.isX64Arch = undefined;
        this.isArm64Arch = undefined;
        this.isIa32Arch = undefined;
        this.system();
        this.arch();
    }

    system() {
        const platform = os.platform()
        if (platform === 'darwin') {
            this.isMacOSSystem = true;
            return 'MacOS';
        } else if (platform === 'win32') {
            this.isWindowsSystem = true;
            return 'Windows';
        } else if (platform === 'linux') {
            this.isLinuxSystem = true
            return 'Linux';
        } else {
            this.isWindowsSystem = true;
            return 'Windows';
        }
    }

    arch() {
        const arch = os.arch();
        if (arch === 'x64') {
            this.isX64Arch = true;
            return arch;
        } else if (arch === 'arm64') {
            this.isArm64Arch = true;
            return arch;
        } else if (arch === 'ia32') {
            this.isIa32Arch = true;
            return arch;
        } else {
            this.isX64Arch = true;
            return 'x64'
        }
    }
}

module.exports = new PlatformType();
