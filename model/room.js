module.exports = class room{
    constructor() {
        this._uid = "";
        this._displayName = "";
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