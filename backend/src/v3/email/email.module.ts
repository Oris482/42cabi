import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import MailerConfigService from "src/config/mailer.config";
import { MailService } from "src/email/email.service";

@Module({
    imports: [
      ScheduleModule.forRoot(),
      MailerModule.forRootAsync({
        imports: [ConfigModule],
        useClass: MailerConfigService,
      }),
    ],
  
    providers: [MailService],
    exports: [MailService],
  })
  export class MailModule {}