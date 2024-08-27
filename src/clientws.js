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
     /** @type {number} */
     totalPacketsReceived
     /** @type {number} */
     localClock
     /** @type {number} */
     localClockDifference
     /** @type {number} */
     connectedTime
     /** @type {string} */
     notificationPermissionLevel

     constructor(id, websocket) {
          this.id = id;
          this._websocket = websocket;

          this.lastPingRequestTime = undefined;
          this.latency = -1;
          this.status = "";
          this.totalPacketsSent = 0;
          this.totalPacketsReceived = 0;
          this.localClock = 0;
          this.localClockDifference = 0;
          this.connectedTime = Date.now(); // TODO: Remover isso e fazer dinâmico
          this.notificationPermissionLevel = undefined;
          this.userAgent = "Unknow";

          this._onopencallback = undefined;
          this._onclosecallback = undefined;
          this._onmessagecallback = undefined;
          this._onerrorcallback = undefined;

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
          this._websocket.removeEventListener("message", this._onmessagecallback);
          this._onmessagecallback = (e) => { this.totalPacketsReceived += 1; callback(this, e) };
          this._websocket.addEventListener("message", this._onmessagecallback, true);
     }

     onopen(callback) {
          this._websocket.removeEventListener("open", this._onopencallback);
          this._onopencallback = (e) => callback(this, e);
          this._websocket.addEventListener("open", this._onopencallback, true);
     }

     onclose(callback) {
          this._websocket.removeEventListener("close", this._onerrorcallback);
          this._onerrorcallback = (e) => callback(this, e);
          this._websocket.addEventListener("close", this._onerrorcallback, true);
     }

     onerror(callback) {
          this._websocket.removeEventListener("error", this._onerrorcallback);
          this._onerrorcallback = (e) => callback(this, e);
          this._websocket.addEventListener("error", this._onerrorcallback, true);
     }

     close(code = undefined, reason = undefined) {
          this._websocket.close(code, reason);
     }

     getTotalTimeConnected() {
         return Date.now() - this.connectedTime;
     }
}