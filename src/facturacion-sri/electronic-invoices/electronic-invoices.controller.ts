import { ConfigService } from '@nestjs/config';
import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignService } from 'src/services/sign/sign.service';
import { InvoiceGenerationService } from 'src/services/invoice-generation/invoice-generation.service';
import { GenerateAccessKey, generateAccessKey } from 'src/utils/Utils';
import * as xml2js from 'xml2js';

@Controller('electronic-invoice')
export class ElectronicInvoicesController {
    private sriReceptionUrl = this.configService.get<string>(
        'SRI_RECEPTION_URL_TEST',
    );
    private sriAuthorizationUrl = this.configService.get<string>(
        'SRI_AUTHORIZATION_URL_TEST',
    );

    constructor(private configService: ConfigService,
        private readonly singService : SignService,
        private readonly invoiceService: InvoiceGenerationService
    ) { }

    @Get()
    saludar(): string {
        return 'HI, this is a get method from nest js';
    }

    @Post()
    @UseInterceptors(FileInterceptor('invoice'))
    async SignAndSendInvoice(@UploadedFile() file: Express.Multer.File): Promise<any> {
        if (!file) {
            throw new Error('Error. Revisar el archivo subido.');
        }
        try {
            // Leer el contenido del archivo XML - PRUEBA. BORRAR PARA PRODUCCION
            const xmlContent = file.buffer.toString();
            console.log('Contenido del XML:', xmlContent);

            //Parsear XML o objeto JSON
            const parser = new xml2js.Parser({ explicitArray: false });
            const parsedXML = await parser.parseStringPromise(xmlContent);
            const builder = new xml2js.Builder({
                xmldec: { version: '1.0', encoding: 'UTF-8' },
            });
            const jsonInvoice = JSON.stringify(parsedXML, null, 2);
            console.log(
                'factura JSON parseada: ' + JSON.stringify(parsedXML, null, 2),
            );

            //EXTRAER DATOS PARA LA ACCESKEY
            const factura = parsedXML.factura;
            const infoTributaria = factura.infoTributaria;
            const infoFactura = factura.infoFactura;

            //GENERAR CLAVE DE ACCESO
            const accessKeyData: GenerateAccessKey = {
                date: this.parseDate(infoFactura.fechaEmision), // Convertir fecha a Date
                codDoc: infoTributaria.codDoc as
                    | '01'
                    | '03'
                    | '04'
                    | '05'
                    | '06'
                    | '07',
                ruc: infoTributaria.ruc,
                environment: infoTributaria.ambiente as '1' | '2',
                establishment: infoTributaria.estab,
                emissionPoint: infoTributaria.ptoEmi,
                sequential: infoTributaria.secuencial,
            };

            const accesKey = generateAccessKey(accessKeyData);

            //AGREGAR CLAVE DE ACCESO A LA FACTURA
            factura.infoTributaria.claveAcceso = accesKey;
            const updateInvoice = builder.buildObject(parsedXML);
            console.log('Factura con nuevo accesKey: ' + updateInvoice);

            //FIRMAR FACTURA
            const signature: ArrayBuffer =
                await this.singService.getP12FromLocalFile('firmajunta.p12');
            const password: string = 'JoseMa2024';
            const signedInvoice = await this.singService.signXml(
                signature,
                password,
                updateInvoice,
            );

            const reception = await this.invoiceService.documentReception(
                signedInvoice,
                this.sriReceptionUrl,
            );

            const authorization = await this.invoiceService.documentAuthorization(
                accesKey,
                this.sriAuthorizationUrl,
            );

            return `${JSON.stringify(reception)}\n\n${JSON.stringify(authorization)}\n`;
        } catch (error) {
            throw new Error(error);
        }
    }

    // Convertir fecha en formato dd/MM/yyyy a un objeto Date
    private parseDate(dateString: string): Date {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
}
