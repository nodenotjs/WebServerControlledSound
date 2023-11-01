exports.IDPacket = class IDPacket {
    id
    data

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
}

// **SERVER TO CLIENT

exports.UpdateStatusMessage = class UpdateStatusMessage {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        this.message = message;
    }
}

exports.Ping = class Ping {
    constructor() { }
}

exports.PlayMusic = class PlayMusic {
    constructor() { }
}

exports.StopMusic = class StopMusic {
    constructor() { }
}

// **CLIENT TO SERVER

exports.Pong = class Pong {
    /**
     * 
     * @param {number} localclock 
     */
    constructor(localclock) {
        this.localclock = localclock;
    }
}

exports.ClientStatus = class ClientStatus {
    /**
     * 
     * @param {string} message 
     */
    constructor(message) {
        this.message = message;
    }
}

exports.Alert = class Alert {
    /**
     * 
     * @param {string} message 
     */
    constructor(message) {
        this.message = message;
    }
}

exports.SchedulePlay = class SchedulePlay {
    /**
     * 
     * @param {number} destinationClockTime
     * @param {number} destinationDiffTime
     * @param {number} desiredDelay
     */
    constructor(destinationClockTime, destinationDiffTime, desiredDelay) {
        this.destinationClockTime = destinationClockTime;
        this.destinationDiffTime = destinationDiffTime;
        this.desiredDelay = desiredDelay;
    }
}

exports.FirstInteraction = class FirstInteraction {
    constructor() { }
}

exports.CancelSchedulePlay = class CancelSchedulePlay {
    constructor() { }
}


// **IDS

exports.SERVER_TO_CLIENT_PACKET_IDS = {
    UPDATE_STATUS_MESSAGE: 0,
    PING: 1,
    PLAY_MUSIC: 2,
    STOP_MUSIC: 3,
    ALERT: 4,
    SCHEDULE_PLAY: 5,
    CANCEL_SCHEDULE_PLAY: 6,
}

exports.CLIENT_TO_SERVER_PACKET_IDS = {
    PONG: 0,
    STATUS: 1,
    FIRST_INTERACTION: 2,
}