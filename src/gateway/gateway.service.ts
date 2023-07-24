import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { firestoreSerivce } from "src/firestore/firestore.service";
import Session from "./session";
import User from './user';
import { Observable } from "rxjs";

@WebSocketGateway({ cors: true })
export class gatewayService implements OnModuleInit {

    private sessions;
    private users;

    constructor(private readonly firestoreSerivce: firestoreSerivce) {
        this.sessions = new Map();
        this.users = new Map();
    }

    @WebSocketServer()
    server: Server;

    onModuleInit() {
        // this.sessions.set(1, new Session(this.server)) // delete me
        this.server.on('connection', (socket) => {
            console.log("connected: " + socket.id)
        })

        this.server.on('disconnect', (socket) => {
            this.users.delete(socket.id);
        }) // add delete session
    }

    @SubscribeMessage('create-game')
    handleCreateGame(client, payload) {
        const event = 'create-game';
        const user = new User(client, payload.name, true);
        this.users.set(client.id, user);
        const session = new Session(this.server);
        session.addUser(user




        );
        this.sessions.set(session.getCode().toString(), session);
        const response = { 'code': session.getCode() };
        client.emit(event, response);
    }

    @SubscribeMessage('join-game') // create error when room not found
    handleJoinGame(client, payload) {
        const event = 'join-game';
        const session = this.sessions.get(payload.code.toString());
        this.users.set(client.id, client)
        session.addUser(client, payload.name)
        const response = { 'code': session.getCode() }
        client.emit(event, response)
    }

    @SubscribeMessage('send-guess')
    handleNewGuess(client, payload) {
        const event = 'send-guess';
        const user = this.users.get(client.id)
        const session = this.sessions.get(payload.code.toString());
        session.setGuess(client.id, payload.guess)
        session.startRundown();
    }


}