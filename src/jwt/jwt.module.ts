import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './jwt.service';

@Module({
  imports: [ConfigModule],
  providers: [JwtService],
})
export class JwtModule {}
