const {uuid} = require("@/electronApp/helper");
const dayjs = require("dayjs");
const paramsValid = require("@/core/base/ParamsValid")

class TaskQueue {
    constructor(options) {
        this.options = options;
        this.tasks = []; // 在排队的任务队列
        this.executeTasks = []; // 执行中的队列
        this.histoyTasks = []; // 所有任务历史队列
        this.executeTasksMaxLength = options.maxTask || 100
    }

    _scheduleTask() {
        if (this.executeTasks.length < this.executeTasksMaxLength) {
            const firstOne = this.tasks.shift();
            if (firstOne) {
                this.executeTasks.push(firstOne);
                const p = firstOne.executeFun(firstOne)
                const closeFun = () => {
                    this.endTask(firstOne.taskId)
                }
                if (p?.finally) {
                    p.finally(closeFun)
                } else {
                    closeFun()
                }
            }
        }
    }

    addTask(item = {}) {
        const timeStamp = Date.now()
        const newTask = {
            taskId: uuid(),
            createTimeStamp: timeStamp,
            createTimeString: dayjs(timeStamp).format("YYYY-MM-DD HH:mm:ss"),
            ...item,
        }
        if (!newTask.executeFun && this.options.taskExecuteFun) {
            newTask.executeFun = this.options.taskExecuteFun
        }
        paramsValid.validFunction(newTask.executeFun, 'newTask.executeFun');
        this.histoyTasks.push({
            ...newTask,
            executeFun: undefined,
        });
        this.tasks.push(newTask);
        this._scheduleTask();
    }

    endTask(taskId, options = {}) {
        const findIndexInExecuteTasks = this.executeTasks?.findIndex(one => one.taskId === taskId);
        if (findIndexInExecuteTasks !== -1) {
            this.executeTasks.splice(findIndexInExecuteTasks, 1)
        }
        const findOne = this.histoyTasks?.find(one => one.taskId === taskId);
        if (findOne) {
            Object.assign(findOne, options)
        }
        this._scheduleTask();
    }

    resetTasks() {
        this.tasks = [];
        this.executeTasks = [];
        this.histoyTasks = [];
    }
}

module.exports = TaskQueue;
