
// wshandler.js
'use strict';

const logger = require('../logging_setup');
const NodeApplication = require('../modules/application');

module.exports = class WebSocketConnectionHandler {
    
   constructor(server, application) {
       this.date = new Date();
       this.server = server;
       this.application = application;
       this.server.on('close', this.onServerClosure);
       this.server.on('connection', socket => {
            logger.debug('Client connecting');
           socket.isAlive = true;
           socket.isAliveTime = this.date.getUTCMilliseconds();
           this.onConnect(socket);
       });
       this.getUniqueID = function () {
        logger.debug('Generating unique client id');

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
        };
   }

   onConnect(socket) {

    logger.debug("on connect");

    const clazz = this;       
    const id = this.getUniqueID();

        socket["id"] = id;

        socket.on('message', function handleMessage(msg){
            clazz.onMessage(this, msg);
        });

        socket.on('close', function handleClose(){
            clazz.onClose(this);
        });

        socket.on('pong', function handlePong(){            
            clazz.onPong(this);
        });


        this.application.registerClient(socket);
   }


   onClose(socket) {
        logger.debug("close");
        this.application.unregisterClient(socket);
   }


   onPong(socket){
        logger.debug("pong");
        socket.isAlive = true;
        socket.isAliveTime = this.date.getUTCMilliseconds();
   }

   
   onMessage(socket, message) {
        logger.debug("message" + message);
   }

   
   onServerClosure(){
        logger.debug("server shutdown");
   }
}