import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}
  sign(userId: string): string {
    return jwt.sign(
      { id: userId },
      this.configService.get('JWT_PRIVATE_TOKEN'),
    );
  }
  verify(token: string) {
    return jwt.verify(token, this.configService.get('JWT_PRIVATE_TOKEN'));
  }
}
