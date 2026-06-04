import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PropertyService } from '../src/application/property/property.service';
import { ListingProvider } from '../src/domain/property/enums/listing-provider.enum';

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe('Properties (e2e)', () => {
  let app: INestApplication<App>;
  let propertyService: PropertyService;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
      ],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    propertyService = app.get(PropertyService);
    await propertyService.runListingSync(ListingProvider.Shaety);
  }, 60000);

  afterAll(async () => {
    if (!hasDatabase || !app) {
      return;
    }
    await app.close();
  });

  it('GET /properties returns page 1 for guests', async () => {
    if (!hasDatabase) {
      return;
    }
    const res = await request(app.getHttpServer())
      .get('/api/v1/properties')
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /properties?page=2 without auth returns 401', async () => {
    if (!hasDatabase) {
      return;
    }
    await request(app.getHttpServer())
      .get('/api/v1/properties?page=2')
      .expect(401);
  });

  it('GET /properties/:id returns detail', async () => {
    if (!hasDatabase) {
      return;
    }
    const list = await request(app.getHttpServer())
      .get('/api/v1/properties')
      .expect(200);

    const id = list.body.data[0].id as string;
    const detail = await request(app.getHttpServer())
      .get(`/api/v1/properties/${id}`)
      .expect(200);

    expect(detail.body.data.id).toBe(id);
    expect(detail.body.data.title).toBeDefined();
  });
});
