"use strict"
let mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/websocketchat');
let Schema = mongoose.Schema;

let messageSchema = new Schema({
    time:Date,
    text:String,
    author:String,
    color:String
});

let Message = mongoose.model('messages', messageSchema);
module.exports = Message;
