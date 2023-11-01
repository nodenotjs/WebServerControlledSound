/** @type {HTMLLabelElement} */
const elemConnectionStatusLabel = document.getElementById("connection-status");
/** @type {HTMLLabelElement} */
const elemStatusLabel = document.getElementById("status");
/** @type {HTMLLabelElement} */
const elemServerMessageLabel = document.getElementById("server-message");
/** @type {HTMLAudioElement} */
const elemMusic = document.getElementById("music");
/** @type {HTMLAudioElement} */
const elemSilent = document.getElementById("silent");
/** @type {HTMLLabelElement} */
const elemPlayRemainingTime = document.getElementById("play-remaining-time");
/** @type {WebSocket} */
var ws;
var _currentStatus = "";
var interacted = false;
/** @type {number | undefined} */
var schedulePlayClockTime = undefined;

const CONNECTION_STATUS = {
    CONNECTING: "Conectando...",
    CONNECTED: "Conectado!",
    CLOSED: "Finalizada",
    ERROR: "Erro",
}

function init() {
    setStatus("Waiting document click.")
    setConnectionStatus(CONNECTION_STATUS.CONNECTING);

    ws = new WebSocket("ws://192.168.1.7:3001/");
    ws.addEventListener("open", on_ws_open)
    ws.addEventListener("message", on_ws_message)
    ws.addEventListener("close", on_ws_close)
    ws.addEventListener("error", on_ws_error)

    // Check Schedule Play
    setInterval(() => {
        if (schedulePlayClockTime == undefined) { setPlayRemainingTime(NaN); return; }

        let schedulePlayRemainingTime = schedulePlayClockTime - Date.now();
        setPlayRemainingTime(schedulePlayRemainingTime);

        if (schedulePlayRemainingTime < 0) {
            playMusic();
            schedulePlayClockTime = undefined;
        }
    }, 1)
}

/**
 * @param {Event} event 
 */
function on_ws_open(event) {
    setConnectionStatus(CONNECTION_STATUS.CONNECTED);

    sendStatus(_currentStatus);
}

/**
 * @param {MessageEvent} event 
 */
function on_ws_message(event) {
    // console.log(event);
    /** @type {IDPacket} */
    let idPacket = JSON.parse(event.data);

    switch (idPacket.id) {
        case SERVER_TO_CLIENT_PACKET_IDS.UPDATE_STATUS_MESSAGE:
            /** @type {UpdateStatusMessage} */
            let packet = idPacket.data;
            setServerMessage(packet.message);
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.PING:
            sendPong(Date.now());
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.PLAY_MUSIC:
            playMusic();
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.STOP_MUSIC:
            stopMusic();
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.ALERT:
            /** @type {Alert} */
            let alertPacket = idPacket.data;
            alert(alertPacket.message);
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.SCHEDULE_PLAY:
            /** @type {SchedulePlay} */
            let schedulePlayPacket = idPacket.data;
            let timeNow = Date.now();

            let packetDeriveTime = timeNow - schedulePlayPacket.destinationClockTime - schedulePlayPacket.destinationDiffTime;
            let scheduleTo = timeNow + schedulePlayPacket.desiredDelay - packetDeriveTime;

            schedulePlay(scheduleTo);

            break;
            
        case SERVER_TO_CLIENT_PACKET_IDS.CANCEL_SCHEDULE_PLAY:
            cancelSchedulePlay();
            break;
    }
}

/**
 * @param {CloseEvent} event 
 */
function on_ws_close(event) {
    setConnectionStatus(CONNECTION_STATUS.CLOSED);
    console.warn(event);
    location.reload(true)
}

/**
 * @param {ErrorEvent} event 
 */
function on_ws_error(event) {
    setConnectionStatus(CONNECTION_STATUS.ERROR);
    console.log("WebSocket error:", event);
}

// **SEND PACKETS
function sendJSON(object) {
    ws.send(JSON.stringify(object))
}

function sendStatus(message) {
    let status = new ClientStatus(message);
    sendJSON(new IDPacket(CLIENT_TO_SERVER_PACKET_IDS.STATUS, status))
}

function sendPong(localclock) {
    let packet = new Pong(localclock)
    sendJSON(new IDPacket(CLIENT_TO_SERVER_PACKET_IDS.PONG, packet))
}

function sendFirstInteraction() {
    sendJSON(new IDPacket(CLIENT_TO_SERVER_PACKET_IDS.FIRST_INTERACTION, new FirstInteraction()))
}

// **PAGE CONTROLS
function playMusic() {
    try {
        elemMusic.play();
    } catch (ex) {
        setStatus("Failed to play. Possible not user iteraction!");
    }
}

function stopMusic() {
    elemMusic.pause();
    elemMusic.currentTime = 0;
    setStatus("Music Stopped");
}

function setConnectionStatus(status) {
    elemConnectionStatusLabel.innerText = `Status de Conexão: ${status}`;
}

function setServerMessage(message) {
    elemServerMessageLabel.innerText = `Mensagem do Momento: ${message}`
}

function setStatus(status) {
    _currentStatus = status;
    elemStatusLabel.innerText = `Status: ${_currentStatus}`;
    if (ws != undefined && ws.readyState == WebSocket.OPEN) {
        sendStatus(_currentStatus)
    }
}

function setPlayRemainingTime(time) {
    elemPlayRemainingTime.innerText = `Tempo para Tocar: ${(time / 1000).toString().padEnd(3, "0")}`
}

function schedulePlay(clockTime) {
    schedulePlayClockTime = clockTime;
    setStatus(`Scheduled to play in ${(clockTime - Date.now()) / 1000}s`)
}

function cancelSchedulePlay() {
    schedulePlayClockTime = undefined;
    setStatus(`Scheduled to play removed`)
}

document.addEventListener("click", (event) => {
    if (event.isTrusted && !interacted) {
        setStatus("Ready, interacted");
        interacted = true;
        sendFirstInteraction();

        try {
            elemSilent.play();
        } catch (ex) {
            elemSilent.addEventListener("canplay", () => elemSilent.play());
        }
    }
})


init();