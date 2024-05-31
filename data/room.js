const Player = require("../model/player");

class Room{
    /**
     * 
     * @param {number} uuid 
     * @param {String} displayName 
     */
    constructor(uuid, displayName){
        this.uuid = uuid;
        this.displayName = displayName;
        /**
         * @property {Player[]} playerArray
         */
        this.playerArray = new Player[4];
    }
}

class RoomArray{
    constructor(){
        /**
         * @type {Room[]}
         */
        this.array = [1000];
    }

    /**
     * @param {String} displayName
     * @returns {number} uuid
     */
    Create(displayName){
        this.array.forEach(
            (element, number) => {
                if(element == null || element == ""){
                    element = new Room(number, displayName);
                    return number;
                }
            }
        )
        console.log("No room to created!");
        return null;
    }

    /**
     * 
     * @param {Player} player 
     * @param {number} uuid 
     * @returns {boolean} result
     */
    Join(player, uuid){
        var room = this.array.findIndex(uuid);
        if(room == null){
            console.log("Room not exits!");
            return false;
        }
        room.playerArray.forEach((element,index) => {
            if(element == null)
            {
                element = player;
                return true;
            }
        });
        console.log("Room " + uuid + " full!");
        return false;
    }

    /**
     * 
     * @param {Player} player 
     * @param {number} uuid 
     * @returns {boolean} result
     */
    Quit(player, uuid){
        var room = this.array.findIndex(uuid);
        if(room == null){
            console.log("Room not exits!");
            return false;
        }
        room.playerArray.forEach((element,index) => {
            if(element == player)
            {
                element = null;
                return true;
            }
        });
        console.log("Room " + uuid + " full!");
        return false;
    }
}

module.exports =  {Room, RoomArray};