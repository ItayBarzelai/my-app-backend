import { Module } from '@nestjs/common';
import { firestoreSerivce } from './firestore.service';

@Module({
    exports: [firestoreSerivce],
    providers: [firestoreSerivce],
})
export class FirestoreModule { }
