const ServerConfig = require("../config/ServerConfig");
const Player = require("../model/player");
const AmountPlayerARoom = ServerConfig.PLAYER_A_ROOM;

class Room{
    /**
     * 
     * @param {number} uuid 
     * @param {String} displayName
     * @param {number} Level
     * @param {string} password
     */
    constructor(uuid, displayName, Level){
        this.uuid = uuid;
        this.displayName = displayName;
        /**
         * @property {Player[]} playerArray
         */
        this.playerArray = [];
        for (let i = 0; i < AmountPlayerARoom; i++) {
            this.playerArray.push(null);
        }
        this.level = Level;
    }
}

class RoomArray{
    /**
     * 
     * @param {int} number 
     */
    constructor(number){
        /**
         * @type {Room[]}
         */
        this.array = [];
        for (let i = 0; i < number; i++) {
            this.array.push(null);
        }
    }

    /**
     * @param {String} displayName
     * @param {number} level
     * @returns number
     */
    Create(displayName, level){
        for(let i = 0; i< this.array.length; i++){
            if(!this.array[i]){
                let id = "room" + i;
                this.array[i] = new Room(id,displayName,level);
                console.log(`Create Room "${displayName}" with id "${id}"!`);
                return this.array[i];
            }
        }
        console.log("No room to created!");
        return null;
    }

    /**
     * 
     * @param {number} player 
     * @param {number} uuid 
     * @returns Room
     */
    Join(player_id, uuid){
        var room;
        for(let i = 0 ; i < this.array.length; i++){
            if(this.array[i] && this.array[i].uuid == uuid){
                room = this.array[i];
                break;
            }
        }
        if(!room){
            console.log(`Room with id ${uuid} not exits!`);
            return null;
        }
        for(let i = 0; i < room.playerArray.length; i++){
            if(!room.playerArray[i]){
                room.playerArray[i] = player_id;
                return room;
            }
        }
        console.log("Room " + uuid + " full!");
        return null;
    }

    /**
     * 
     * @param {number} player 
     * @param {number} uuid 
     * @returns {boolean} result
     */
    Quit(player_id, uuid){
        var indexroom = this.array.findIndex(x=>x.uuid == uuid);
        if(indexroom == -1){
            console.log("Room not exits!");
            return false;
        }
        var room = this.array[indexroom];
        var nullPlayer = 0;
        for(let i = 0; i < AmountPlayerARoom; i++){
            if(!room.playerArray[i]){
                nullPlayer++;
                continue;
            }
            if(room.playerArray[i] == player_id){
                room.playerArray[i] = null;
                nullPlayer++;
                console.log(`player ${player_id} quit room ${uuid}`);
            }
        }
        if(nullPlayer >= AmountPlayerARoom){
            this.array[indexroom] = null;
            console.log('remove room: ' + uuid);
            return;
        }

        return true;;
    }


    Win(room_id, new_level){
        var indexroom = this.array.findIndex(x=>x.uuid == room_id);
        if(indexroom == -1){
            console.log("Room not exits!");
            return false;
        }
        var room = this.array[indexroom];
        room.level = new_level;
        return true;
    }
}

module.exports =  {Room, RoomArray};