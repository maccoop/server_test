const express = require('express');
const { Server } = require("socket.io");
const RoomData = require('./data/room.js');
const Player = require('./model/player.js');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: "polling"
});

const hostname = '127.0.0.1';
const port = 3000;
const players = [10000];
var roomArray = new RoomData.RoomArray();
var indexPlayer = 0;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (client)=>{
    console.log('someone connected!');
    server.emit('connected', 1);
    var player = new Player();
    var connected = false;
    var room = -1;

    if(PlayerJoin(player)){
        client.emit("message", "Wellcome to DieAgain server!");
        connected = true;
    }
    else{
        client.emit("message", "Server full!");
        client.end();
        return;
    }
    client.on('login', (name)=>{
        if(!connected){
            client.end();
        }
        if(name==null)
        {
            client.end();
            return;
        }
        console.log( name + ' login!');
        player.UID = indexPlayer;
        player.DisplayName = name;
        indexPlayer++;
        players.add(player);
        server.emit('login', player.UID);
    });
    client.on('disconected', () =>{
        if(!connected)
            return;
        player.emit("disconected");
        PlayerQuit(player);
    });
    client.on('join-room', (roomid) => {
        if(!connected)
            return;
        var result = roomArray.Join(player, roomid);
        if(result == true){
            client.join(roomid)
            client.emit("success", "Join Room Success!");
        }
        else{
            client.emit("error", "Can't join room!");
        }
    });
    client.on('room-list', ()=>{
        if(!connected)
            return;
        client.emit("room-list",GetRoomList());
    });
    client.on('create-room', (roomName)=>{
        var result = roomArray.Create(roomName);
        if(result != null){
            client.join(result);
            client.emit("create-room", result);
            room = result;
        }
        else{
            client.emit("error", "Can't create more room!");
        }
    });
    client.on('update', (position, animationName)=>{
        if(!connected)
            return;
        if(room == "-1")
        {
            client.emit("error", "You not join room!");
            return;
        }
        client.to(room.uuid).emit("update", json);
    });
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

/**
 * 
 * @param {Player} player 
 */
function PlayerJoin(player){
    players.forEach((element, number) => {
        if(element == null){
            element = player;
            return true;
        }
    });
    return false;
}

/**
 * 
 * @param {Player} player 
 */
function  PlayerQuit(player){
    players.forEach((element, number) => {
        if(element == player){
            element = null;
            return true;
        }
    });
    return false;
}

function GetRoomList(){
    var result = "{'rooms:['";
    roomArray.array.forEach( (element) => {
        result += `{'id': '${element.uuid}', 'name': '${element.displayName}'},`;
        });
    result += "]}";
    return result;
}