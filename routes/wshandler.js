
// wshandler.js
'use strict';

const { merge } = require("../app");

module.exports = class WebSocketConnectionHandler {
   constructor(server) {
       this.date = new Date();
       this.server = server;
       this.server.on('close', this.onServerClosure);
       this.server.on('connection', socket => {
           socket.isAlive = true;
           socket.isAliveTime = this.date.getUTCMilliseconds();
           this.onConnect(socket);
       });       
   }

   onConnect(socket) {
    const clazz = this;       
    
        socket.on('message', function handleMessage(msg){
            clazz.onMessage(this, msg);
        });

        socket.on('close', function handleClose(){
            clazz.onClose(this);
        });

        socket.on('pong', function handlePong(){            
            clazz.onPong(this);
        });
   }

   onClose(socket) {
        console.log("close");
   }

   onPong(socket){
        console.log("pong");
        socket.isAlive = true;
        socket.isAliveTime = this.date.getUTCMilliseconds();
   }

   onMessage(socket, message) {
        console.log("message" + message);
   }

   onServerClosure(){
        console.log("server shutdown");
   }
}