import gameState from "./game-state";

class Session {
    private server;
    private users = new Map(); // make class user
    private code;
    private questions; // make it queue
    private questionsIndex = 0;
    private gameState = gameState.LOBBY;
    private endGameFlag = false;

    private PLAY_TILL = 5;
    private RUNDOWN_LENGTH = 5000;

    constructor(server) {
        this.server = server;
        this.code = 111111 // get code from firebase
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
    }

    getCode = () => {
        return this.code;
    }
    getUsers = () => {
        return this.users;
    }
    getQuestion = () => {
        return this.questions[this.questionsIndex].question;
    }
    getGameState = () => {
        return this.gameState;
    }

    // setGuess = (clientId, guess) => {
    //     this.users.get(clientId).guess = guess;
    //     this.emitToRoom('add-user', this.convertMapToJason(this.getUsers()))
    // }

    emitToRoom = (message, data) => {
        this.server.to(this.getCode().toString()).emit(message, data)
    }

    convertMapToJason = (map) => {
        return JSON.stringify(Object.fromEntries(map));
    }

    removeUser = (client) => {
        this.users.delete(client.id)
        sasa// if 
    }

    getNames = () => {
        let names = [];
        this.users.forEach((user) => {
            names.push(user.getName())
        })
        return names;
    }

    addUser = (user) => {
        this.users.set(user.id, user)
        user.joinRoom(this.getCode().toString())

        if (this.users.length == 2) {
            setTimeout(() => {
                this.emitToRoom('add-user', this.getNames())
                this.startGame()
            }, 1000)
        }
    }

    startGame = () => {
        this.emitToRoom('start-game', {}); // check if {} are necessary
        this.newQuestion();
    }

    newQuestion = () => {
        console.log('newquesion')
        this.gameState = gameState.GUESSING
        this.emitToRoom('new-question', {
            question: this.getQuestion(),
        })
    }

    startRundown = () => {
        this.gameState = gameState.RUNDOWN
        this.emitToRoom('start-rundown', {
            length: this.RUNDOWN_LENGTH,
        })
        setTimeout(() => {
            this.endRundown();
        }, this.RUNDOWN_LENGTH)
    }

    endRundown = () => {
        this.emitToRoom('end-rundown', {})
        setTimeout(this.gradingRound, 1000)
        // this.gradingRound();
    }

    gradingRound = () => {
        let maxError = 999999999; // fix this find max
        this.users.forEach((user) => {
            if (Math.abs(user.guess) <= maxError) {
                maxError = Math.abs(user.guess);
            }
        })

        this.users.forEach((user) => {
            if (Math.abs(user.guess) == maxError) {
                user.score++;
                if (user.score >= this.PLAY_TILL) {
                    this.endGameFlag = true;
                }
            }
        })

        this.questionsIndex++;
        this.emitToRoom('grading-round', {
            users: this.convertMapToJason(this.users)
        });

        if (this.endGameFlag) {
            this.endGame();
        } else {
            this.newQuestion();
        }
    }

    endGame = () => {
        this.gameState = gameState.LOBBY;
        let winners = []

        this.users.forEach((user) => {
            if (user.score === this.PLAY_TILL) {
                winners.push(user)
            }
        })

        this.emitToRoom('end-game', {
            'winners': winners
        })
    }
}

export default Session;
