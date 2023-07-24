import Session from "./session";
import User from "./user";

class Player {
    private nickname: string;
    private host: boolean;
    private guess: number;
    private session: Session;
    private score: number;
    private user: User;

    constructor(nickname: string, host = false, session, Session, user: User) {
        this.nickname = nickname;
        this.host = host;
        this.session = session;
        this.user = user;
    }

    getNickname = () => {
        return this.nickname;
    }
    getHost = () => {
        return this.host;
    }
    getGuess = () => {
        return this.guess;
    }
    getSession = () => {
        return this.session;
    }
    getScore = () => {
        return this.score;
    }
    getUser = () => {
        return this.user;
    }

    setNickname = (nickname) => {
        this.nickname = nickname;
    }
    setHost = (host) => {
        this.host = host;
    }
    setGuess = (guess) => {
        this.guess = guess;
    }
    setSession = (session) => {
        this.session = session;
    }
    setScore = (score) => {
        this.score = score;
    }
    setUser = (user) => {
        this.user = user;
    }

    addToScore = () => {
        this.score++;
    }

}

export default Player;