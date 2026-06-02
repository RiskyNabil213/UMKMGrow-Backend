/* eslint-disable @typescript-eslint/no-require-imports */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as path from 'path';

const { PrismaClient }        = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

let sharedClient: any = null;

function getClient(): any {
  if (!sharedClient) {
    const dbPath  = path.join(process.cwd(), 'src', 'prisma', 'dev.db');
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    sharedClient  = new PrismaClient({ adapter });
  }
  return sharedClient;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: any;

  get user()        { return this.client.user; }
  get transaction() { return this.client.transaction; }
  get chat()        { return this.client.chat; }
  get payment()     { return this.client.payment; }
  get lowongan()    { return this.client.lowongan; }
  get supplier()    { return this.client.supplier; }

  constructor() {
    this.client = getClient();
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    sharedClient = null;
  }
}
