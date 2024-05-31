module.exports = class Player{
    constructor() {
        this._uid = "";
        this._displayName = "";
        this._roomId = "";
    }

    set UID(uid){
        this._uid = uid;
    }
    set DisplayName(name){
        this._displayName = name;
    }

    get UID(){
        return this._uid;
    }

    get DisplayName(){
        return this._displayName;
    }
}
