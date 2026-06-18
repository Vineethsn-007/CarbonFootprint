const express = require('express');
const request = require('supertest');

// Mock the firebase admin service before importing the router
jest.mock('../services/firebaseAdmin', () => {
  const mockQuery = {
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({ title: 'Test Article', category: 'Energy', publishedAt: '2023-01-01' })
        }
      ],
      size: 1
    })
  };
  
  return {
    db: {
      collection: jest.fn(() => mockQuery)
    }
  };
});

const educationRouter = require('./education');

const app = express();
app.use(express.json());
app.use('/api/education', educationRouter);

describe('Education API Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/education', () => {
    it('should fetch paginated articles successfully', async () => {
      const res = await request(app).get('/api/education');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('articles');
      expect(res.body.articles).toBeInstanceOf(Array);
      expect(res.body.articles).toHaveLength(1);
      expect(res.body.articles[0]).toHaveProperty('title', 'Test Article');
      expect(res.body).toHaveProperty('count', 1);
    });

    it('should handle category filters', async () => {
      const res = await request(app).get('/api/education?category=Energy');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.articles[0]).toHaveProperty('category', 'Energy');
    });
  });
});
