import { ManagedOrderState, OrderState, Result } from "./typeKpayApi";

export interface PaymentOrderList {
  outTradeNo: string;
  orderNo: string;
  transactionNo?: string;
  transactionAccount?: string;
  result: Result;
  orderState: OrderState;
}

export interface QueryAllHostedCheckoutOrderRequest {
  managedOrderNo?: string | null;
  managedOutTradeNo?: string | null;
}

export interface QueryAllHostedCheckoutOrderResponse {
  code: number | string;
  message?: string;
  data?: {
    merchantCode: string;
    managedOutTradeNo: string;
    managedOrderNo: string;
    payAmount: number;
    payCurrency: string;
    managedOrderState: ManagedOrderState;
    paymentOrderList?: PaymentOrderList[];
  };
}
