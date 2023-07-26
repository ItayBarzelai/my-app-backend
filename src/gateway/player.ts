import Session from "./session";
import User from "./user";

class Player {
    private nickname: string;
    private host: boolean;
    private guess: number;
    private session: Session;
    private score: number;
    private user: User;
    private isReady: boolean;

    constructor(nickname: string, user: User, host: boolean, session: Session) {
        console.log(`nickename: ${nickname}`)
        this.nickname = nickname;
        this.host = host;
        this.user = user;
        this.session = session;
        this.isReady = false;

        this.user.setPlayer(this)
        this.user.joinRoom(this.session.getRoomId());
    }

    getNickname = (): string => {
        return this.nickname;
    }
    getHost = (): boolean => {
        return this.host;
    }
    getGuess = (): number => {
        return this.guess;
    }
    getSession = (): Session => {
        return this.session;
    }
    getScore = (): number => {
        return this.score;
    }
    getUser = (): User => {
        console.log("get user" + this.user.getSocketId())
        return this.user;
    }
    getIsReady = () => {
        if (this.host)
            return true;
        else
            return this.isReady;
    }

    setNickname = (nickname: string) => {
        this.nickname = nickname;
    }
    setHost = (host: boolean) => {
        this.host = host;
    }
    setGuess = (guess: number) => {
        this.guess = guess;
    }
    setSession = (session: Session) => {
        this.session = session;
    }
    setScore = (score: number) => {
        this.score = score;
    }
    setUser = (user: User) => {
        this.user = user;
    }
    setIsReady = (isReady: boolean) => {
        this.isReady = isReady;
    }

    resetGuess = (): void => {
        this.guess = null;
    }

    updateGuess = (guess: number): void => {
        if (this.guess === null) {
            this.guess = guess;
        }
        console.log('updateguess')
        this.session.startRundown();
        this.session.emitToRoomNicknamesOfPlayersThatGuessed();
    }

    resetPlayer = (): void => {
        this.resetGuess();
        this.score = 0;
    }

    evaluateGuessError = (answer: number): number => {
        if (this.guess === null) {
            this.guess = 0;
        }
        return Math.abs(answer - this.guess);
    }

    addToScore = (): void => {
        this.score++;
    }

}

export default Player;