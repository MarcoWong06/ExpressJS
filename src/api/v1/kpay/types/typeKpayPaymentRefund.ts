import { Result } from "./typeKpayApi";

export interface PaymentRefundRequest {
  outTradeNo: string;
  oriOrderNo: string;
  refundAmount: number;
  notifyUrl?: string | null;
}

export interface PaymentRefundResponse {
  code: number | string;
  message?: string;
  data?: {
    orderNo: string;
    result: Result;
    reason: string;
  };
}