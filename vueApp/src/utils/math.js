import BigNumber from 'bignumber.js'
const copeNum = (type, ...args) => {
    if (args.length < 2) throw new Error('big-number传入数字参数必须两个及以上')
    let i = 0, passiveNum = new BigNumber(args[i++])
    for (; i < args.length; i++) {
        passiveNum = passiveNum[type](args[i])
    }
    return passiveNum.valueOf()
}
/**
 * 保留小数点
 * @params digit 保留小数点位数默认两位
 * @params type 小数点舍入类型
 * down  舍去     默认
 * round 四舍五入
 */
const toFixed = (num, digit = 2, type = 'down') => {
    if (!num || !(typeof num === "number" || typeof num === "string")) return
    return new BigNumber(num).toFixed(digit, BigNumber[type === 'round' ? 'ROUND_HALF_UP' : 'ROUND_DOWN']).valueOf()
}




export default {
    // 加
    add: (...args) => copeNum('plus', ...args),
    // 减
    minus: (...args) => copeNum('minus', ...args),
    // 乘
    ride: (...args) => copeNum('times', ...args),
    // 除
    divide: (...args) => copeNum('div', ...args),
    // 保留小数点
    toFixed
}






