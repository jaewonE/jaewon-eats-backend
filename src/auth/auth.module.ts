import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from 'src/user/user.module';
import { AuthAppGuard } from './auth.guard';
import { JwtService } from './jwt/jwt.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthAppGuard,
    },
  ],
  exports: [JwtService],
})
export class AuthModule {}
