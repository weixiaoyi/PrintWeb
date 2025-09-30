const paramsValid = require("@/core/base/ParamsValid")

class TimeoutTask {
    constructor(seconds) {
        paramsValid.validNumber(seconds, 'seconds');
        this._updateTime = Date.now();
        this._timeout = null;
        this._setTimeout = null;
        this._ms = seconds * 1000
    }

    start({onOverTime, onTimeoutLoop}) {
        onOverTime && paramsValid.validFunction(onOverTime, 'onOverTime')
        onTimeoutLoop && paramsValid.validFunction(onTimeoutLoop, 'onTimeoutLoop')
        this._setTimeout = () => {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(async () => {
                onTimeoutLoop && onTimeoutLoop(this._updateTime);
                if (Date.now() - this._updateTime > this._ms) {
                    this.stop();
                    onOverTime && onOverTime();
                } else {
                    this._setTimeout && this._setTimeout();
                }
            }, 3000)
        };
        this._setTimeout()
    }

    update() {
        this._updateTime = Date.now();
    }

    stop() {
        clearTimeout(this._timeout);
        this._setTimeout = null;
    }
}

module.exports = TimeoutTask;
