import { Module } from '@nestjs/common';
import { ElectronicInvoicesController } from './electronic-invoices/electronic-invoices.controller';
import { SignService } from 'src/services/sign/sign.service';
import { InvoiceGenerationService } from 'src/services/invoice-generation/invoice-generation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    // otros imports...
  ],
  controllers: [ElectronicInvoicesController],
  providers: [SignService, InvoiceGenerationService]
})
export class FacturacionSriModule {}
