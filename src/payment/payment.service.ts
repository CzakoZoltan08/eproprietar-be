import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly publicKeyPath = path.join(__dirname, 'certs/sandbox.2SWO-FOIP-OBMI-EEYU-I2K2.public.cer');
  private readonly merchantSignature = '2SWO-FOIP-OBMI-EEYU-I2K2';
  private readonly mobilPayUrl = 'https://sandboxsecure.mobilpay.ro';

  generatePaymentRequest(orderId: string, amount: string, returnUrl: string, confirmUrl: string) {
    const xmlData = this.buildXmlRequest(orderId, amount, returnUrl, confirmUrl);
    const encryptedData = this.encryptData(xmlData);

    return {
      env_key: 'doYuSaxccVMPUR7UrSQAS0-1h5QVrOH3pGUCImWRku2T_M3rrIH0ZsTuHEA=',
      data: encryptedData,
      url: this.mobilPayUrl,
    };
  }

  private buildXmlRequest(orderId: string, amount: string, returnUrl: string, confirmUrl: string) {
    return `<order type="card" id="${orderId}" timestamp="${Date.now()}">
      <signature>${this.merchantSignature}</signature>
      <url>
          <return>${returnUrl}</return>
          <confirm>${confirmUrl}</confirm>
      </url>
      <invoice>
          <currency>RON</currency>
          <amount>${amount}</amount>
          <details>Payment for Order ${orderId}</details>
      </invoice>
  </order>`;
  }

  private encryptData(data: string) {
    const publicKey = fs.readFileSync(this.publicKeyPath, 'utf8');
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }
}