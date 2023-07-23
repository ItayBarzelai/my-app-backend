import { Injectable } from '@nestjs/common';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

@Injectable()
export class firestoreSerivce {

    private app
    private db
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyCqrlqplwr9K1mt5jO-0njT-I1C5AM4yl8",
            authDomain: "numbers-lord.firebaseapp.com",
            projectId: "numbers-lord",
            storageBucket: "numbers-lord.appspot.com",
            messagingSenderId: "926057235725",
            appId: "1:926057235725:web:2b180076b9edc14f0b5c44",
            measurementId: "G-S1S33K63ZN"
        };

        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    addUser({ name, socketId }): void {
        const userRef = async () => {
            return addDoc(collection(this.db, "users"), {
                name: name,
                socketId: socketId,
            });
        }
        try {
            userRef().then((response) => console.log(response.id))
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }


    // const q = query(citiesRef, where("state", "==", "CA"));
    newSession(hostId): number {
        const getRandomInt = (max) => {
            return Math.floor(Math.random() * max);
        }

        let newCode = getRandomInt(999999);
        console.log(newCode)
        let existAlready = false;
        const q = query(collection(this.db, "sessions"), where("code", "==", newCode));
        const querySnapshot = async () => getDocs(q);
        querySnapshot().then((response) => response.forEach((doc) => {
            console.log('sasasa')
            existAlready = true;
        }));
        if (existAlready) { this.newSession(hostId) }
        else {
            const sessionRef = async () => addDoc(collection(this.db, "sessions"), {
                host: hostId,
                sessionCode: newCode
            });
            try {
                sessionRef();
                console.log('blopp')
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            return newCode;
        }
    }
}
