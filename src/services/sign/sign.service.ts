
import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { signInvoiceXml } from "ec-sri-invoice-signer";
import * as forge from 'node-forge';


@Injectable()
export class SignService {

    verifyP12(p12Data: ArrayBuffer, p12Password: string): boolean {
        try {
            const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(p12Data));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12Password);

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const pkcs8Bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

            if (certBags[forge.pki.oids.certBag] && pkcs8Bags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
                // Verificar que hay al menos un certificado y una clave
                return true;
            }
        } catch (error) {
            console.error('Error verificando el archivo .p12:', error);
        }

        return false;
    }

    getP12FromLocalFile(path: string) {
        const file = readFileSync(path);
        const buffer = file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength
        );
        return buffer;
    }

    async getP12FromUrl(url: string) {
        const file = await fetch(url)
            .then((response) => response.arrayBuffer())
            .then((data) => data);
        return file;
    }

    getXMLFromLocalFile(path: string) {
        const file = readFileSync(path, "utf8");
        return file;
    }

    async getXMLFromLocalUrl(url: string) {
        const file = await fetch(url)
            .then((response) => response.text())
            .then((data) => data);
        return file;
    }

    sha1Base64(text: string, encoding: forge.Encoding = "utf8") {
        let md = forge.md.sha1.create();
        md.update(text, encoding);
        const hash = md.digest().toHex();
        const buffer = Buffer.from(hash, "hex");
        const base64 = buffer.toString("base64");
        return base64;
    }

    hexToBase64(hex: string) {
        hex = hex.padStart(hex.length + (hex.length % 2), "0");
        const bytes = hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16));
        return btoa(String.fromCharCode(...bytes));
    }

    bigIntToBase64(bigInt: number) {
        const hex = bigInt.toString(16);
        const hexPairs = hex.match(/\w{2}/g);
        const bytes = hexPairs!.map((pair) => parseInt(pair, 16));
        const byteString = String.fromCharCode(...bytes);
        const base64 = btoa(byteString);
        const formatedBase64 = base64.match(/.{1,76}/g)!.join("\n");
        return formatedBase64;
    }

    getRandomNumber(min = 990, max = 9999) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async signXml(
        p12Data: ArrayBuffer,
        p12Password: string,
        xmlData: string
    ) {
        const arrayBuffer = p12Data;
        let xml = xmlData;
        xml = xml.replace(/\s+/g, " ");
        xml = xml.trim();
        xml = xml.replace(/(?<=\>)(\r?\n)|(\r?\n)(?=\<\/)/g, "");
        xml = xml.trim();
        xml = xml.replace(/(?<=\>)(\s*)/g, "");
        const firstLineEndIndex = xml.indexOf("\n");

        if (firstLineEndIndex !== -1) {
            // Extraer la primera línea del XML
            let firstLine = xml.substring(0, firstLineEndIndex).trim();

            // Reemplazar solo si la primera línea no está vacía
            if (firstLine.length > 0) {
                // Reemplazar la primera línea por una nueva línea especificando UTF-8
                const newFirstLine = `<?xml version="1.0" encoding="UTF-8"?>`;
                xml = `${newFirstLine}\n${xml.substring(firstLineEndIndex + 1).trim()}`;
            }
        }
        writeFileSync('invoice.xml', xml);
        const p12FileData = readFileSync('firmajunta.p12');
        const signedInvoice = signInvoiceXml(xml, p12FileData, { pkcs12Password: p12Password });
        writeFileSync('signedInvoice.xml', signedInvoice);
        return signedInvoice;

    }
}
