const { json } = require("express");

exports.ClientWS = class ClientWS {
    /** @type {WebSocket} */
    _websocket


    /** @type {number} */
    id
    /** @type {number} */
    lastPingRequestTime
    /** @type {number} */
    latency
    /** @type {string} */
    status
    /** @type {number} */
    totalPacketsSent
    /** @type {boolean} */
    firstInteracted
    /** @type {number} */
    localClock
    /** @type {number} */
    localClockDifference

    constructor(id, websocket) {
        this.id = id;
        this._websocket = websocket;

        this.lastPingRequestTime = undefined;
        this.latency = -1;
        this.status = "";
        this.totalPacketsSent = 0;
        this.firstInteracted = false;
        this.localClock = 0;
        this.localClockDifference = 0;
    }

    send(data) {
        try {
            this._websocket.send(data)
            this.totalPacketsSent += 1;
        } catch (ex) {
            console.log(`Error while closing client ${this.id}`, ex);
        }
    }

    sendJSON(object) {
        try {
            this.send(JSON.stringify(object));
        } catch (ex) {
            console.log(`Error while sending client ${this.id}`, ex);
        }
    }

    onmessage(callback) {
        this._websocket.removeEventListener("message");
        this._websocket.addEventListener("message", (e) => callback(this, e));
    }

    onopen(callback) {
        this._websocket.removeEventListener("open");
        this._websocket.addEventListener("open", (e) => callback(this, e));
    }

    onclose(callback) {
        this._websocket.removeEventListener("close");
        this._websocket.addEventListener("close", (e) => callback(this, e));
    }

    onerror(callback) {
        this._websocket.removeEventListener("error");
        this._websocket.addEventListener("error", (e) => callback(this, e));
    }

    close(code = undefined, reason = undefined) {
        this._websocket.close(code, reason);
    }
}