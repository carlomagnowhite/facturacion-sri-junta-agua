import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacturacionSriModule } from './facturacion-sri/facturacion-sri.module';
import { SignService } from './services/sign/sign.service';
import { InvoiceGenerationService } from './services/invoice-generation/invoice-generation.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FacturacionSriModule
    // ... otros módulos
  ],
  controllers: [AppController],
  providers: [AppService, SignService, ConfigService, InvoiceGenerationService],
})
export class AppModule {}
