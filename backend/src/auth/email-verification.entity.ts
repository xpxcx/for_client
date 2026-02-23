import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EmailVerificationType = 'register' | 'reset' | 'profile';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 20 })
  type: EmailVerificationType;

  @Column({ type: 'int', nullable: true })
  userId: number | null;
}
