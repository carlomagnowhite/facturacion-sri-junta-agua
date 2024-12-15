import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceGenerationService } from './invoice-generation.service';

describe('InvoiceGenerationService', () => {
  let service: InvoiceGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceGenerationService],
    }).compile();

    service = module.get<InvoiceGenerationService>(InvoiceGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
