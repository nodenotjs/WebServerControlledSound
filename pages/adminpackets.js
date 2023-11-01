class IDPacket {
    id
    data

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
}

class ClientsStatus {
    constructor(text) {
        this.text = text;
    }
}

class ForceMusicPlay {
    constructor() {
    }
}

class ForceMusicStop {
    constructor() {
    }
}

class RequestUserIteractionForNonIteractors {
    constructor() {
    }
}

class SchedulePlayTo {
    /**
     * 
     * @param {number} delay 
     */
    constructor(delay) {
        this.delay = delay;
    }
}

class CancelSchedulePlayTo {
    constructor() {
    }
}

SERVER_TO_ADMIN_PACKET_IDS = {
    UPDATE_CLIENTS_STATUS: 0
}

ADMIN_TO_SERVER_PACKET_IDS = {
    FORCE_MUSIC_PLAY: 0,
    FORCE_MUSIC_STOP: 1,
    REQUEST_USER_ITERACTION_FOR_NON_ITERACTORS: 2,
    SCHEDULE_PLAY_TO: 3,
    CANCEL_SCHEDULE_PLAY_TO: 4,
}