const os = require("os");

module.exports = (basicNum) => {
    let result;
    try {
        const totalMemory = os.totalmem();
        const cpus = os.cpus();
        const memories = Math.ceil(totalMemory / 1024 / 1024 / 1024)
        if (cpus < 4) {
            result = basicNum
        } else {
            if (memories > 90) {
                return 40
            } else if (memories > 60) {
                return 20
            } else if (memories > 50) {
                return 15
            } else if (memories > 30) {
                return 10
            }
        }
    } catch (err) {
        console.log('----获取动态cpu和内存报错-----')
        console.error(err)
    }
    return result || basicNum || 5
}

