/*
==========================================
NEXUS CORE
Logger
==========================================
*/

export const Logger = {

    info(...args){

        console.log("🟢", ...args);

    },

    warn(...args){

        console.warn("🟡", ...args);

    },

    error(...args){

        console.error("🔴", ...args);

    }

};