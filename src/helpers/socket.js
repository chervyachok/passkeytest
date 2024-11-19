//import { io } from "socket.io-client";

import SocketIO from 'socket.io-client'

//app.use(new VueSocketIO({
//  debug: false,
//  connection: SocketIO(API_URL, { path: API_PATH + '/socket.io/' }),  
//  extraHeaders: { 'Access-Control-Allow-Credentials': true },
//  //allowEIO3:true
//}))

export default SocketIO(API_URL, { 
    path: API_PATH + '/socket.io/',
    extraHeaders: { 'Access-Control-Allow-Credentials': true },
});