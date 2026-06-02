import {
  Controller, Post, Get,
  Body, Param, Request,
  HttpCode, HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** POST /payment/create — butuh JWT token */
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createTransaction(
    @Request() req: any,
    @Body() body: { plan: string; billingCycle: string; customerName?: string; customerEmail?: string },
  ) {
    // userId diambil dari JWT token — tidak bisa dimanipulasi dari body
    return this.paymentService.createTransaction({
      plan:          body.plan          as 'pro' | 'business',
      billingCycle:  body.billingCycle  as 'monthly' | 'yearly',
      userId:        req.user.id,
      customerName:  body.customerName  ?? req.user.name  ?? 'Pengguna',
      customerEmail: body.customerEmail ?? req.user.email ?? '',
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() notification: any) {
    return this.paymentService.handleWebhook(notification);
  }

  /** Endpoint simulasi */
  @Post('simulate/:orderId/:result')
  async simulate(
    @Param('orderId') orderId: string,
    @Param('result') result: 'success' | 'pending' | 'failed',
  ) {
    return this.paymentService.simulatePayment(orderId, result);
  }

  @Get('status/:orderId')
  async getStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getHistory(@Request() req: any) {
    return this.paymentService.getPaymentHistory(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user-plan')
  async getUserPlan(@Request() req: any) {
    return this.paymentService.getUserPlan(req.user.id);
  }

  /** Legacy endpoints — tetap support path param untuk backward compat */
  @Get('history/:userId')
  async getHistoryById(@Param('userId') userId: string) {
    return this.paymentService.getPaymentHistory(Number(userId));
  }

  @Get('user-plan/:userId')
  async getUserPlanById(@Param('userId') userId: string) {
    return this.paymentService.getUserPlan(Number(userId));
  }
}
