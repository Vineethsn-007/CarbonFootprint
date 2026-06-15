import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../index'

// Mock Firebase Admin modular API
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn().mockReturnValue([]),
  cert: vi.fn(),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@test.com' }),
  }),
}))

const mockDb = {
  collection: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  add: vi.fn().mockResolvedValue({ id: 'new-doc-id' }),
  get: vi.fn().mockResolvedValue({
    size: 1,
    docs: [
      { id: 'doc1', data: () => ({ userId: 'test-uid', totalKgCO2: 320, transportation: 120, energy: 80, food: 50, shopping: 50, waste: 20 }) },
    ],
  }),
  doc: vi.fn().mockReturnThis(),
  update: vi.fn().mockResolvedValue({}),
}

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => mockDb,
}))

const VALID_TOKEN = 'Bearer valid-test-token'

describe('Carbon API Routes', () => {
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })

  describe('POST /api/carbon/calculate', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/carbon/calculate')
        .send({ totalKgCO2: 320 })
      expect(res.status).toBe(401)
    })

    it('returns 400 for invalid totalKgCO2', async () => {
      const res = await request(app)
        .post('/api/carbon/calculate')
        .set('Authorization', VALID_TOKEN)
        .send({ totalKgCO2: -100 })
      expect(res.status).toBe(400)
    })

    it('returns 201 for valid emission data', async () => {
      const res = await request(app)
        .post('/api/carbon/calculate')
        .set('Authorization', VALID_TOKEN)
        .send({
          totalKgCO2: 320,
          transportation: 120,
          energy: 80,
          food: 50,
          shopping: 50,
          waste: 20,
        })
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('new-doc-id')
    })
  })

  describe('GET /api/carbon/history', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/carbon/history')
      expect(res.status).toBe(401)
    })

    it('returns emission history with valid token', async () => {
      const res = await request(app)
        .get('/api/carbon/history')
        .set('Authorization', VALID_TOKEN)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('emissions')
      expect(Array.isArray(res.body.emissions)).toBe(true)
    })
  })

  describe('GET /api/carbon/summary', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/carbon/summary')
      expect(res.status).toBe(401)
    })

    it('returns monthly summary with valid token', async () => {
      const res = await request(app)
        .get('/api/carbon/summary')
        .set('Authorization', VALID_TOKEN)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('monthTotal')
    })
  })

  describe('GET /api/leaderboard', () => {
    it('returns leaderboard with valid token', async () => {
      const res = await request(app)
        .get('/api/leaderboard')
        .set('Authorization', VALID_TOKEN)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('leaders')
    })
  })
})

describe('Goals API Routes', () => {
  describe('POST /api/goals', () => {
    it('returns 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', VALID_TOKEN)
        .send({ targetValue: 10, unit: 'times' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/title/i)
    })

    it('creates a goal with valid data', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', VALID_TOKEN)
        .send({ title: 'Cycle 3x/week', targetValue: 12, unit: 'trips' })
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('new-doc-id')
    })
  })
})
