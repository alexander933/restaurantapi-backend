import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,  // ← ¿está esto?
    UsersModule,   // ← ¿está esto?
  ],
})
export class AppModule {}