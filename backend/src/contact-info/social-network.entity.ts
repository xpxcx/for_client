import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('social_networks')
export class SocialNetwork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;
}
