const express = require('express');
const { Server } = require("socket.io");
const RoomData = require('./data/room.js');
const Player = require('./model/player.js');
const http = require('http');
const Const = require('./config/Const.js');
const DataConfig = require('./config/ServerConfig.js');
const Parameter = require('./config/ParameterConfig.js');

const app = express();
const server = http.createServer(app);
const versionApp = DataConfig.VERSION_APP;
const hostname = DataConfig.HOSTNAME
const port = DataConfig.PORT;
const playerNumber = DataConfig.MAX_PLAYER;

const players = [];
for(let i = 0; i< playerNumber; i++){
    players.push(null);
}
const io = new Server(server, {
  transports: DataConfig.TRANSPORT
});
const roomArray = new RoomData.RoomArray(DataConfig.MAX_ROOM);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on(Parameter.CONNECTION, (client)=>{
    console.log('someone connected!');
    var player = new Player();
    var connected = false;
    var roomId = null;
    var indexPlayer;
    indexPlayer = PlayerJoin();
    if(indexPlayer == 0 || indexPlayer){
        connected = true;
        player.UID = indexPlayer;
        players[indexPlayer] = player;
        client.emit(Const.CONNECTED, "Wellcome to DieAgain server!");
    }
    else{
        client.emit(Const.ERROR, "Server full!");
        client.disconnect(true);
        return;
    }
    client.on(Parameter.LOGIN, (name)=>{
        if(!connected){
            return;
        }
        if(name==null)
        {
            client.end();
            return;
        }
        players[indexPlayer].displayName = name;
        console.log( name + ' login!');
        client.emit(Parameter.LOGIN, player.UID);
    });
    client.on(Parameter.DISCONNECTED, () =>{
        if(!connected)
            return;
        player.emit(Parameter.DISCONNECTED);
        PlayerQuit(player);
    });
    client.on(Parameter.CREATE_ROOM, (roomName)=>{
        var roomData = roomArray.Create(roomName, 1);
        if(roomData){
            roomId = roomData.uuid;
            roomArray.Join(player.UID, roomId);
            client.join(roomId);
            let result = {
                idRoom: roomId,
                level: roomData.level
            }
            client.emit("create-room", JSON.stringify(result));
        }
        else{
            client.emit(Const.ERROR, "Can't create more room!");
        }
    });
    client.on(Parameter.JOIN_ROOM, (roomid) => {
        if(!connected)
            return;
        var roomData = roomArray.Join(player.UID, roomid);
        if(roomData){
            roomId = roomData.uuid;
            client.join(roomId);
            client.emit(Parameter.JOIN_ROOM, JSON.stringify({
                idRoom: roomId,
                level: roomData.level
            }));
            console.log(`${player.DisplayName} join room: ${roomId}`);
            io.to(roomId).emit(Parameter.NOTICE_PLAYER_JOIN, `${player.DisplayName} join!`);
        }
        else{
            client.emit(Const.ERROR, "Can't join room!");
        }
    });
    client.on(Parameter.QUIT_ROOM, (roomid) => {
        var result = roomArray.Quit(player.UID, roomid);
        io.to(roomid).emit(Parameter.LEAVE_ROOM, player.UID);
        client.emit(Parameter.QUIT_ROOM, "Quit Room Success!");
    });
    client.on(Parameter.GET_ROOM_LIST, ()=>{
        if(!connected)
            return;
        client.emit(Parameter.GET_ROOM_LIST,GetRoomList());
    });
    client.on(Parameter.UPDATE, (data)=>{
        if(!connected)
        {
            client.emit(Const.ERROR, "You not login!");
            return;
        }
        if( roomId != 0 && !roomId)
        {
            client.emit(Const.ERROR, "You not join room!");
            return;
        }
        io.to(roomId).emit(Parameter.UPDATE, JSON.stringify({
            id: player.UID,
            data: data
        }));
    });
    client.on(Parameter.LOSE, ()=>{
        console.log(`room ${roomId} status LOSE`);
        io.to(roomId).emit(Parameter.LOSE);
    })
    client.on(Parameter.WIN, (new_level)=>{
        console.log(`room ${roomId} status LOSE`);
        var result = roomArray.Win(roomId,new_level);
        if(result)
            console.log(roomId +' on win at: ' + new_level);
        io.to(roomId).emit(Parameter.WIN, new_level);
    })
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

/**
 * 
 * @param {number} player 
 */
function PlayerJoin(){
    for(let i = 0; i < playerNumber; i++){
        if(!players[i]){
            return i;
        }
    }
    return null;
}

/**
 * 
 * @param {number} player 
 */
function  PlayerQuit(player_id){
    for(let i = 0; i< playerNumber; i++){
        if(players[i] == player_id){
            players[i] = null;
            return true;
        }
    }
    return false;
}

function GetRoomList(){
    var result = {
        rooms: []
    }
    for(let i = 0;i<DataConfig.MAX_ROOM; i++){
        if(!roomArray.array[i])
            continue;
        result.rooms.push({
            id: roomArray.array[i].uuid,
            name: roomArray.array[i].displayName
        })
    }
    var stringify = JSON.stringify(result);
    console.log(`get list room: ${stringify}`);
    return stringify;
}