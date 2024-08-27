/** @type {HTMLButtonElement} */
const elemPreClick = document.getElementById("pre-click");
/** @type {HTMLDivElement} */
const elemContent = document.getElementById("content");
/** @type {HTMLLabelElement} */
const elemConnectionStatusLabel = document.getElementById("connection-status");
/** @type {HTMLLabelElement} */
const elemStatusLabel = document.getElementById("status");
/** @type {HTMLLabelElement} */
const elemServerMessageLabel = document.getElementById("server-message");
/** @type {HTMLAudioElement} */
const elemMusic = document.getElementById("music");
/** @type {HTMLAudioElement} */
const elemMusicPreload = document.getElementById("music-preload");
/** @type {HTMLAudioElement} */
const elemSilent = document.getElementById("silent");
/** @type {HTMLLabelElement} */
const elemPlayRemainingTime = document.getElementById("play-remaining-time");
/** @type {HTMLLabelElement} */
const elemConnectedCount = document.getElementById("connected");
/** @type {WebSocket} */
var ws;
var _currentStatus = "";
/** @type {number | undefined} */
var schedulePlayClockTime = undefined;
var isReconnecting = false;
var interacted = false;

navigator.serviceWorker.register("/sw.js");

const CONNECTION_STATUS = {
    CONNECTING: "Conectando...",
    CONNECTED: "Conectado!",
    CLOSED: "Finalizada",
    CLOSED_RECONNECTING: "Reconectando...",
    RECONNECTED: "Reconectado!",
    ERROR: "Erro",
}

const NOTIFICATION_PERMISSION = {
    ALLOWED: "granted",
    DENIED: "denied",
    DEFAULT: "default",
    NOT_SUPPORTED: "not_supported",
}

function init() {
    setStatus("Ready.")
    setConnectionStatus(CONNECTION_STATUS.CONNECTING);

    connect();

    // Check Schedule Play
    setInterval(() => {
        if (schedulePlayClockTime == undefined) { setPlayRemainingTime(NaN); return; }

        let schedulePlayRemainingTime = schedulePlayClockTime - Date.now();
        setPlayRemainingTime(schedulePlayRemainingTime);

        if (schedulePlayRemainingTime < 0) {
            playMusic();
            schedulePlayClockTime = undefined;
        }
    }, 1);

    setInterval(() => {
        
    })
}

setInterval(() => {
    elemSilent.play();
})

/**
 * @param {Event} event 
 */
function on_ws_open(event) {
    console.log("Connected.")
    if (isReconnecting) {
        isReconnecting = false;
        setConnectionStatus(CONNECTION_STATUS.RECONNECTED);
        setStatus("Reconnected")
    }
    else
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);

    sendStatus(_currentStatus);
    sendNotificationPermissionLevel(getNotificationsPermission());
    sendUserAgent(navigator.userAgent);
}

/**
 * @param {MessageEvent} event 
 */
function on_ws_message(event) {
    // console.log(event);
    /** @type {IDPacket} */
    let idPacket = JSON.parse(event.data);
    // console.log(idPacket)

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
            asyncAlert(alertPacket.message);
            break;
        case SERVER_TO_CLIENT_PACKET_IDS.SCHEDULE_PLAY:
            /** @type {SchedulePlay} */
            let schedulePlayPacket = idPacket.data;
            schedulePlay(schedulePlayPacket.delay);
            break;
            
        case SERVER_TO_CLIENT_PACKET_IDS.CANCEL_SCHEDULE_PLAY:
            cancelSchedulePlay();
            break;

        case SERVER_TO_CLIENT_PACKET_IDS.CONNECTED_COUNT:
            let connectedCountPacket = idPacket.data;
            setConnectedCount(connectedCountPacket.count);
            break;

        case SERVER_TO_CLIENT_PACKET_IDS.SHOW_NOTIFICATION:
            let notificationPacket = idPacket.data;
            showNotification(notificationPacket.message);
            break;

        case SERVER_TO_CLIENT_PACKET_IDS.PLAYSTOP:
            let playstopPacket = idPacket.data;
            playStopMusic(playstopPacket.duration);
            break;
    }
}

/**
 * @param {CloseEvent} event 
 */
