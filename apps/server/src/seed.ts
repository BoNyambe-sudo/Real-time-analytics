import { createHash } from 'node:crypto';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from root directory
config({ path: join(__dirname, '..', '..', '..', '.env') });

import { UserModel } from './schemas/user.schema.js';
import { OrganizationModel } from './schemas/organization.schema.js';
import { EventLogModel } from './schemas/event-log.schema.js';
import { MetricModel } from './schemas/metric.schema.js';
import { ApiKeyModel } from './schemas/api-key.schema.js';

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

const LEVELS = ['info', 'warn', 'error'] as const;
const PATHS = [
  '/api/users',
  '/api/orders',
  '/api/products',
  '/api/auth',
  '/api/dashboard',
  '/api/settings',
];
const STATUSES = [200, 200, 200, 201, 400, 401, 404, 500];

async function seed() {
  const mongoose = await import('mongoose');

  const uri = process.env.MONGODB_URI!;
  await mongoose.default.connect(uri);
  console.log('MongoDB connected for seeding');

  // Organization
  let org = await OrganizationModel.findOne({ slug: 'acme' }).lean();
  if (!org) {
    org = await OrganizationModel.create({ name: 'Acme Corp', slug: 'acme' });
    console.log('Created organization: Acme Corp');
  }

  // Admin user
  let admin = await UserModel.findOne({ email: process.env.SEED_ADMIN_EMAIL }).lean();
  if (!admin) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 12);
    admin = await UserModel.create({
      name: 'Admin User',
      email: process.env.SEED_ADMIN_EMAIL!,
      passwordHash,
      orgId: org._id,
      role: 'admin',
    });
    console.log('Created admin user:', process.env.SEED_ADMIN_EMAIL);
  }

  // API Key for load testing
  let apiKey = await ApiKeyModel.findOne({ orgId: org._id, name: 'loadtest' }).lean();
  if (!apiKey) {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const prefix = key.slice(0, 8);
    const hash = sha256(key);
    apiKey = await ApiKeyModel.create({ orgId: org._id, name: 'loadtest', prefix, hash });
    console.log('Created loadtest API key:', key);
  }

  // BFF API Key for server-to-server communication
  let bffApiKey = await ApiKeyModel.findOne({ orgId: org._id, name: 'bff' }).lean();
  if (!bffApiKey) {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const prefix = key.slice(0, 8);
    const hash = sha256(key);
    bffApiKey = await ApiKeyModel.create({ orgId: org._id, name: 'bff', prefix, hash });
    console.log('Created BFF API key:', key);
    console.log('Add to .env: BFF_API_KEY=' + key);
  }

  // EventLog - 10k+ rows
  const eventLogCount = await EventLogModel.countDocuments({ orgId: org._id });
  if (eventLogCount < 10000) {
    const batchSize = 1000;
    const totalToCreate = 10000 - eventLogCount;
    const batches = Math.ceil(totalToCreate / batchSize);

    for (let b = 0; b < batches; b++) {
      const batchDocs = Array.from({ length: batchSize }, () => ({
        orgId: org._id,
        ts: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
        message: `Log message ${Math.random().toString(36).slice(2)}`,
        path: PATHS[Math.floor(Math.random() * PATHS.length)],
        statusCode: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        latencyMs: Math.floor(Math.random() * 500) + 10,
        meta: { requestId: crypto.randomUUID() },
      }));
      await EventLogModel.insertMany(batchDocs);
      console.log(`Seeded ${Math.min((b + 1) * batchSize, totalToCreate)} event logs`);
    }
  }

  // Metric - 24h at 1-min intervals
  const metricCount = await MetricModel.countDocuments({ orgId: org._id });
  if (metricCount < 1440) {
    const docs = [];
    const now = new Date();
    let activeUsers = 1000;
    let requestsPerSec = 200;
    let revenue = 5000;
    let errorRate = 2;
    let latencyMs = 60;

    for (let i = 1439; i >= 0; i--) {
      const ts = new Date(now.getTime() - i * 60 * 1000);
      activeUsers = Math.max(100, Math.round(activeUsers * (1 + (Math.random() - 0.5) * 0.1)));
      requestsPerSec = Math.max(
        50,
        Math.round(requestsPerSec * (1 + (Math.random() - 0.5) * 0.15))
      );
      revenue = Math.max(
        1000,
        Math.round(revenue * (1 + (Math.random() - 0.5) * 0.05) * 100) / 100
      );
      errorRate = Math.min(100, Math.max(0, errorRate * (1 + (Math.random() - 0.5) * 0.3)));
      latencyMs = Math.max(10, Math.round(latencyMs * (1 + (Math.random() - 0.5) * 0.2)));

      docs.push({ orgId: org._id, ts, activeUsers, requestsPerSec, revenue, errorRate, latencyMs });
    }
    await MetricModel.insertMany(docs);
    console.log('Seeded 1440 metrics (24h at 1-min intervals)');
  }

  console.log('Seeding complete');
  await mongoose.default.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
