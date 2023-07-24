import { Socket } from "socket.io";
import Player from "./player";

class User {
    private player: Player;
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    getPlayer = (): Player => {
        return this.player;
    }
    getSocket = (): Socket => {
        return this.socket;
    }

    setPlayer = (player: Player) => {
        this.player = player;
    }
    setSocket = (socket: Socket) => {
        this.socket = socket;
    }

    getSocketId = (): string => {
        return this.socket.id;
    }

    emit = (event: string, payload: any): void => {
        this.socket.emit(event, payload);
    }

    joinRoom = (roomId: string): void => {
        this.socket.join(roomId);
    }
}

export default User;