"use strict";
const content = document.getElementById('content');
const input = document.getElementById('message');
const status = document.getElementById('status');

let myColor = false;
let myName = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;
if (!window.WebSocket) {
    content.innerHTML = '<p>Sorry, but your browser doesn\'t support WebSocket.</p>';
    input.style.display = "none";
}
else {
    console.log(window.location.host);
    let connection = new WebSocket("ws://" + window.location.host);
    connection.addEventListener('open', function () {
        input.disabled = false;
        status.innerText = "Choose name:";
    });

    connection.addEventListener('error', function () {
        content.innerHTML = '<p>Sorry, but there\'s some problem with your connection or the server is down.</p>';
    });

    connection.addEventListener('message', function (message) {
        let json;
        try {
            json = JSON.parse(message.data);
        }
        catch (exception) {
            console.log("Invalid data received from server");
        }
        if (json.type === 'color') {
            myColor = json.data;
            status.innerText = myName + ': ';
            status.style.color = myColor;
            input.removeAttribute('disabled');
            input.focus();
        } else if (json.type === 'history') {
            let prevMessages = json.data;
            for (let i = 0; i < prevMessages.length; i++) {
                addMessage(prevMessages[i].author, prevMessages[i].text, prevMessages[i].color, new Date(prevMessages[i].time));
            }
        } else if (json.type === 'message') {
            input.removeAttribute('disabled');
            addMessage(json.data.author, json.data.text,
                json.data.color, new Date(json.data.time));
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this:', json);
        }
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            let msg = this.value;
            if (msg) {
                connection.send(msg);
                this.value = "";
                if (myName === false) {
                    myName = msg;
                }
            }
        }
    });
}


function addMessage(author, message, color, dt) {
    let parser = new DOMParser();
    let ele_string = '<p><span style="color:' + color + '">'
        + author + '</span> @ ' + (dt.getHours() < 10 ? '0'
            + dt.getHours() : dt.getHours()) + ':'
        + (dt.getMinutes() < 10
            ? '0' + dt.getMinutes() : dt.getMinutes())
        + ': ' + message + '</p>'
    let element = parser.parseFromString(ele_string, 'text/html').body;
    if(author === myName){
        element.classList.add("message-self");
    }
    content.appendChild(element);
}

