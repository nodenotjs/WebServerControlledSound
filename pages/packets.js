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
     * @param {number} delay
     */
    constructor(delay) {
        this.delay = delay;
    }
}

class CancelSchedulePlay {
    constructor() { }
}

class ConnectedCount {
  /**
   * @param {number} count
   */  
  constructor(count) {
    this.count = count;    
  }
}

class NotificationPermissionLevel {
  /**
   * @param {string} level
   */  
  constructor(level) {
    this.level = level;    
  }
}

class ShowNotification {
    /**
    * @param {string} level
    */  
    constructor(message) {
      this.message = message;    
    }
}

class UserAgent {
    /**
    * @param {string} userAgent
    */  
    constructor(agent) {
      this.agent = agent;    
    }
}


class PlayStop {
    /**
    * @param {number} duration
    */  
    constructor(duration) {
      this.duration = duration;    
    }
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
    CONNECTED_COUNT: 7,
    SHOW_NOTIFICATION: 8,
    PLAYSTOP: 9,
}

CLIENT_TO_SERVER_PACKET_IDS = {
    PONG: 0,
    STATUS: 1,
    NOTIFICATION_PERMISSION_LEVEL: 3,
    USER_AGENT: 4,
}