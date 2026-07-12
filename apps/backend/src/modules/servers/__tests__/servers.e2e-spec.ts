import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Servers (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/servers (GET)', () => {
    it('should return list of servers', () => {
      return request(app.getHttpServer())
        .get('/api/servers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter by country', () => {
      return request(app.getHttpServer())
        .get('/api/servers?country=Germany')
        .expect(200);
    });
  });

  describe('/api/servers/countries (GET)', () => {
    it('should return countries', () => {
      return request(app.getHttpServer())
        .get('/api/servers/countries')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/servers/:id (GET)', () => {
    it('should return 404 for nonexistent server', () => {
      return request(app.getHttpServer())
        .get('/api/servers/nonexistent')
        .expect(404);
    });
  });
});
