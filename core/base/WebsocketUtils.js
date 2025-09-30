const paramsValid = require("@/core/base/ParamsValid")

class WebsocketUtils {
    preDealJsonPayload(payload) {
        let message = null
        try {
            message = JSON.parse(payload)
        } catch (err) {
        }
        return message
    }

    verifyJsonPayload(payload) {
        let message = null
        try {
            message = JSON.parse(payload)
        } catch (err) {
            throw new Error('message is not a json！')
        }
        paramsValid.validRequired(message.id, 'message.id')
        paramsValid.validRequired(message.type, 'message.type')
        paramsValid.validRequired(message.timestamp, 'message.timestamp')
        return message
    }
}

module.exports = new WebsocketUtils();
