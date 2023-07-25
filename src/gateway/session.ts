import { Server } from "socket.io";
import gameState from "./game-state";
import Player from "./player";
import User from "./user";
import { Logger } from "@nestjs/common";

const logger = new Logger();

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
        let player = new Player(nickname, user, host, this);
        this.players.set(user.getSocketId(), player);
        this.emitToRoomPlayersNicknames();

        if (this.players.size === 2) {
            setTimeout(this.startGame, 2000)
        }
    }

    deletePlayer = (user: User): void => {
        this.players.delete(user.getSocketId())
        this.emitToRoomPlayersNicknames();
    }

    emitToRoom = (event: string, payload: any): void => {
        this.server.to(this.getRoomId()).emit(event, payload);
        logger.log('logged to room + ' + event)
    }

    emitToRoomPlayersNicknames = (): void => {
        console.log(this.getPlayersNicknames())
        this.emitToRoom('players-nicknames', this.getPlayersNicknames())
    }

    emitToRoomNicknamesOfPlayersThatGuessed = (): void => {
        let nicknames = [];
        this.players.forEach((player) => {
            if (player.getGuess() != null) {
                nicknames.push(player.getNickname());
            }
        })
        this.emitToRoom('players-guessed', { nicknames: nicknames })
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
            { question: "How many continents are there on Earth?", answer: 7 },
            { question: "What is the square root of 144?", answer: 12 },
            { question: "In the Roman numeral system, what number does 'C' represent ?", answer: 100 },
            { question: "How many players are there on a standard soccer(football) team?", answer: 11 },
            { question: "What is the atomic number of carbon?", answer: 6 },
            { question: "How many sides does a heptagon have?", answer: 7 },
            { question: "What is the sum of the first two prime numbers?", answer: 3 },
            { question: "How many degrees are there in a right angle?", answer: 90 },
            { question: "What is the sum of the interior angles of a triangle?", answer: 180 }
        ] // get questions from firebase
        setTimeout(this.startRound, 2000)
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
            console.log('start-rundown');
            this.gameState = gameState.RUNDOWN;
            this.emitToRoom('start-rundown', {
                length: RUNDOWN_LENGTH
            });
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
        this.gameState = gameState.GUESSING;
        this.evaluateGuessesAndChangeScores()
        if (this.getPlayersNicknamesThatWon().length === 0) {
            this.emitToRoom('end-rundown', { scores: this.getPlayersGuessesAndScores(), answer: this.getAnswer() });
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
