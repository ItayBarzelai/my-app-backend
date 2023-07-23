import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { FirestoreModule } from './firestore/firestore.module';

@Module({
  imports: [GatewayModule, FirestoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
