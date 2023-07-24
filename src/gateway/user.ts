class User {
    private socket;
    private name;
    private guess;
    private score;
    private host;
    private sessionCode;

    constructor(socket, name, host = false) {
        this.socket = socket;
        this.name = name;
        this.host = host;
    }

    getSocket = () => {
        return this.socket;
    }
    getName = () => {
        return this.name;
    }
    getGuess = () => {
        return this.guess;
    }
    getScore = () => {
        return this.score;
    }
    getHost = () => {
        return this.host;
    }
    getSessionCode = () => {
        return this.sessionCode;
    }

    setGuess = (guess) => {
        this.guess = guess;
    }
    setScore = (score) => {
        this.score = score;
    }
    setSessionCode = (sessionCode) => {
        this.sessionCode = sessionCode;
    }

    joinRoom = (roomCode) => {
        this.socket.join(roomCode);
    }
}

export default User;