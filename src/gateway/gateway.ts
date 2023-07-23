import { OnModuleInit } from "@nestjs/common";
import { WebSocketServer, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Server } from 'socket.io';

@WebSocketGateway()
export class MyGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log("connected: " + socket.id)
        })
    }

    @SubscribeMessage('start-game')
    handleStartGame(@MessageBody() msg: any): void {
        console.log("this is twice!")
        this.server.emit('start-game', "dsdss")
    }

}