"use strict"
let Message = require('./mongo_helper');

const writeMess = function (json_message) {
    let mongo_mess = new Message(json_message);
    mongo_mess.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('saved successfully');
    })
};

module.exports = writeMess;