import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FacturacionSriModule } from './facturacion-sri/facturacion-sri.module';
import { BasicAuthGuard } from './guards/basic-auth/basic-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
