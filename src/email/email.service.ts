import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import fs from 'fs';
import { BanService } from 'src/ban/ban.service';
import { overUserInfoDto } from 'src/ban/dto/overUserInfo.dto';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private banService: BanService,
  ) {}

  public sendMail(intra_id: string, subject: string, file: string): void {
    this.mailerService
      .sendMail({
        from: `"42CABI" <${process.env.MAIL_FROM}>`,
        to: intra_id + '@student.42seoul.kr',
        subject: subject,
        template: `./${file}`,
        context: { intra_id },
      })
      .then((success) => {
        this.logger.log(`Send mail to ${intra_id} success! ${success}`);
        fs.appendFileSync(
          './email_logs/emailLog.txt',
          `${intra_id} : ${new Date()} : ${success.response}`,
        );
      })
      .catch((err) => {
        this.logger.error(`Send mail to ${intra_id} failed.. 🥺 ${err}`);
        fs.appendFileSync(
          './email_logs/emailLog.txt',
          `${intra_id} : ${new Date()} : ${err}`,
        );
      });
  }

  public mailing(info: overUserInfoDto[], num: number) {
    let subject = '42CABI 사물함 연체 알림';
    let file = 'overdue.hbs';
    if (num === 0) {
      file = 'soonoverdue.hbs';
    } else if (num === 7) {
      file = 'overdue.hbs';
    } else if (num === 14) {
      file = 'lastoverdue.hbs';
    } else if (num === 15) {
      subject = '42CABI 영구사용정지 안내';
      file = 'ban.hbs';
    }
    info.forEach((user) => this.sendMail(user.intra_id, subject, file));
  }

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  public scheduling() {
    this.logger.log('연체된 사용자들에게 메일을 보내는 중...');
    const dayList = [0, 7, 14];
    dayList.forEach((day) => {
      this.banService
        .getOverUser(day)
        .then((res) => {
          if (res) {
            this.mailing(res, day);
          }
        })
        .catch((e) => this.logger.error(e));
    });
    // 연체 후 14일이 경과하여 밴 메일을 보냄.
    this.banService
      .getOverUser(15)
      .then((res) => {
        if (res) {
          res.forEach(async (user) => {
            //user
            await this.banService.updateUserAuth(user.user_id);
            //cabinet
            await this.banService.updateCabinetActivation(user.cabinet_id, 2);
            //return
            await createLentLog({
              // TODO: v1의 queryModel.ts에 있는 내용이며 다른곳에서도 쓰임.
              user_id: user.user_id,
              intra_id: user.intra_id,
            });
            //ban
            await this.banService.addBanUser({
              user_id: user.user_id,
              intra_id: user.intra_id,
              cabinet_id: user.cabinet_id,
            });
          });
          this.mailing(res, 15);
          connectionForCabinet(); // TODO: v1의 dbModel.ts에 있는 내용이며 다른곳에서도 쓰임.
        }
      })
      .catch((e) => this.logger.error(e));
  }
}