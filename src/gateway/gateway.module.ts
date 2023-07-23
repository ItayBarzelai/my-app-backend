import { Module } from "@nestjs/common";
import { gatewayService } from "./gateway.service";
import { FirestoreModule } from "src/firestore/firestore.module";

@Module({
    imports: [FirestoreModule],
    providers: [gatewayService],
})
export class GatewayModule { }