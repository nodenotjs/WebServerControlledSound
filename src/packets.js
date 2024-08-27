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
     * @param {number} delay
     */
    constructor(delay) {
        this.delay = delay;
    }
}

exports.CancelSchedulePlay = class CancelSchedulePlay {
    constructor() { }
}

exports.ConnectedCount = class ConnectedCount {
  /**
   * @param {number} count
   */  
  constructor(count) {
    this.count = count;    
  }
}

exports.NotificationPermissionLevel = class NotificationPermissionLevel {
  /**
   * @param {string} level
   */  
  constructor(level) {
    this.level = level;    
  }
}

exports.ShowNotification = class ShowNotification {
    /**
    * @param {string} message
    */  
    constructor(message) {
      this.message = message;    
    }
}

exports.UserAgent = class UserAgent {
    /**
    * @param {string} userAgent
    */  
    constructor(agent) {
      this.agent = agent;    
    }
}


exports.PlayStop = class PlayStop {
    /**
    * @param {number} duration
    */  
    constructor(duration) {
      this.duration = duration;    
    }
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
    CONNECTED_COUNT: 7,
    SHOW_NOTIFICATION: 8,
    PLAYSTOP: 9,
}

exports.CLIENT_TO_SERVER_PACKET_IDS = {
    PONG: 0,
    STATUS: 1,
    NOTIFICATION_PERMISSION_LEVEL: 3,
    USER_AGENT: 4,
}