"use strict";

// Process title for 'ps' or 'htop'
process.title = 'node-chat';

const PORT = 3000;

const ws = require(`websocket`);
const WebSocketServer = ws.server;
//const ws = require('ws');
//const WebSocketServer = ws.Server;
const express = require('express');
const app = express();
const http = require('http').Server(app);

// Global variables
let history = [];
let clients = [];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Add some colors
const colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];

/**
 * Express Server
 */
app.use('/', express.static('src/html'));
app.use('/css', express.static('src/css'));
app.use('/js', express.static('src/js'));
http.listen(PORT, function () {
    console.log(new Date() + " Server is listening on port: " + PORT);
});
const wss = new WebSocketServer({
    httpServer: http
});

wss.on('request', function (request) {
    console.log(new Date() + " Connection from origin " + request.origin + '.');
    let connection = request.accept(null, request.origin);
    let index = clients.push(connection) - 1;
    let userName = false;
    let userColor = false;

    console.log(new Date() + " Connection accepted");
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify({
            type: 'history',
            data: history
        }));
    }
    // User sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if (userName === false) {
                userName = htmlEntities(message.utf8Data);
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({
                    type: 'color',
                    data: userColor
                }));
                console.log(new Date() + ' User is known as: ' + userName + ' with ' + userColor + ' color.');
            }
            else {
                console.log(new Date() + ' Received Message from ' + userName + ': ' + message.utf8Data);
                let messageObject = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(messageObject);
                history = history.slice(-100);

                let newMessage = JSON.stringify({
                    type: 'message',
                    data: messageObject
                });
                for (let i = 0; i < clients.length; i++) {
                    clients[i].sendUTF(newMessage);
                }
            }
        }
    });
    // User disconnected
    connection.on('close', function(connection) {
        if(userName !== false && userColor!== false) {
            console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected");
            clients.splice(index, 1);
            colors.push(userColor);
        }
    });
});
