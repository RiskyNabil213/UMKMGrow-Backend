export class CreatePaymentDto {
  plan: 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
  // Simulasi user — nanti diganti dengan JWT guard
  userId: number;
  customerName: string;
  customerEmail: string;
}
