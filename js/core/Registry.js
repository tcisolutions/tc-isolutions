/*
==========================================
NEXUS CORE
Registry
==========================================
*/

class Registry{

    constructor(){

        this.items = {};

    }

    set(name, value){

        this.items[name] = value;

    }

    get(name){

        return this.items[name];

    }

}

export const Registry = new Registry();