const { ClientWS } = require('./clientws.js');
const { timestampToHourFormat } = require('./time.js');
const adminpackets = require('./adminpackets.js');
const packets = require('./packets.js');
const express = require('express');
const wss = require('ws');
const app = express();

const port = 3000;

const INTERACTION_ALERT_MESSAGE = "Por favor, clique em algum lugar na página. Isso é necessário para a ativação do player de música.";

const CLIENT_MAX_STATUS_LENGTH = 128;

var totalConnections = 0;
/**
 * @type {ClientWS[]}
 */
var clients = []
var status = "Ajude a aumentar a quantidade de pessoas conectadas! Espalhe o link!!! Na hora do intervalo, irá tocar o hino do Inter.";

// ** SETUP
app.use("/", express.static(__dirname + "/../pages"))
app.use("/files", express.static(__dirname + "/../files"))


const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


const webSocketServer = new wss.WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
    webSocketServer.handleUpgrade(req, socket, head, (ws) => {
        webSocketServer.emit('connection', ws, req);
    })
})

// ** WS CLIENT EVENTS

webSocketServer.on("connection", (ws) => {
    let newId = totalConnections;
    totalConnections += 1;

    console.log("New client connected! ID:", newId)

    let newClient = new ClientWS(newId, ws);

    newClient.onopen(on_client_open);
    newClient.onmessage(on_client_message);
    newClient.onclose(on_client_close);
    newClient.onerror(on_client_error);


    addNewClient(newClient);
    sendInitalPacketsData(newClient);
})

/**
 * @param {ClientWS} client 
 * @param {Event} event 
 */
function on_client_open(client, event) {
    console.log(`Client ID ${client.id} open`);
}

/**
 * @param {ClientWS} client 
 * @param {MessageEvent} event 
 */
function on_client_message(client, event) {
    // console.log(`Client ID ${client.id} message:`, event.data);
    try {
        /** @type {packets.IDPacket} */
        const packet = JSON.parse(event.data);

        switch (packet.id) {
            case packets.CLIENT_TO_SERVER_PACKET_IDS.PONG:
                if (client.lastPingRequestTime == undefined) {
                    client.close(undefined, "Unsolicited pong");
                    removeClient(client.id);
                    break;
                }

                /** @type {packets.Pong} */
                let pong = packet.data;

                client.latency = Date.now() - client.lastPingRequestTime;
                client.localClock = pong.localclock;
                client.localClockDifference = client.localClock - client.lastPingRequestTime;
                client.lastPingRequestTime = undefined;

                // console.log(`Client ${client.id} latency: ${client.latency}`)

                break;
            case packets.CLIENT_TO_SERVER_PACKET_IDS.STATUS:
                /** @type {packets.ClientStatus} */
                let status = packet.data;
                status.message = status.message.substring(0, CLIENT_MAX_STATUS_LENGTH)
                console.log(`Client ${client.id} status updated: ${status.message}`);

                client.status = status.message;
                break;
            case packets.CLIENT_TO_SERVER_PACKET_IDS.NOTIFICATION_PERMISSION_LEVEL:
                /** @type {packets.NotificationPermissionLevel} */
                let notificationsPermissionLevelPacket = packet.data;
                client.notificationPermissionLevel = notificationsPermissionLevelPacket.level.substring(0, 32);
                break;

            case packets.CLIENT_TO_SERVER_PACKET_IDS.USER_AGENT:
                /** @type {packets.UserAgent} */
                let userAgentPacket = packet.data;
                client.userAgent = userAgentPacket.agent.substring(0, 1024);
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.IM_THE_ADMIN:
                /** @type {adminpackets.ImTheAdmin} */
                let itadmpacket = packet.data;

                console.log("Admin connection received");
                try {
                    let pass = itadmpacket.password;

                    // Passwords in ENV are not secure. So they are not a good practice.
                    // I just used this because it is a simple project
                    if (process.env.PASSWD !== undefined && pass !== process.env.PASSWD)
                        throw new Error("Invalid password");

                    console.log("Admin connection accepted");

                    let admin_ws = client._websocket;
                    client.id = -1;
                    removeClient(client.id);
                    setCurrentAdminConnection(admin_ws);
                    admin_ws.removeEventListener("open", client._onopencallback);
                    admin_ws.removeEventListener("message", client._onmessagecallback);
                    admin_ws.removeEventListener("error", client._onerrorcallback);
                    admin_ws.removeEventListener("close", client._onclosecallback);
                    admin_ws.addEventListener("open", admin_open)
                    admin_ws.addEventListener("message", admin_message)
                    admin_ws.addEventListener("error", admin_error)
                    admin_ws.addEventListener("close", admin_closed)

                } catch (ex) {
                    console.log("Admin password refused");
                    client.close();
                    removeClient(client.id);
                }
                break;
            default:
                console.warn(`Client ${client.id} sends unknow packet`);
                break;
        }
    } catch (ex) {
        console.log(`Error on message of client id ${client.id}`, ex);
        console.log(`Packet`, event.data)
    }
}

