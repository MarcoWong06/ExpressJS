import { ManagedOrderStatus, OrderState, Result } from "./typeKpayApi";

export interface PaymentOrderList {
  outTradeNo: string;
  orderNo: string;
  transactionNo?: string;
  transactionAmount?: number;
  result: Result;
  orderState: OrderState;
}

export interface QueryAllHostedCheckoutOrderRequest {
  managedOrderNo?: string;
  managedOutTradeNo?: string;
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
    managedOrderStatus: ManagedOrderStatus;
    paymentOrderList?: PaymentOrderList[];
  };
}
