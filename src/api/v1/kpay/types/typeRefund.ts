import { Language, Result } from "./typeKpayApi";

export interface RefundRequestMetaData {
  language?: Language;
  kpayApiUrl?: string;
  kpayApiKey: string;
  merchantCode: string;
  kpayApiPaymentRefundEndpoint?: string;
}

export const requiredRefundMetaDataFields = [
  "kpayApiKey",
  "merchantCode",
] as const;

export interface RefundRequestDataContent {
  oriOrderNo: string;
  refundAmount: number;
  notifyUrl?: string | null;
}

export const requiredRefundDataContentFields = [
  "oriOrderNo",
  "refundAmount",
] as const;

export interface RefundResponseDataContent {
  outTradeNo: string;
  orderNo: string;
  result: Result;
  reason: string;
}

export interface RefundRequest
  extends RequestObject<RefundRequestDataContent, RefundRequestMetaData> {}

export interface RefundResponse
  extends ResultObject<RefundResponseDataContent> {}
