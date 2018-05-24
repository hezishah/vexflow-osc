const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;
const express = require('express');
const http = require('http');
var app = express();

const httpServer = http.createServer(app);

var wss = new WebSocketServer({server: httpServer});

var validConnection = false;
var globalws = null;
wss.on('connection', function (ws) {
  validConnection = true;
  globalws = ws;
  /*var id = setInterval(function () {
    ws.send(JSON.stringify(process.memoryUsage()), function () {  });
  }, 100);*/
  console.log('started client interval');
  ws.on('close', function () {
    validConnection = false;
    globalws = null;
    console.log('stopping client interval');
    /*clearInterval(id);*/
  });
});

app.use('/', express.static('public'))
httpServer.listen(3000);

/* UDP Communication */
const dgram = require('dgram');

function listenPort(portNum, onMessage) {

    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
    });

    server.on('message', (msg, rinfo) => {
     onMessage(msg,rinfo);
    });

    server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(portNum);
}


l1 = new listenPort(5551,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("ch1, " + msg.toString());
    }
    console.log(`${msg}`);
});
l2 = new listenPort(5552,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("ch2, " + msg.toString());
    }
    console.log(`${msg}`);
});
l3 = new listenPort(5553,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("ch3, " + msg.toString());
    }
    console.log(`${msg}`);
});
l4 = new listenPort(5554,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("ch4, " + msg.toString());
    }
    console.log(`${msg}`);
});
l5 = new listenPort(5555,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("ch5, " + msg.toString());
    }
    console.log(`${msg}`);
});
l6 = new listenPort(5556,function(msg, rinfo){
    if(validConnection)
    {
       globalws.send("metro, " + msg.toString());
    }
   console.log(`${msg}`);
});

// server listening 0.0.0.0:41234