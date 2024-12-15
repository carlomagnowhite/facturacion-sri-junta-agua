import { Injectable } from '@nestjs/common';
import { create } from "xmlbuilder2";
import { createClient, Client } from 'soap';
import { Invoice, InvoiceInput } from 'src/interfaces/invoice.interface';
import { generateAccessKey } from 'src/utils/Utils';

@Injectable()
export class InvoiceGenerationService {

    async authorizeInvoice(accessKey: string, authorizationUrl: string) {
        let params = { claveAccesoComprobante: accessKey };
        let authorizationResponse: any;

        const authorizationRequest = new Promise((resolve, reject) => {
            createClient(authorizationUrl, (err: any, client: Client) => {
                client.autorizacionComprobante(params, (err: any, result: unknown) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });

        authorizationResponse = await authorizationRequest;

        return authorizationResponse;
    }


    generateInvoiceXml(invoice: Invoice) {
        const document = create({ version: '1.0', encoding: 'UTF-8' }, invoice);
        const xml = document.end({ prettyPrint: true });
        return xml;
    }

    async genereteInvoice(invoiceData: InvoiceInput) {
        const [day, month, year] = invoiceData.infoFactura.fechaEmision.split('/');
        const formattedDateStr = `${year}-${month}-${day}`;
        const date = new Date(formattedDateStr);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
        const accessKey = generateAccessKey({
            date: date,
            codDoc: invoiceData.infoTributaria.codDoc,
            ruc: invoiceData.infoTributaria.ruc,
            environment: invoiceData.infoTributaria.ambiente,
            establishment: invoiceData.infoTributaria.estab,
            emissionPoint: invoiceData.infoTributaria.ptoEmi,
            sequential: invoiceData.infoTributaria.secuencial,
        });

        const {
            ambiente,
            tipoEmision,
            razonSocial,
            nombreComercial,
            ruc,
            codDoc,
            estab,
            ptoEmi,
            secuencial,
            dirMatriz
        } = invoiceData.infoTributaria;

        const infoTributaria = {
            ambiente,
            tipoEmision,
            razonSocial,
            nombreComercial,
            ruc,
            claveAcceso: accessKey,  // Asegurarse de que claveAcceso esté después de ruc
            codDoc,
            estab,
            ptoEmi,
            secuencial,
            dirMatriz,
        };

        const invoice: Invoice = {
            factura: {
                "@id": "comprobante",
                "@version": "1.1.0",

                infoTributaria: infoTributaria,
                infoFactura: invoiceData.infoFactura,
                detalles: invoiceData.detalles,
            },
        };

        return { invoice, accessKey };
    }

    async documentReception(
        stringXML: string,
        receptionUrl: string
    ): Promise<any> {
        const base64XML = Buffer.from(stringXML).toString("base64");
        let params = { xml: base64XML };

        let receptionResult: any;

        const receptionRequest = new Promise((resolve, reject) => {
            createClient(receptionUrl, (err, client: Client) => {
                if (err) {
                    reject(err);
                    return;
                }
                client.validarComprobante(params, (err: any, result: unknown) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });

        receptionResult = await receptionRequest;
        return receptionResult;
    }

    async documentAuthorization(
        accesKey: string,
        authorizationUrl: string
    ) {
        let params = { claveAccesoComprobante: accesKey };

        let authorizationResponse: any;

        const authorizationRequest = new Promise((resolve, reject) => {
            createClient(authorizationUrl, (err: any, client: Client) => {
                client.autorizacionComprobante(params, (err: any, result: unknown) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });

        authorizationResponse = await authorizationRequest;

        return authorizationResponse;
    }

}