/**
 * @param {ClientWS} client 
 * @param {CloseEvent} event 
 */
function on_client_close(client, event) {
    console.log(`Client ID ${client.id} closed:`, event.code, event.reason);

    removeClient(client.id)
}

/**
 * @param {Event} client 
 * @param {ErrorEvent} event 
 */
function on_client_error(client, event) {
    console.log(`Client ID ${client.id} error:`, event.message, event.error);
}

// **PACKET SENDING
/**
 * 
 * @param {ClientWS} client 
 */
function sendInitalPacketsData(client) {
    sendUpdateStatusMessage(client, status)
    sendConnectedCount(client, clients.length)
}

/**
 * 
 * @param {ClientWS} client 
 * @param {string} statusMessage 
 */
function sendUpdateStatusMessage(client, statusMessage) {
    let updateStatusMessage = new packets.UpdateStatusMessage(statusMessage);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.UPDATE_STATUS_MESSAGE, updateStatusMessage))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendPing(client) {
    let packet = new packets.Ping();
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.PING, packet))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendPlayMusic(client) {
    let packet = new packets.PlayMusic();
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.PLAY_MUSIC, packet))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendAlert(client, message) {
    let packet = new packets.Alert(message);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.ALERT, packet))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendStopMusic(client) {
    let packet = new packets.StopMusic();
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.STOP_MUSIC, packet))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendSchedulePlayMusic(client, delay) {
    let packet = new packets.SchedulePlay(delay);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.SCHEDULE_PLAY, packet))
}

/**
 * 
 * @param {ClientWS} client 
 */
function sendCancelSchedulePlayMusic(client) {
    let packet = new packets.CancelSchedulePlay();
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.CANCEL_SCHEDULE_PLAY, packet))
}

/**
 * @param {ClientWS} client 
 * @param {number} connectedCount 
 */
function sendConnectedCount(client, connectedCount) {
    let packet = new packets.ConnectedCount(connectedCount);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.CONNECTED_COUNT, packet));
}

/**
 * @param {ClientWS} client 
 * @param {number} message 
 */
function sendShowNotification(client, message) {
    let packet = new packets.ShowNotification(message);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.SHOW_NOTIFICATION, packet));
}

/**
 * @param {ClientWS} client 
 * @param {number} duration 
 */
function sendPlayStop(client, duration) {
    let packet = new packets.PlayStop(duration);
    client.sendJSON(new packets.IDPacket(packets.SERVER_TO_CLIENT_PACKET_IDS.PLAYSTOP, packet));
}

// **ADMIN
/** @type {WebSocket | undefined }*/
var adminConnection = undefined;

function removeCurrentAdminConnection() {
    if (adminConnection != undefined) {
        try {
            adminConnection.close();
        } catch (ex) { }
        adminConnection = undefined;
    }
}

function setCurrentAdminConnection(ws) {
    removeCurrentAdminConnection();
    adminConnection = ws;
}

function admin_open(event) {
}

function admin_message(event) {
    try {
        /** @type {packets.IDPacket} */
        const packet = JSON.parse(event.data);

        switch (packet.id) {
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.FORCE_MUSIC_PLAY:
                clients.forEach(c => sendPlayMusic(c));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.FORCE_MUSIC_STOP:
                clients.forEach(c => sendStopMusic(c));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.SCHEDULE_PLAY_TO:
                /** @type {adminpackets.SchedulePlayTo} */
                let shedulePlayPacket = packet.data;
                console.log(`Sending scheduling to play in ${shedulePlayPacket.delay / 1000} seconds`)
                clients.forEach(c => sendSchedulePlayMusic(c, shedulePlayPacket.delay - c.latency / 2));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.CANCEL_SCHEDULE_PLAY_TO:
                clients.forEach(c => sendCancelSchedulePlayMusic(c));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.SEND_NOTIFICATION:
                /** @type {adminpackets.SendNotification} */
                let sendNotificationPacket = packet.data;
                clients.forEach(c => sendShowNotification(c, sendNotificationPacket.message));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.PLAYSTOP:
                /** @type {adminpackets.PlayStop} */
                let playStopPacket = packet.data;
                clients.forEach(c => sendPlayStop(c, playStopPacket.duration));
                break;
            default:
                console.log("Admin sended invalid packet")
                break;
        }
    } catch (ex) {
        console.log("Admin connection caused an error:", ex);
    }
}

