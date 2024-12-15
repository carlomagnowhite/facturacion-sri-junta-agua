

import { additionalInfo, AdditionalInfo } from "./additional-info.interface";
import { details, Details } from "./details.interface";
import { invoiceInfo, InvoiceInfo } from "./invoice-info.interface";
import { reimbursements, Reimbursements } from "./reimbursaments.interface";
import { remisionGuideSustitutiveInfo, RemisionGuideSustitutiveInfo } from "./remission-guides-sustitutive-info.interface";
import { retentions, Retentions } from "./retentions.interface";
import { taxInfo, TaxInfo } from "./tax-info.interface";
import { OtherThirdPartValues, otherThirdPartValues } from "./third-part-values.interface";

export type Invoice = {
  factura: {
    "@xmlns:ds"?: string;
    "@xmlns:xsi"?: string;
    "@id": string;
    "@version": string;
    infoTributaria: TaxInfo;
    infoFactura: InvoiceInfo;
    detalles: Details;
    reembolsos?: Reimbursements;
    retenciones?: Retentions;
    infoSustitutivaGuiaRemision?: RemisionGuideSustitutiveInfo;
    otrosRubrosTerceros?: OtherThirdPartValues;
    tipoNegociable?: {
      correo: string;
    };
    maquinaFiscal?: {
      marca: string;
      modelo: string;
      serie: string;
    };
    infoAdicional?: AdditionalInfo;
  };
};

export type InvoiceInput = {
  infoTributaria: Omit<TaxInfo, "claveAcceso">;
  infoFactura: InvoiceInfo;
  detalles: Details;
  reembolsos?: Reimbursements;
  retenciones?: Retentions;
  infoSustitutivaGuiaRemision?: RemisionGuideSustitutiveInfo;
  otrosRubrosTerceros?: OtherThirdPartValues;
  tipoNegociable?: {
    correo: string;
  };
  maquinaFiscal?: {
    marca: string;
    modelo: string;
    serie: string;
  };
  infoAdicional?: AdditionalInfo;
};

export const invoice = {
  factura: {
    "@xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "@id": "comprobante",
    "@version": "version0",
    infoTributaria: taxInfo,
    infoFactura: invoiceInfo,
    detalles: details,
    reembolsos: reimbursements,
    retenciones: retentions,
    infoSustitutivaGuiaRemision: remisionGuideSustitutiveInfo,
    otrosRubrosTerceros: otherThirdPartValues,
    tipoNegociable: {
      correo: "correo0",
    },
    maquinaFiscal: {
      marca: "marca0",
      modelo: "modelo0",
      serie: "serie0",
    },
    infoAdicional: additionalInfo,
  },
};
