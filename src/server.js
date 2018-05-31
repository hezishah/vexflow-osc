const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;
const express = require('express');
const http = require('http');
var app = express();

const httpServer = http.createServer(app);

var wss = new WebSocketServer({server: httpServer});

var validConnection = false;
var globalws = [];
wss.on('connection', function (ws) {
  globalws.push(ws);
  /*var id = setInterval(function () {
    ws.send(JSON.stringify(process.memoryUsage()), function () {  });
  }, 100);*/
  console.log('started client interval');
  ws.on('close', function () {
    var index = globalws.indexOf(this);
    if (index > -1) {
      globalws.splice(index, 1);
    }
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
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
var pitchClass = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];
var intervalDict = {'1/4': 'q', '1/8': '8d', '1/16': '16', '-1/4': 'qr', '-1/8': '8dr', '-1/16': '16r' };

function bachToJson(bachData)
{
    var level = 0;
    var notesOrIntervals = 0;
    var notesArray = [];
    var intervalsArray = [];
    var level=0;
    var pitchOrInterval = 0;
    var valStr = "";
    var barsNotes = [];
    var bars = [];
    for(var i=0;i<bachData.length;i++)
    {
        var c = bachData[i];
        if(c==='(')
        {
            level++;
        }
        else if(c===')')
        {
            if(pitchOrInterval)
            {
                if(valStr.length)
                {
                    valStr = valStr.split(' ')
                    for(var iStr in valStr)
                    {
                        if(valStr[iStr].length)
                        intervalsArray.push(intervalDict[valStr[iStr]]);
                    }
                    valStr = ""
                }
            }
            else
            {
                if(valStr.length)
                {
                    pitchList = []
                    valStr = valStr.split(' ')
                    for(var iStr in valStr)
                    {
                        if(valStr[iStr].length)
                            pitchList.push(pitchClass[(3+parseInt(valStr[iStr])/100)%12]);
                    }
                    if(pitchList.length)
                        notesArray.push(pitchList);
                    valStr = ""
                }
            }
            level--;
            if(level==0)
            {
                pitchOrInterval = 1;
            }
            if(level==1)
            {
                if(notesArray.length)
                    barsNotes.push(notesArray)
                    notesArray = [];
            }
        }
        else
        {
            valStr+=c;
        }
    }
    for(barsIndex in barsNotes)
    {
        bars.push(
            barsNotes[barsIndex].map(function(e, i) {
                return [e, intervalsArray[i]];}));
    }
    return bars;
}

l1 = new listenPort(5551,function(msg, rinfo){
    vexJson = bachToJson(msg.toString());
    vexJson = JSON.stringify({ch:'ch1', vex:vexJson})
    for(var ws in globalws)
    {
        globalws[ws].send(vexJson);
    }
    console.log(`${msg}`);
});
l2 = new listenPort(5552,function(msg, rinfo){
    vexJson = bachToJson(msg.toString());
    vexJson = JSON.stringify({ch:'ch2', vex:vexJson})
    for(var ws in globalws)
    {
        globalws[ws].send(vexJson);
    }
    console.log(`${msg}`);
});
l3 = new listenPort(5553,function(msg, rinfo){
    vexJson = bachToJson(msg.toString());
    vexJson = JSON.stringify({ch:'ch3', vex:vexJson})
    for(var ws in globalws)
    {
        globalws[ws].send(vexJson);
    }
    console.log(`${msg}`);
});
l4 = new listenPort(5554,function(msg, rinfo){
    vexJson = bachToJson(msg.toString());
    vexJson = JSON.stringify({ch:'ch4', vex:vexJson})
    for(var ws in globalws)
    {
        globalws[ws].send(vexJson);
    }
    console.log(`${msg}`);
});
l5 = new listenPort(5555,function(msg, rinfo){
    vexJson = bachToJson(msg.toString());
    vexJson = JSON.stringify({ch:'ch5', vex:vexJson})
    for(var ws in globalws)
    {
        globalws[ws].send(vexJson);
    }
    console.log(`${msg}`);
});
l6 = new listenPort(5556,function(msg, rinfo){
    for(var ws in globalws)
    {
        str = `${msg}`[0];
        metroJson = JSON.stringify({ch:'metro', vex:str.toString()})
        globalws[ws].send(metroJson);
    }
   console.log(`${msg}`);
});

// server listening 0.0.0.0:41234