import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test-payments@example.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      });
    authToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/payments (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/payments')
        .expect(401);
    });

    it('should return user payments', () => {
      return request(app.getHttpServer())
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/payments/checkout (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({ planId: 'plan-1' })
        .expect(401);
    });
  });

  describe('/api/payments/webhook/stripe (POST)', () => {
    it('should accept webhook', () => {
      return request(app.getHttpServer())
        .post('/api/payments/webhook/stripe')
        .send({ type: 'checkout.session.completed', data: {} })
        .expect(200)
        .expect((res) => {
          expect(res.body.received).toBe(true);
        });
    });
  });
});
