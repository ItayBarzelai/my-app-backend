class Session {
    private server;
    private users = [];
    private code;
    private questions;
    private questionsIndex = 0;
    private waitingForGuess = false;

    constructor(hostId, hostName, server) {
        this.server = server;
        this.users[0] = { 'name': hostName, 'id': hostId };
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
        ] // get questions from firebase
        console.log(this.users)
    }

    getCode = () => {
        return this.code;
    }

    isWaitingForGuess = () => {
        return this.waitingForGuess;
    }

    getQuestion = () => {
        const index = this.questionsIndex;
        this.waitingForGuess = true;
        this.questionsIndex++;
        return this.questions[index];
    }

    getUsersNames = () => {
        let names = [];
        for (let i = 0; i < this.users.length; i++) {
            names.push(this.users[i].name)
        }
        return names;
    }

    addUser = (userId, name) => {
        console.log(this.users)
        console.log({ 'name': name, 'id': userId })
        this.users.push({ 'name': name, 'id': userId })
    }
}

export default Session;
