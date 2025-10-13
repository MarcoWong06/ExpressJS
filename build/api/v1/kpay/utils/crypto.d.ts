import type { SignatureParams } from "../types";
export declare const generateSignature: ({ requestMethod, requestUri, timestamp, nonceStr, merchantCode, body, }: SignatureParams, kpayApiKey: string) => string;
export declare const generateTimestampAndNonce: () => {
    timestamp: number;
    nonceStr: string;
};
export declare const createCheckoutUrl: (managedOrderNo: string, language: string, baseUrl: string, merchantCode: string, nonceStr: string, timestamp: number, signature: string) => string;
