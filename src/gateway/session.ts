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
        return this.questions[this.questionsIndex];
    }
    getGameState = () => {
        return this.gameState;
    }

    convertMapToJason = (map) => {
        return JSON.stringify(Object.fromEntries(map));
    }

    addUser = (client, name, host = false) => {
        let user = { 'name': name, 'score': 0, host: host, guess: 0 }
        this.users.set(client.id, user)

        client.join(this.getCode().toString())

        this.server.on(this.getCode().toString()).emit('add-user', {
            users: this.convertMapToJason(this.users)
        });

    }

    startGame = () => {
        this.server.on(this.getCode().toString()).emit('start-game', {}) // check if {} are necessary
    }

    newQuestion = () => {
        this.gameState = gameState.GUESSING
        this.server.on(this.getCode().toString()).emit('new-question', {
            question: this.getQuestion(),
        })
    }

    startRundown = () => {
        this.gameState = gameState.RUNDOWN
        this.server.on(this.getCode().toString()).emit('start-rundown', {
            length: this.RUNDOWN_LENGTH,
        })
        setTimeout(() => {
            this.endRundown();
        }, this.RUNDOWN_LENGTH)
    }

    endRundown = () => {
        this.server.on(this.getCode().toString()).emit('end-rundown', {})
    }

    gradingRound = () => {
        let maxError = 0; /// max velue not min!!!!
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
        this.server.on(this.getCode().toString()).emit('grading-round', {
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

        this.server.on(this.getCode().toString()).emit('end-game', {
            'winners': winners
        })
    }
}

export default Session;
