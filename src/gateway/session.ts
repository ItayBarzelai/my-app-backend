import { Server } from "socket.io";
import gameState from "./game-state";
import Player from "./player";
import User from "./user";

const PLAY_TILL = 5;
const RUNDOWN_LENGTH = 5000;

class Session {
    private sessionCode: number;
    private players = new Map<string, Player>();
    private questions; // make it queue + class
    private server: Server;
    private questionsIndex = 0;
    // private endGameFlag = false;
    private gameState;
    static get PLAY_TILL() {
        return PLAY_TILL;
    }
    static get RUNDOWN_LENGTH() {
        return RUNDOWN_LENGTH;
    }

    constructor(server: Server) {
        this.sessionCode = 111111 // get code from firebase
        this.server = server;
        this.gameState = gameState.LOBBY;
    }

    getSessionCode = (): number => {
        return this.sessionCode;
    }
    getPlayers = (): Map<string, Player> => {
        return this.players;
    }
    getQuestions = () => {
        return this.questions;
    }
    getServer = (): Server => {
        return this.server;
    }
    getQuestionIndex = (): number => {
        return this.questionsIndex
    }

    setSessionCode = (sessionCode: number) => {
        this.sessionCode = sessionCode;
    }
    setPlayers = (players: Map<string, Player>) => {
        this.players = players;
    }
    setQuestions = (questions) => {
        this.questions = questions;
    }
    setServer = (server: Server) => {
        this.server = server;
    }
    setQuestionIndex = (questionsIndex: number) => {
        this.questionsIndex = questionsIndex
    }

    getRoomId = (): string => {
        return this.sessionCode.toString();
    }

    createPlayer = (nickname: string, user: User, host: boolean = false): void => {
        let player = new Player(nickname, user, host);
        player.setSession(this);
        this.players.set(user.getSocketId(), player);
        this.emitToRoomPlayersNicknames();
    }

    deletePlayer = (user: User): void => {
        this.players.delete(user.getSocketId())
        this.emitToRoomPlayersNicknames();
    }

    emitToRoom = (event: string, payload: any): void => {
        this.server.to(this.getRoomId()).emit(event, payload);
    }

    emitToRoomPlayersNicknames = (): void => {
        this.emitToRoom('players-nicknames', this.getPlayersNicknames())
    }

    emitToRoomNicknamesOfPlayersThatGuessed = (): void => {
        let nicknames = [];
        this.players.forEach((player) => {
            if (player.getGuess() != null) {
                nicknames.push(player.getNickname());
            }
        })
        this.emitToRoom('players-guessed', nicknames)
    }

    resetPlayersGuesses = (): void => {
        this.players.forEach((player) => player.resetGuess())
    }

    getQuestion = (): string => {
        return this.questions[this.questionsIndex].question;
    }

    getAnswer = (): number => {
        return this.questions[this.questionsIndex].answer;
    }

    getPlayersNicknames = (): string[] => {
        let nicknames = [];
        this.players.forEach((player) => nicknames.push(player.getNickname()))
        return nicknames;
    }

    getPlayersGuessesAndScores = (): { nickname: string, guess: number, score: number }[] => {
        let playersGuesses = [];
        this.players.forEach((player) => {
            playersGuesses.push({
                nickname: player.getNickname(),
                guess: player.getGuess(),
                score: player.getScore()
            })
        })
        return playersGuesses;
    }

    getPlayersNicknamesThatWon = (): string[] => {
        let playersNicknamesThatWon = [];
        this.players.forEach((player) => {
            if (player.getScore() === PLAY_TILL) {
                playersNicknamesThatWon.push(player.getNickname());
            }
        })
        return playersNicknamesThatWon;
    }

    startGame = (): void => {
        this.emitToRoom('start-game', {});
        this.players.forEach((player) => player.resetPlayer());
        this.questions = [
            {
                question: 'how many seconds there are in an hour?',
                answer: 3600
            },
            {
                question: '2',
                answer: 2
            },
            {
                question: '3',
                answer: 3
            },
            {
                question: '4',
                answer: 4
            },
            {
                question: '5',
                answer: 5
            },
            {
                question: '6',
                answer: 6
            },
            {
                question: '7',
                answer: 7
            },
            {
                question: '8',
                answer: 8
            },
            {
                question: '9',
                answer: 9
            },
        ] // get questions from firebase
        this.startRound();
    }

    startRound = (): void => {
        this.gameState = gameState.GUESSING;
        this.resetPlayersGuesses();
        this.emitToRoom('start-round', {
            question: this.getQuestion()
        });
    }

    startRundown = (): void => {
        if (this.gameState === gameState.GUESSING) {
            this.emitToRoom('start-rundown', {
                length: RUNDOWN_LENGTH
            });
            this.emitToRoomNicknamesOfPlayersThatGuessed();
            setTimeout(this.endRundown, RUNDOWN_LENGTH + 2000); // delete it
        }
    }

    evaluateGuessesAndChangeScores = (): void => {
        let minGuessError = -1;
        this.players.forEach((player) => {
            let guessError = player.evaluateGuessError(this.getAnswer());
            if ((minGuessError === -1) || (guessError <= minGuessError)) {
                minGuessError = guessError;
            }
        })
        this.players.forEach((player) => {
            let guessError = player.evaluateGuessError(this.getAnswer());
            if (guessError === minGuessError) {
                player.addToScore();
            }
        })
    }

    endRundown = (): void => {
        this.evaluateGuessesAndChangeScores()
        if (this.getPlayersNicknamesThatWon().length === 0) {
            this.emitToRoom('end-rundown', this.getPlayersGuessesAndScores());
            this.questionsIndex++;
            this.startRound();
        }
        else {
            this.endGame();
        }
    }

    endGame = (): void => {
        this.gameState = gameState.LOBBY;
        this.emitToRoom('end-game', {
            winners: this.getPlayersNicknamesThatWon()
        });
    }
}

export default Session;
