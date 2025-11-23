import { Module } from "@nestjs/common";
import { UserBehaviorService } from "./user-behavior.service";
import { BehaviorEventEmitterService } from "./behavior-event-emitter.service";

@Module({
  providers: [UserBehaviorService, BehaviorEventEmitterService],
  exports: [UserBehaviorService, BehaviorEventEmitterService],
})
export class UserBehaviorModule {}
