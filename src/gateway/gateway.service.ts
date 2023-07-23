import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { firestoreSerivce } from "src/firestore/firestore.service";
// import { firestoreSerivce } from "src/firestore/firestore.service";

@WebSocketGateway()
export class gatewayService implements OnModuleInit {

    constructor(private readonly firestoreSerivce: firestoreSerivce) { }
    // constructor() { }

    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log("connected: " + socket.id)
        })
    }

    @SubscribeMessage('start-game')
    handleStartGame(@MessageBody() msg: any): void {
        console.log("this is once!")
        this.server.emit('start-game', "dsdss")
    }

    @SubscribeMessage('add-user')
    handleAddUser(@MessageBody() msg: any): void {
        this.firestoreSerivce.addUser(msg)
        this.server.emit('start-game', msg)
    }

    @SubscribeMessage('new-session')
    handleNewSession(@MessageBody() msg: any): void {
        this.firestoreSerivce.newSession(1);
        this.server.emit('start-game', msg)
    }

}