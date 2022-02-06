import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { RestaurantCoverImg } from './entities/uploads.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forFeature([RestaurantCoverImg]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
