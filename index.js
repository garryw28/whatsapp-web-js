const { response } = require("express");
const dotenv = require("dotenv");
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client } = require('whatsapp-web.js');

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
dotenv.config();

//#region Whatsapp

// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    session: sessionData
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
	console.log(message.from + ":" + message.body);
});

client.initialize();
//#endregion whatsapp

//#region express
app.use(express.json());
app.post("/sendMessage", function(req,res){
    var response = {
        to : req.body.to,
        message : req.body.message,
        result : ""
    };
    console.log(response);
    try{
        client.sendMessage(req.body.to+"@c.us",req.body.message);
        res.writeHead(200,{"Content-Type":"application/json"});
        response.result = "Success";
    }
    catch(err)
    {
        res.writeHead(500,{"Content-Type":"application/json"});
        console.log(err);
        response.result = err;
    }
    res.end(JSON.stringify(response));
});

var server = app.listen(process.env.PORT, function () {
    var host = process.env.HOST;
    var port = process.env.PORT;
    console.log("Example app listening at http://%s:%s", host, port);
 });
 //#endregion express