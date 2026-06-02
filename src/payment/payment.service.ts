import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MidtransClient = require('midtrans-client');

const PLAN_PRICES: Record<string, Record<string, number>> = {
  pro:      { monthly: 99_000,  yearly: 990_000  },
  business: { monthly: 249_000, yearly: 2_490_000 },
};

const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  yearly:  365,
};

function isKeyConfigured(key: string | undefined): boolean {
  return !!key && !key.includes('GANTI') && !key.includes('XXXXXXXX') && key.length > 10;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private snap: any;
  private coreApi: any;

  constructor(private prisma: PrismaService) {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const serverKey    = process.env.MIDTRANS_SERVER_KEY ?? '';
    const clientKey    = process.env.MIDTRANS_CLIENT_KEY ?? '';
    this.snap    = new MidtransClient.Snap({ isProduction, serverKey, clientKey });
    this.coreApi = new MidtransClient.CoreApi({ isProduction, serverKey, clientKey });
  }

  private get isSimulation(): boolean {
    return !isKeyConfigured(process.env.MIDTRANS_SERVER_KEY);
  }

  // ─── Buat Transaksi ───────────────────────────────────────────────────────

  async createTransaction(dto: CreatePaymentDto) {
    const { userId, customerName, customerEmail } = dto;

    // Normalisasi — tolerate case dan whitespace, fallback ke default
    const plan         = ((dto.plan         ?? '').toLowerCase().trim() || 'pro')      as 'pro' | 'business';
    const billingCycle = ((dto.billingCycle  ?? '').toLowerCase().trim() || 'monthly') as 'monthly' | 'yearly';

    this.logger.log(`createTransaction: plan="${plan}" billingCycle="${billingCycle}" userId=${userId} (type: ${typeof userId})`);

    // Validasi userId
    const userIdNum = Number(userId);
    if (!userId || isNaN(userIdNum) || userIdNum <= 0) {
      throw new BadRequestException('User tidak valid. Silakan login ulang dan coba lagi.');
    }

    const validPlans  = ['pro', 'business'];
    const validCycles = ['monthly', 'yearly'];

    if (!validPlans.includes(plan)) {
      throw new BadRequestException(
        `Paket tidak valid: "${plan}". Pilihan tersedia: pro, business`,
      );
    }
    if (!validCycles.includes(billingCycle)) {
      throw new BadRequestException(
        `Siklus billing tidak valid: "${billingCycle}". Pilihan tersedia: monthly, yearly`,
      );
    }

    if (!PLAN_PRICES[plan]?.[billingCycle]) {
      throw new BadRequestException('Kombinasi paket dan siklus billing tidak tersedia');
    }

    const amount      = PLAN_PRICES[plan][billingCycle];
    const orderId     = `UMKM-${Date.now()}-${userIdNum}`;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const payment = await this.prisma.payment.create({
      data: { orderId, userId: userIdNum, plan, billingCycle, amount, status: 'pending' },
    });

    // ── Mode Simulasi ──────────────────────────────────────────────────────
    if (this.isSimulation) {
      this.logger.warn(`[SIMULASI] Transaksi ${orderId} | Rp ${amount}`);
      const simulateUrl = `${frontendUrl}/payment/simulate?order_id=${orderId}&plan=${plan}&billing=${billingCycle}&amount=${amount}`;
      await this.prisma.payment.update({
        where: { id: payment.id },
        data:  { snapToken: 'SIMULATION', snapRedirectUrl: simulateUrl },
      });
      return { orderId, snapToken: null, snapRedirectUrl: simulateUrl, amount, simulation: true };
    }

    // ── Mode Midtrans Real ─────────────────────────────────────────────────
    let snapResult: { token: string; redirect_url: string };
    try {
      snapResult = await this.snap.createTransaction({
        transaction_details: { order_id: orderId, gross_amount: amount },
        customer_details:    { first_name: customerName, email: customerEmail },
        item_details: [{
          id:       `${plan}-${billingCycle}`,
          price:    amount,
          quantity: 1,
          name:     `UMKM Grow+ ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'})`,
        }],
        callbacks: {
          finish:  `${frontendUrl}/payment/success?order_id=${orderId}`,
          error:   `${frontendUrl}/payment/failed?order_id=${orderId}`,
          pending: `${frontendUrl}/payment/pending?order_id=${orderId}`,
        },
      });
    } catch (err: any) {
      this.logger.error('Midtrans error:', err?.message ?? err);
      await this.prisma.payment.delete({ where: { id: payment.id } });
      throw new BadRequestException(
        err?.ApiResponse?.error_messages?.[0] ?? err?.message ?? 'Gagal membuat transaksi',
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data:  { snapToken: snapResult.token, snapRedirectUrl: snapResult.redirect_url },
    });

    this.logger.log(`Transaction created: ${orderId} | Rp ${amount}`);
    return { orderId, snapToken: snapResult.token, snapRedirectUrl: snapResult.redirect_url, amount, simulation: false };
  }

  // ─── Simulasi Manual ─────────────────────────────────────────────────────

  async simulatePayment(orderId: string, result: 'success' | 'pending' | 'failed') {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new BadRequestException('Order tidak ditemukan');

    const newStatus = result === 'success' ? 'paid' : result === 'pending' ? 'pending' : 'failed';

    await this.prisma.payment.update({
      where: { orderId },
      data:  { status: newStatus, paidAt: newStatus === 'paid' ? new Date() : null },
    });

    if (newStatus === 'paid') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (PLAN_DURATION_DAYS[payment.billingCycle] ?? 30));
      await this.prisma.user.update({
        where: { id: payment.userId },
        data:  { plan: payment.plan, planExpiresAt: expiresAt },
      });
      this.logger.log(`[SIMULASI] User ${payment.userId} upgraded → ${payment.plan}`);
    }

    return { orderId, status: newStatus };
  }

  // ─── Webhook ─────────────────────────────────────────────────────────────

  async handleWebhook(notification: any) {
    const orderId = notification.order_id;
    this.logger.log(`Webhook: ${orderId} → ${notification.transaction_status}`);

    let verified: any = notification;
    try {
      verified = await this.coreApi.transaction.notification(notification);
    } catch (err: any) {
      this.logger.warn('Webhook verify failed:', err?.message);
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: verified.order_id ?? orderId },
    });
    if (!payment) return { message: 'Payment not found' };

    const txStatus    = verified.transaction_status ?? notification.transaction_status;
    const fraudStatus = verified.fraud_status ?? notification.fraud_status;

    let newStatus = payment.status;
    if      (txStatus === 'capture')    newStatus = fraudStatus === 'accept' ? 'paid' : 'failed';
    else if (txStatus === 'settlement') newStatus = 'paid';
    else if (['cancel','deny','failure'].includes(txStatus)) newStatus = 'failed';
    else if (txStatus === 'expire')     newStatus = 'expired';
    else if (txStatus === 'pending')    newStatus = 'pending';

    await this.prisma.payment.update({
      where: { orderId: payment.orderId },
      data: {
        status:          newStatus,
        midtransOrderId: verified.transaction_id ?? null,
        paidAt:          newStatus === 'paid' ? new Date() : null,
      },
    });

    if (newStatus === 'paid') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (PLAN_DURATION_DAYS[payment.billingCycle] ?? 30));
      await this.prisma.user.update({
        where: { id: payment.userId },
        data:  { plan: payment.plan, planExpiresAt: expiresAt },
      });
    }

    return { message: 'OK', status: newStatus };
  }

  // ─── Status & Riwayat ─────────────────────────────────────────────────────

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where:  { orderId },
      select: { orderId: true, plan: true, billingCycle: true, amount: true, status: true, paidAt: true, createdAt: true },
    });
    if (!payment) throw new BadRequestException('Order tidak ditemukan');
    return payment;
  }

  async getPaymentHistory(userId: number) {
    return this.prisma.payment.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      select:  { orderId: true, plan: true, billingCycle: true, amount: true, status: true, paidAt: true, createdAt: true },
    });
  }

  // ─── Info User (plan aktif) ───────────────────────────────────────────────

  async getUserPlan(userId: number) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: { plan: true, planExpiresAt: true },
    });
    if (!user) return { plan: 'free', planExpiresAt: null, isPremium: false };

    // Cek apakah plan masih aktif
    const isExpired = user.planExpiresAt ? new Date(user.planExpiresAt) < new Date() : false;
    const isPremium = user.plan !== 'free' && !isExpired;

    // Kalau expired, reset ke free
    if (isExpired && user.plan !== 'free') {
      await this.prisma.user.update({
        where: { id: userId },
        data:  { plan: 'free', planExpiresAt: null },
      });
      return { plan: 'free', planExpiresAt: null, isPremium: false };
    }

    return { plan: user.plan, planExpiresAt: user.planExpiresAt, isPremium };
  }
}