function on_ws_close(event) {
    setConnectionStatus(CONNECTION_STATUS.CLOSED);
    console.warn(event);
    schedulePlayClockTime = NaN;

    console.log("Disconnected. Trying to reconnect in 1 second...")
    isReconnecting = true;
    setConnectionStatus(CONNECTION_STATUS.CLOSED_RECONNECTING)
    setTimeout(() => connect(), 1000);
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

function sendNotificationPermissionLevel(level) {
    let packet = new NotificationPermissionLevel(level)
    sendJSON(new IDPacket(CLIENT_TO_SERVER_PACKET_IDS.NOTIFICATION_PERMISSION_LEVEL, packet))
}

function sendUserAgent(agent) {
    let packet = new UserAgent(agent)
    sendJSON(new IDPacket(CLIENT_TO_SERVER_PACKET_IDS.USER_AGENT, packet))
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

function playStopMusic(duration) {
    try {
        playMusic();
        setStatus(`Playstop of ${duration}ms started`);
        setTimeout(() => {
            stopMusic();
            setStatus("Playstop ended");
        }, duration)
    } catch (ex) {
        setStatus("Failed to play. Possible not user iteraction!");
    }
}

function setConnectionStatus(status) {
    elemConnectionStatusLabel.innerText = `Status de Conexão: ${status}`;
}

function setServerMessage(message) {
    elemServerMessageLabel.innerText = `Mensagem: ${message}`
}

function setStatus(status) {
    _currentStatus = status;
    elemStatusLabel.innerText = `Status: ${_currentStatus}`;
    if (canSendMessages()) {
        sendStatus(_currentStatus)
    }
}

function setPlayRemainingTime(time) {
    let timeToPlay = (time / 1000).toString()
    elemPlayRemainingTime.innerText = `Tempo para Tocar: ${timeToPlay == "NaN" ? "---" : timeToPlay }`
}

function setConnectedCount(count) {
    elemConnectedCount.innerText = `Dispositivos Conectados: ${count}`
}

function schedulePlay(delay) {
    schedulePlayClockTime = Date.now() + delay;
    setStatus(`Scheduled to play in ${(delay) / 1000}s`)
}

function cancelSchedulePlay() {
    if (schedulePlayClockTime === NaN || schedulePlayClockTime === undefined) {
        setStatus(`No play schedule to remove`)
    } else {
        setStatus(`Scheduled to play removed`)
    }
    schedulePlayClockTime = undefined;
}

function connect() {
    ws = new WebSocket("ws://localhost:3000/");
    ws.addEventListener("open", on_ws_open)
    ws.addEventListener("message", on_ws_message)
    ws.addEventListener("close", on_ws_close)
    ws.addEventListener("error", on_ws_error)
}

function getNotificationsPermission() {
   if (!("Notification" in window))
      return NOTIFICATION_PERMISSION.NOT_SUPPORTED;
   return Notification.permission;
}

function canSendMessages() {
    return ws != undefined && ws.readyState == WebSocket.OPEN
}

// EVENTS
setInterval(() => {
    if (canSendMessages()) {
        sendNotificationPermissionLevel(getNotificationsPermission())
    }
}, 2000)

function on_enableNotificationsButton_clicked() {
    requestNotifications();
}

function on_preclick_clicked(event) {
    elemPreClick.hidden = true;
    elemContent.hidden = false;
    init();
}

document.addEventListener("click", (event) => {
    if (event.isTrusted && !interacted) {
        interacted = true;

        try {
            elemSilent.play();
        } catch (ex) {
            elemSilent.addEventListener("canplay", () => elemSilent.play());
        }
    }
})

function requestNotifications() {
    let currentPermission = getNotificationsPermission();
    if (currentPermission == NOTIFICATION_PERMISSION.NOT_SUPPORTED) {
        asyncAlert("Seu navegador não suporta notificações :(")
        return;
    }
    else if (currentPermission == NOTIFICATION_PERMISSION.DENIED) {
        asyncAlert("As notificações foram explicitamente negadas. Você precisa reativar manualmente.")
        return;
    }
    else if (currentPermission == NOTIFICATION_PERMISSION.ALLOWED) {
        asyncAlert("As notificações já foram habilitadas :)");
        return;
    }

    Notification.requestPermission().then(() => {
        if (canSendMessages())
            sendNotificationPermissionLevel(getNotificationsPermission())
    })
}

function showNotification(message) {
    switch (getNotificationsPermission()) {
        case NOTIFICATION_PERMISSION.ALLOWED:
            setStatus("Showing notification");
            navigator.serviceWorker.ready.then(registration => registration.showNotification("Importante", {body: message, requireInteraction: true, icon: "/files/yellow_circle.png"}))
            break;
        default:
            // setStatus("Showing notification as alert (no permission)");
            // asyncAlert(message);
            setStatus("Not showing notification (no permission)");
            break;
            
    }
}

function asyncAlert(message) {
    // Does not work
    let oldStatus = _currentStatus;
    setStatus(_currentStatus + " [Showing alert, script blocked!]");
    alert(message);
    setStatus(oldStatus);
}

// Send a random number to the server and show it in a alert to be able to identify the client in test or debug cases.
function identify() {
    let identification = Math.round(Math.random() * 9000 + 1000)
    setStatus(`Identifying as ${identification}`)
    asyncAlert(`Your identification: ${identification}.`)
}