// node_application.js
'use strict';

const logger = require('../logging_setup');
const ExpressMessage = require('express-message');
const Queue = require('queue-fifo');


class Pinger{
    constructor(config){
        this.__conf = conf;
        this.__callback = undefined
        this.__pinger = undefined;
        this.__date = new Date();
    }

    get callback(){
        return this.__callback
    }
    
    set callback(fun){
        this.__callback = fun;
    }
    
    
    __generatePing(){
        var ping = this.__date.getUTCMilliseconds();
        if(this.__callback){
            this.__callback(ping);
        }
    }        
    
    
    start(){
        if(this.__conf){
            if(this.__conf.hasOwnProperty('ping_interval_seconds') ){
                var interval = this.__conf['ping_interval_seconds']; 
                this.__pinger = setInterval(() => {
                    this.__generatePing();
                }, interval);
            }
        }
    }

    stop(){
        clearInterval(this.__pinger);
    }
}



class RPCGateway{
    constructor(config){
        
    }
}


class PubSubHub{

    LOGMONITORING = "/logging"
    SYSMONITORING = "/stats"
    PING = "/ping"
    EVENTS = "/events"


    constructor(config){
        this.__config = config
        this.__channels = {}
        this.__notifyable = undefined
        this._initialize()
    }


    get channels(){
        return this.__channels;
    }

    
    set channels(__channels){
        this.__channels = __channels;
    }


    get notifyable(){
        return this.__notifyable;
    }
        
    
    set notifyable(__notifyable){
        this.__notifyable = __notifyable;
    }


    _initialize(){

        var pubsub_channels = this.__config["topics"];

        pubsub_channels.forEach(function (channel_info) {
            var topicname = channel_info["name"];
            var topictype = channel_info["type"];
            var queuesize = channel_info["queue_size"];
            var max_users = channel_info["max_users"];
        });        
        
        logger.debug("total channels = " + Object.keys(dictionary).length);
    }


    subscribe(topicname, client){
        if(!(topicname in this.channels)){
            if(this.__config["allow_dynamic_topics"] == True){
                var channel_info = {}
                channel_info["name"] = topicname ;
                channel_info['type'] = "bidirectional"
                channel_info["queue_size"] = 1
                channel_info["max_users"]  = 0
                this.createChannel(channel_info)
            }else{
                logger.error("Topic channel " + topicname + " does not exist and cannot be created either");
            }
        }else{
            var clients = this.channels[topicname]['subscribers'];
            clients.add(client);
            logger.info("Total clients in " + topicname + " = " + clients.size);
        }
    }


    /**
     * Client subscribe to multiple topics
     */

    subscribe_topics(topics, client){
        topics.forEach(function(topic) {
            this.subscribe(topic, client)
        });   
    }


    /**
        Client unsubscribes from topic
    **/
    unsubscribe(topicname, client){
        if(topicname in this.channels){
            var clients = this.channels[topicname]['subscribers'];
            clients.delete(client);
            logger.info("Total clients in " + topicname + " = " + clients.size);
            
            if (clients.size == 0 && this.is_dynamic_channel(topicname)){
                this.removeChannel(topicname);
            }
        }
    }


    /**
        clear all subscriptions
    **/
    clearsubscriptions(client){
        Object.keys(this.channels).forEach(function(key) {
            logger.info("Clearing client subscription in topic " + key)
            this.unsubscribe(key, client);
        });
    }



    /**
        Creates a dynamic bidirectional communication channel
    **/
   
    createChannel(channel_info){
        if(("name" in channel_info) && !(channel_info["name"] in this.channels)){
            topicname = channel_info["name"];
            topictype = channel_info["type"];
            queuesize = channel_info["queue_size"];
            max_users = channel_info["max_users"];
            logger.info("Registering channel " +  topicname);
            this.channels[topicname] = {'name': topicname, 'type' : topictype, 'queue_size' : queuesize, 'msg_queue' : new Queue(), 'subscribers' : new Set(), 'max_users' : max_users};
            logger.debug("Activating message flush for topic " +  topicname)
            //tornado.ioloop.IOLoop.current().spawn_callback(this.__flush_messages, topicname)
            // start background [processing of message queue]
        }
    }


    /**
        Removes a communication channel
    **/
   removeChannel(topicname){

    Object.keys(this.channels).forEach(function(topicname) {
        if(k == topicname){
            delete this.channels[topicname];
            logger.info("Removed channel "  + topicname);
        }
    });
    }

    
    /**
        Accepts data submission for topic
    **/
    __submit(topicname, message){
        if(topicname in this.channels){
            msgque = this.channels[topicname]['msg_queue'];
            msgque.enqueue(message); // put message in queue
        }
    }



    /**
        Publishes data to a specified topic, if it exists.
        If topic channel does not exist, it is created based on configuration
        parameter `allow_dynamic_topic`
    **/
    publish(topicname, message, client=undefined){
        if(!(topicname in this.channels)){
            if(this.__config["allow_dynamic_topics"] == true){
                channel_info = {}
                channel_info["name"] = topicname  
                channel_info['type'] = "bidirectional"
                channel_info["queue_size"] = 1
                channel_info["max_users"]  = 0
                this.createChannel(channel_info)
                this.__submit(topicname, message)
            } else {
                this.logger.error("Topic channel does not exist and cannot be created either")
            }
        } else {
            this.__submit(topicname, message)
        }
    }




    /**
        Publishes event data to a events channel
    **/
    publish_event(event){
        if(EVENTS in this.channels){
            if(this.__isValidEvent(event)){
                this.__submit(EVENTS, event)
            }
        }
    }



   /*
    Validates message as `event` object and publishes to 'events' channel
   */
    __isValidEvent(event){
        if(event.hasOwnProperty("name") && event.hasOwnProperty("category") && event.hasOwnProperty("data")){
            return true
        }
        return false
    }



    /*
        Validates message as `event`for reactionengine
    */
    __isValidReactableEvent(event){
        if(event.hasOwnProperty('topic') && event.hasOwnProperty('data')){
            return true
        return false
        }
    }

    
    /*
        Activate auto message flush for all channels
    */
    activate_message_flush(){
        Object.keys(this.channels).forEach(function(topic) {
            logger.debug("Activating message flush for topic " + topic)
            //tornado.ioloop.IOLoop.current().spawn_callback(this.__flush_messages, topic)
        });
    }    
}



module.exports = {
    PubSubHub : PubSubHub,
    RPCGateway : RPCGateway,
    Pinger : Pinger
  }