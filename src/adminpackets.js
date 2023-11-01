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

exports.RequestUserIteractionForNonIteractors = class RequestUserIteractionForNonIteractors {
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

exports.SERVER_TO_ADMIN_PACKET_IDS = {
    UPDATE_CLIENTS_STATUS: 0
}

exports.ADMIN_TO_SERVER_PACKET_IDS = {
    FORCE_MUSIC_PLAY: 0,
    FORCE_MUSIC_STOP: 1,
    REQUEST_USER_ITERACTION_FOR_NON_ITERACTORS: 2,
    SCHEDULE_PLAY_TO: 3,
    CANCEL_SCHEDULE_PLAY_TO: 4,
}