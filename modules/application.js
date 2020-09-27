// node_application.js
'use strict';

module.exports = class Nodeapplication {

    constructor(config) {
        this.__config = config;
        this.__clients = {};
        this.__module_registry = {};
    }

    get modules(){
        return this.__module_registry;
    }

    get config(){
        return this.__config;
    }

    set config(cnf){
        this.__config = cnf;
    }

    get clients(){
        return this.__clients;
    }

    get totalclients(){
        return Object.keys(this.__clients).length;
    }

    registerClient(client){
        this.__clients[client.id] = client;
    }

    unregisterClient(client){
        if(client.id in this.__clients) {
           delete this.__clients[client.id];
        }
    }
    
}