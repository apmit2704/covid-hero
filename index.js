'use strict';

require('dotenv').config()
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;
const PORT = process.env.PORT || 5000;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images
app.set('view engine', 'ejs');
const server = app.listen(PORT, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket) {
    console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
    app.locals.hostshow = req.headers.host;
    console.log(app.locals.hostshow )
    res.render('home');
});
app.get('/home', (req, res) => {
    app.locals.hostshow = req.headers.host;
    res.render('home');
});

app.get('/voice', (req, res) => {
    app.locals.hostshow = req.headers.host;
    res.render('voice');
});

app.get('/dialogflow-messenger', (req,res)=>{
    app.locals.hostshow = req.headers.host;
    res.render('home');
});
// Web UI
app.use('**', (req, res) => {
    res.render('home');
});

io.on('connection', function(socket) {
    socket.on('chat message', (text) => {
        console.log('Message: ' + text);

        // Get a reply from API.ai

        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on('response', (response) => {
            let aiText = response.result.fulfillment.speech;
            console.log('Bot reply: ' + aiText);
            socket.emit('bot reply', aiText);
        });

        apiaiReq.on('error', (error) => {
            console.log(error);
        });

        apiaiReq.end();

    });
});