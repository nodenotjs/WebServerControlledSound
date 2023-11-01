const { ClientWS } = require('./clientws.js');
const adminpackets = require('./adminpackets.js');
const packets = require('./packets.js');
const express = require('express');
const wss = require('ws');
const app = express();

const wsPort = 3001;
const wsAdmPort = 3002;
const port = 80;

const INTERACTION_ALERT_MESSAGE = "Por favor, clique em algum lugar na página. Isso é necessário para a ativação do player de música.";


var totalConnections = 0;
/**
 * @type {ClientWS[]}
 */
var clients = []
var status = "Na hora do intervalo, irá tocar o hino do Inter. Vingançaaaaa!!";

// ** SETUP

app.use("/", express.static(__dirname + "\\..\\pages"))
app.use("/files", express.static(__dirname + "\\..\\files"))

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})


const webSocketServer = new wss.WebSocketServer({ port: wsPort })
webSocketServer.on("listening", () => {
    console.log(`WebSocket listening on port ${wsPort}`);
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
                console.log(`Client ${client.id} status updated: ${status.message}`);

                client.status = status.message;
                break;
            case packets.CLIENT_TO_SERVER_PACKET_IDS.FIRST_INTERACTION:
                client.firstInteracted = true;
                break;
            default:
                console.warn("Client sends unknow packet");
                break;
        }
    } catch (ex) {
        console.log(`Error on message:`, ex);
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
function sendSchedulePlayMusic(client, localClock, clockDiff, desiredDelay) {
    let packet = new packets.SchedulePlay(localClock, clockDiff, desiredDelay);
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

// **MANAGING UTILITIES

function addNewClient(client) {
    clients.push(client)
}

function removeClient(id) {
    clients = clients.filter(c => c.id != id);
}

// **SETUP PERIODIC EVENTS
const sendPingInterval = setInterval(() => {
    clients.forEach(c => {
        if (c.lastPingRequestTime != undefined) return;
        c.lastPingRequestTime = Date.now();
        sendPing(c);
    });
}, 100)




// **ADMIN
/** @type {WebSocket | undefined }*/
var adminConnection = undefined;

const adminWebSocketServer = new wss.WebSocketServer({ port: wsAdmPort })
adminWebSocketServer.on("listening", () => {
    console.log(`Admin WebSocket listening on port ${wsAdmPort}`);
})

adminWebSocketServer.on("connection", (ws) => {
    console.log("Admin connection received");
    ws.once("message", (event) => {
        try {
            let pass = event.toString();

            // TODO: REMOVE THE HARDCODED PASSWORD
            if (pass !== process.env.PASSWD)
                throw new Error("Invalid password");

            console.log("Admin connection accepted");

            setCurrentAdminConnection(ws);
            ws.addEventListener("open", admin_open)
            ws.addEventListener("message", admin_message)
            ws.addEventListener("error", admin_error)
            ws.addEventListener("close", admin_closed)

        } catch (ex) {
            console.log("Admin connection refused");
            try {
                ws.close();
            } catch (ex) { }
        }
    })
})

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
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.REQUEST_USER_ITERACTION_FOR_NON_ITERACTORS:
                clients.filter(c => c.firstInteracted != true).forEach(c => sendAlert(c, INTERACTION_ALERT_MESSAGE));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.SCHEDULE_PLAY_TO:
                /** @type {adminpackets.SchedulePlayTo} */
                let shedulePlayPacket = packet.data;
                console.log(`Scheduling to play in ${shedulePlayPacket.delay / 1000} seconds`)
                clients.forEach(c => sendSchedulePlayMusic(c, Date.now(), c.localClockDifference, shedulePlayPacket.delay));
                break;
            case adminpackets.ADMIN_TO_SERVER_PACKET_IDS.CANCEL_SCHEDULE_PLAY_TO:
                clients.forEach(c => sendCancelSchedulePlayMusic(c));
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

    let statusString = ""
    statusString += `Total Connections: ${totalConnections}\n`
    statusString += `Connected Clients: ${clients.length}\n`
    statusString += `\nClients:\n`

    clients.forEach(c => {
        statusString += `\nID: ${c.id}`
        statusString += `\n- STATUS: "${c.status}"`;
        statusString += `\n- FIRST_INTERACTION: ${c.firstInteracted}`
        statusString += `\n- LOCAL_CLOCK: ${c.localClock} (diff: ${c.localClockDifference}ms)`
        statusString += `\n- TOTAL_PACKETS_SENT: ${c.totalPacketsSent}`
        statusString += `\n- PING: ${c.latency}ms`
    })

    admin_sendClientsStatus(statusString);
}, 100)