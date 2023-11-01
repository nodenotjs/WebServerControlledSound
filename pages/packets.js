class IDPacket {
    id
    data

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
}

// **SERVER TO CLIENT

class UpdateStatusMessage {
    /**
     * 
     * @param {String} message 
     */
    constructor(message) {
        this.message = message;
    }
}

class Ping {
    constructor() { }
}

class PlayMusic {
    constructor() { }
}

class StopMusic {
    constructor() { }
}

// **CLIENT TO SERVER

class Pong {
    /**
     * 
     * @param {number} localclock 
     */
    constructor(localclock) {
        this.localclock = localclock;
    }
}

class ClientStatus {
    /**
     * 
     * @param {string} message 
     */
    constructor(message) {
        this.message = message;
    }
}

class Alert {
    /**
     * 
     * @param {string} message 
     */
    constructor(message) {
        this.message = message;
    }
}

class SchedulePlay {
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

class FirstInteraction {
    constructor() { }
}

class CancelSchedulePlay {
    constructor() { }
}

// **IDS

SERVER_TO_CLIENT_PACKET_IDS = {
    UPDATE_STATUS_MESSAGE: 0,
    PING: 1,
    PLAY_MUSIC: 2,
    STOP_MUSIC: 3,
    ALERT: 4,
    SCHEDULE_PLAY: 5,
    CANCEL_SCHEDULE_PLAY: 6,

}

CLIENT_TO_SERVER_PACKET_IDS = {
    PONG: 0,
    STATUS: 1,
    FIRST_INTERACTION: 2,
}