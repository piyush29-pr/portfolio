import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma'; // Assuming this exports the prisma client

describe('Smoke Tests', () => {
  beforeAll(async () => {
    // Optional: setup or wait for DB if needed
  });

  afterAll(async () => {
    // Optional: teardown DB connections
    // await prisma.$disconnect(); // Example if using prisma
  });

  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/projects should return an array', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Protected route should return 401 without token', async () => {
    const res = await request(app).get('/api/admin/projects');
    expect(res.status).toBe(401);
  });
});
