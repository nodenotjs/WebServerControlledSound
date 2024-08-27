# WebServerControlledSound

A fun project to play synchronized audio across multiple devices

## Context

This was a project created to make fun of my professor.

On the first day of school with him, I casually asked if there was a break (at break time), and from that moment on, he started teasing me and always asked me if it was break time.

So, for the last class (which would also be his last day as a professor at that university), I decided to synchronously play the national anthem of the football team he hates on the classroom computers at the exact moment of break, along with a message repeatedly telling him it was break time.

This website that I developed in a few hours was what made this possible.

The event was super fun, and it was something memorable for the rest of my life for both the professor and my colleagues.

# Features
- Control Panel
    - Remote control to play the sound
        - Play/Stop instantly
        - Schedule to play sound in X seconds (better synchronization)
        - Play and stop after X seconds
            - This was a hack used to force the download of the sound. The sound contained a few seconds of silence at the beginning
    - Sending push notifications
    - List of connected clients with useful connection information as well as client status
    - Note: Only one connection per control panel is allowed. This is intentional design
- Client
    - Prevention against tab suspension
        - Keeps the tab awake on the phone even when in the background
    - Always tries to reconnect when connection is lost
    - *And of course:*
    - Receiving push notifications
    - Plays the sound on server 
- Console
    - Displays events:
        - Change of client status
        - Clients connection and disconnection
        - Admin connection attempts/successes in the control panel
        - Sound Shedule
        - *Among others*

# How to use
NodeJS required.

Run this to download dependencies:

```bash
npm i
```

Then, run this to start the server:

```bash
npm run start
```

After that, the server should be running on `localhost:3000`

Access the client via `http://localhost:3000` page.
Access the control panel via `http://localhost:3000/admin.html`.

By default, no password is set for the control panel. Set the `PASSWD` environment variable to set a password. To access the control panel, you will need to set the `password` variable in local storage to the same value as your password. You can do this by opening the browser console and typing `localStorage.setItem("password", *PASSWORD_HERE*)` (replace \*PASSWORD_HERE\* with your password)

# Notes
- The control panel authentication system is certainly not secure. Do not use environment variables or store/transfer passwords in plain text.
- The code was made in a few hours. Sorry for the lack of beauty
- IP addresses and ports have been hardcoded. Search the project for `3000` or `ws:` to find the addresses that the client connects to/the server listens to.