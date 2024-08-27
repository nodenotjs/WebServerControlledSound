exports.IDPacket = class IDPacket {
    id
    data

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
}

exports.ClientsStatus = class ClientsStatus {
    constructor(text) {
        this.text = text;
    }
}

exports.ForceMusicPlay = class ForceMusicPlay {
    constructor() {
    }
}

exports.ForceMusicStop = class ForceMusicStop {
    constructor() {
    }
}

exports.SchedulePlayTo = class SchedulePlayTo {
    /**
     * 
     * @param {number} delay 
     */
    constructor(delay) {
        this.delay = delay;
    }
}

exports.CancelSchedulePlayTo = class CancelSchedulePlayTo {
    constructor() {
    }
}

exports.ImTheAdmin = class ImTheAdmin {
    /**
     * 
     * @param {string} password 
     */
    constructor(password) {
        this.password = password;
    }
}

exports.SendNotification = class SendNotification {
    /**
     * 
     * @param {string} message 
     */
    constructor(message) {
        this.password = message;
    }
}

exports.PlayStop = class PlayStop {
    /**
     * 
     * @param {number} duration 
     */
    constructor(duration) {
        this.duration = duration;
    }
}

exports.SERVER_TO_ADMIN_PACKET_IDS = {
    UPDATE_CLIENTS_STATUS: 0
}

exports.ADMIN_TO_SERVER_PACKET_IDS = {
    FORCE_MUSIC_PLAY: 0,
    FORCE_MUSIC_STOP: 1,
    SCHEDULE_PLAY_TO: 3,
    CANCEL_SCHEDULE_PLAY_TO: 4,
    SEND_NOTIFICATION: 5,
    PLAYSTOP: 6,
    IM_THE_ADMIN: 99999,
}