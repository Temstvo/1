# APPI VPN - Testing Guide

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm -r run test

# Run tests for specific module
pnpm --filter @appi/backend run test -- --testPathPattern=servers
```

### E2E Tests
```bash
# Run E2E tests (requires running database)
pnpm --filter @appi/backend run test:e2e
```

### Load Tests
```bash
# Install artillery
cd apps/backend/load-test && pnpm install

# Run load test
pnpm run test:load

# Run stress test
pnpm run test:stress
```

## Test Structure

### Unit Tests
- Located in `__tests__` directories within each module
- Named `*.service.spec.ts` for service tests
- Mock external dependencies (Prisma, Redis, etc.)
- Test business logic in isolation

### E2E Tests
- Located in `__tests__` directories
- Named `*.e2e-spec.ts`
- Use real HTTP requests
- Test full request/response cycle
- Require running application

## Writing Tests

### Service Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from '../my.service';
import { PrismaService } from '../../../database/prisma.service';

describe('MyService', () => {
  let service: MyService;
  let prisma: { myModel: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { myModel: { findMany: jest.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return items', async () => {
      prisma.myModel.findMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
```

### E2E Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('MyEndpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('/GET should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/my-endpoint')
      .expect(200);
  });
});
```

## Coverage

Generate coverage report:
```bash
pnpm --filter @appi/backend run test:cov
```

Coverage reports are generated in `apps/backend/coverage/`.

## CI Integration

Tests run automatically in CI:
1. Lint check
2. Type check
3. Unit tests
4. E2E tests
5. Build verification
