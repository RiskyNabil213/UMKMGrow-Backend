import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';
import { KontenModule } from './konten/konten.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ChatModule } from './chat/chat.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BusinessModule } from './business/business.module';
import { JobsModule } from './jobs/jobs.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CommunityModule } from './community/community.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PaymentModule,
    KontenModule,
    TransactionsModule,
    ChatModule,
    SubscriptionsModule,
    BusinessModule,
    JobsModule,
    SuppliersModule,
    CommunityModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}