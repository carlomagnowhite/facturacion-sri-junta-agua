import { Test, TestingModule } from '@nestjs/testing';
import { ElectronicInvoicesController } from './electronic-invoices.controller';

describe('ElectronicInvoicesController', () => {
  let controller: ElectronicInvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectronicInvoicesController],
    }).compile();

    controller = module.get<ElectronicInvoicesController>(ElectronicInvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
