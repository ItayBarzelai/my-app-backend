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
        this.server.on('connection', (socket) => {
            console.log("connected: " + socket.id);
            this.users.set(socket.id, new User(socket));
        })

        this.server.on('disconnect', (socket) => {
            this.users.delete(socket.id);
        }) // add delete players and sessions if needed
    }

    @SubscribeMessage('create-game')
    handleCreateGame(client, payload) {
        const user = this.users.get(client.id);
        this.users.set(user.getSocketId(), user);
        const session = new Session(this.server);
        this.sessions.set(session.getSessionCode(), session);
        session.createPlayer(payload.nickname, user, true);
        user.emit('create-game', {
            code: session.getSessionCode()
        });
    }

    @SubscribeMessage('join-game') // create error when room not found
    handleJoinGame(client, payload) {
        const user = this.users.get(client.id);
        const session = this.sessions.get(parseInt(payload.code));
        session.createPlayer(payload.nickname, user);
        user.emit('join-game', session.getPlayersNicknames());
    }

    @SubscribeMessage('send-guess')
    handleNewGuess(client, payload) {
        const user = this.users.get(client.id);
        user.getPlayer().updateGuess(payload.guess);
    }

}