import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { firestoreSerivce } from "src/firestore/firestore.service";
import Session from "./session";
import { Observable } from "rxjs";

@WebSocketGateway()
export class gatewayService implements OnModuleInit {

    private sessions;

    constructor(private readonly firestoreSerivce: firestoreSerivce) {
        this.sessions = new Map();
    }

    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log("connected: " + socket.id)
        })
    }

    @SubscribeMessage('create-game')
    handleCreateGame(client, payload) {
        const event = 'create-game';
        const session = new Session(this.server);
        session.addUser(client, payload.name, true)
        this.sessions.set(session.getCode(), session)
        const response = { 'code': session.getCode() }
        client.emit(event, response)
    }

    @SubscribeMessage('join-game')
    handleJoinGame(client, payload) {
        const event = 'join-game';
        const session = this.sessions.get(payload.code);
        session.addUser(client, payload.name)
        const response = { 'users': this.sessions.getUsers }
    }


}