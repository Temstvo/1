import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Coupons (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

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
        email: 'admin-coupons@example.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User',
      });
    adminToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/coupons (GET)', () => {
    it('should require admin role', () => {
      return request(app.getHttpServer())
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });
  });

  describe('/api/coupons/validate (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/coupons/validate')
        .send({ code: 'TEST' })
        .expect(401);
    });

    it('should validate coupon', () => {
      return request(app.getHttpServer())
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'INVALID' })
        .expect(404);
    });
  });
});
