import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class RestaurantCoverImg extends CoreEntity {
  @Column()
  @IsString()
  coverImg: string;
}
