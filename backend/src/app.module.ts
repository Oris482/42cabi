import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { SessionMiddleware } from './middleware/session-middleware';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { BlackholeModule } from './blackhole/blackhole.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import TypeOrmConfigService from './config/typeorm.config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { CabinetModule } from './cabinet/cabinet.module';
import { LentModule } from './lent/lent.module';
import { UserModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BetatestModule } from './betatest/betatest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true, // TODO: remove after
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('No options');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    AuthModule,
    EventModule,
    BlackholeModule,
    // ServeStaticModule.forRoot({
    //   // rootPath: join(__dirname, `../../', ${this.configService.get<number>('is_v3')} ? 'frontend_v3/dist/' : 'frontend/dist/`),
    //   exclude: ['/api/(.*)', '/v3/(.*)', '/auth/(.*)'],
    //   // serveRoot: '../img'
    // }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        rootPath: join(__dirname, '../../', `${configService.get<boolean>('is_v3') ? 'frontend_v3/dist/' : 'frontend/dist/'}`),
        exclude: ['/api/(.*)', '/v3/(.*)', '/auth/(.*)'],
      }],
    }),
    EventEmitterModule.forRoot(),
    CabinetModule,
    LentModule,
    UserModule,
    UtilsModule,
    BetatestModule,
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [SessionMiddleware],
})
export class AppModule implements NestModule {
  constructor(public sessionMiddleware: SessionMiddleware) {}

  configure(consumer: MiddlewareConsumer) {
    // NOTE: JWT 토큰이 쿠키에 저장되기 때문에 모든 경로에 대해 해당 미들웨어 적용
    consumer.apply(this.sessionMiddleware.cookieParser).forRoutes('*');
  }
}