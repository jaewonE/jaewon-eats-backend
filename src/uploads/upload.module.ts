import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { uploadController } from './upload.controller';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [uploadController],
})
export class UploadModule {}
