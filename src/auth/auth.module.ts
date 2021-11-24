import { Module } from '@nestjs/common';
import { JwtService } from './jwt/auth.jwt.service';

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class AuthModule {}