function admin_closed(event) {
    console.log("Admin connection closed");
    removeCurrentAdminConnection();
}

function admin_error(event) {
    console.log("Admin error");
    removeCurrentAdminConnection();
}

function admin_send(data) {
    if (adminConnection != undefined)
        adminConnection.send(data)
}

function admin_sendJSON(object) {
    admin_send(JSON.stringify(object));
}

function admin_sendClientsStatus(text) {
    let packet = new adminpackets.ClientsStatus(text);
    admin_sendJSON(new adminpackets.IDPacket(adminpackets.SERVER_TO_ADMIN_PACKET_IDS.UPDATE_CLIENTS_STATUS, packet));
}

// **ADMIN PERIODIC EVENTS
const sendAdminInformations = setInterval(() => {
    if (adminConnection == undefined) return;

    let clientsNotificationPermissionLevelTotal = getClientsPermissionLevelResume();
    let clientsLatencyResume = getClientsLatencyResume();

    let statusString = ""
    statusString += `Connected Clients: ${clients.length} (total: ${totalConnections})\n`
    statusString += `Clients Notification Permission Level Resume: ${JSON.stringify(clientsNotificationPermissionLevelTotal)}\n`
    statusString += `Clients Latency Resume:\n- Average: ${clientsLatencyResume.average}ms\n- Min: ${clientsLatencyResume.min}ms\n- Max: ${clientsLatencyResume.max}ms\n`
    statusString += `\nClients:\n`

    clients.forEach(c => {
        statusString += `\nID: ${c.id}`
        statusString += `\n- STATUS: "${c.status}"`;
        statusString += `\n- USER_AGENT: "${c.userAgent}"`; // Debug Pruposes
        statusString += `\n- NOTIFICATION_PERMISSION_LEVEL: ${c.notificationPermissionLevel}`
        statusString += `\n- CONNECTION_TIME: ${timestampToHourFormat(c.getTotalTimeConnected())}`
        statusString += `\n- TOTAL_PACKETS_TO_DST/TOTAL_PACKETS_FROM_SRC: ${c.totalPacketsSent}/${c.totalPacketsReceived}`
        statusString += `\n- PING: ${c.latency}ms`
    })

    admin_sendClientsStatus(statusString);
}, 500)

function getClientsPermissionLevelResume() {
    let clientsNotificationPermissionLevelTotal = {}

    clients.map(c => c.notificationPermissionLevel).forEach(permissionLevel => {
        if (!(permissionLevel in clientsNotificationPermissionLevelTotal))
            clientsNotificationPermissionLevelTotal[permissionLevel] = 0;
        clientsNotificationPermissionLevelTotal[permissionLevel] += 1;
    })
    return clientsNotificationPermissionLevelTotal;
}

function getClientsLatencyResume() {
    let status = {
        average: 0,
        max: -Infinity,
        min: Infinity,
    };

    clients.map(c => c.latency).forEach(latency => {
        status.max = Math.round(Math.max(status.max, latency));
        status.min = Math.round(Math.min(status.min, latency));
        status.average += latency;
    })
    status.average = Math.round(status.average / clients.length);

    return status;
}

// **SETUP PERIODIC EVENTS
const sendPingInterval = setInterval(() => {
    clients.forEach(c => {
        if (c.lastPingRequestTime != undefined) return;
        c.lastPingRequestTime = Date.now();
        sendPing(c);
    });
}, 1000)

// **MANAGING UTILITIES

function addNewClient(client) {
    clients.push(client)
    on_clientCountChanged();
}

function removeClient(id) {
    clients = clients.filter(c => c.id != id);
    on_clientCountChanged();
}

// SERVER EVENTS
function on_clientCountChanged() {
    clients.forEach(c => sendConnectedCount(c, clients.length))
}