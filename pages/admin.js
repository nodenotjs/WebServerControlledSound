/** @type {WebSocket} */
var ws;
/** @type {HTMLLabelElement} */
const elemConnectionStatus = document.getElementById('connection-status');
/** @type {HTMLLabelElement} */
const elemClients = document.getElementById('clients-status');
/** @type {HTMLInputElement} */
const elemScheduleDelayInput = document.getElementById('schedule-music-delay-input');

const CONNECTION_STATUS = {
    CONNECTING: "Connecting...",
    CONNECTED: "Connected!",
    CLOSED: "Ended",
    ERROR: "Error",
}

function init() {
    setConnectionStatus(CONNECTION_STATUS.CONNECTING);
    ws = new WebSocket("ws://192.168.1.7:3002/");
    
    ws.addEventListener("open", on_ws_open)
    ws.addEventListener("message", on_ws_message)
    ws.addEventListener("close", on_ws_close)
    ws.addEventListener("error", on_ws_error)
}

/**
 * 
 * @param {Event} event 
 */
function on_ws_open(event) {
    setConnectionStatus(CONNECTION_STATUS.CONNECTED);
    send(localStorage.password)
}

/**
 * 
 * @param {MessageEvent} event 
 */
function on_ws_message(event) {
    /** @type {IDPacket} */
    let packet = JSON.parse(event.data);

    switch (packet.id) {
        case SERVER_TO_ADMIN_PACKET_IDS.UPDATE_CLIENTS_STATUS:
            /** @type {ClientsStatus} */
            let status = packet.data;
            setClientsStatus(status.text);
            break;
    }
}

/**
 * 
 * @param {CloseEvent} event 
*/
function on_ws_close(event) {
    setConnectionStatus(CONNECTION_STATUS.CLOSED);

}

/**
 * 
 * @param {ErrorEvent} event 
 */
function on_ws_error(event) {
    
}

function send(data) {
    ws.send(data)
}

function sendJSON(data) {
    send(JSON.stringify(data))
}

function sendForcePlayMusic() {
    let packet = new ForceMusicPlay();
    sendJSON(new IDPacket(ADMIN_TO_SERVER_PACKET_IDS.FORCE_MUSIC_PLAY, packet))
}

function sendForceStopMusic() {
    let packet = new ForceMusicStop();
    sendJSON(new IDPacket(ADMIN_TO_SERVER_PACKET_IDS.FORCE_MUSIC_STOP, packet))
}

function sendRequestUserIteractionForNonIteractors() {
    let packet = new RequestUserIteractionForNonIteractors();
    sendJSON(new IDPacket(ADMIN_TO_SERVER_PACKET_IDS.REQUEST_USER_ITERACTION_FOR_NON_ITERACTORS, packet))
}

function sendSchedulePlay(delay) {
    let packet = new SchedulePlayTo(delay);
    sendJSON(new IDPacket(ADMIN_TO_SERVER_PACKET_IDS.SCHEDULE_PLAY_TO, packet))
}

function sendCancelSchedulePlay() {
    let packet = new CancelSchedulePlayTo();
    sendJSON(new IDPacket(ADMIN_TO_SERVER_PACKET_IDS.CANCEL_SCHEDULE_PLAY_TO, packet))
}

function setConnectionStatus(status) {
    elemConnectionStatus.innerText = `Connection Status: ${status}`
}

function setClientsStatus(status) {
    elemClients.innerText = status
}

// **CLICK EVENTS
function on_play_music_button_clicked() {
    sendForcePlayMusic();
}

function on_stop_music_button_clicked() {
    sendForceStopMusic();
}

function on_request_iretaction_button_clicked() {
    sendRequestUserIteractionForNonIteractors();
}

function on_schedule_music_play_button_clicked() {
    let delay = parseInt(elemScheduleDelayInput.value);
    sendSchedulePlay(delay);
}

function on_cancel_schedule_music_play_button_clicked() {
    sendCancelSchedulePlay();
}

init()