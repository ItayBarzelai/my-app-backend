import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { firestoreSerivce } from "src/firestore/firestore.service";
import Session from "./session";
import User from './user';
import { Observable } from "rxjs";

@WebSocketGateway({ cors: true })
export class gatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    private sessions;
    private users;

    constructor(private readonly firestoreSerivce: firestoreSerivce) {
        this.sessions = new Map();
        this.users = new Map();
    }

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log("init scoket-io");
    }

    handleConnection(client: Socket) {
        console.log("connected: " + client.id);
        this.users.set(client.id, new User(client));
    }

    handleDisconnect(client: Socket) {
        console.log("disconnected: " + client.id);
        const user = this.users.get(client.id);
        user.getPlayer().getSession().deletePlayer(user);
        try {
            if (user.getPlayer().getSession().getPlayers().length === 0) {
                this.sessions.delete(user.getPlayer().getSession().getSessionCode());
            }
        } catch (error) { console.log("here is the problem" + error); }
        this.users.delete(user.id);
    } // add delete players and sessions if needed

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
        user.emit('join-game', { code: session.getSessionCode() });
    }

    @SubscribeMessage('im-ready')
    handleImReady(client, payload) {
        const user = this.users.get(client.id);
        user.getPlayer().setIsReady(true);
        user.getPlayer().getSession().emitToRoomPlayersReadyStatuses();
    }

    @SubscribeMessage('start-game')
    handleStartGame(client, payload) {
        const user = this.users.get(client.id);
        user.getPlayer().getSession().startGame();
    }

    @SubscribeMessage('screen-mounted')
    handleScreenMounted(client, payload) {
        const user = this.users.get(client.id);
        user.getPlayer().updateIsScreenMounted();
    }

    @SubscribeMessage('send-guess')
    handleNewGuess(client, payload) {
        const user = this.users.get(client.id);
        user.getPlayer().updateGuess(payload.guess);
    }

}