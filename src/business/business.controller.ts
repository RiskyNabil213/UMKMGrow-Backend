import { Controller, Get, Query } from '@nestjs/common';

@Controller('business-recommendations')
export class BusinessController {
  @Get()
  getRecommendations(@Query('budget') budget: string) {
    const items = [
      { name: 'Usaha Kopi Take Away', modal: 8000000, laba: 2100000, category: 'Minuman' },
      { name: 'Jualan Snack Online', modal: 5000000, laba: 1500000, category: 'Makanan' },
      { name: 'Laundry Kiloan', modal: 9000000, laba: 2300000, category: 'Jasa' },
    ];
    const userBudget = Number(budget) || 15000000;
    const filtered = items.filter(item => item.modal <= userBudget);

    return {
      message: 'Rekomendasi usaha berhasil disaring',
      data: filtered,
    };
  }
}
