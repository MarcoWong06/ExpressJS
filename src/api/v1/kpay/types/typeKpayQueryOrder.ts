export enum ManagedOrderStatus {
  PENDING_PAYMENT = 1,
  PAID = 2,
  EXPIRED = 3,
  REFUNDED = 4,
  CLOSED = 5,
}

export enum Result {
  PENDING = 1,
  SUCCESSFULLY_PROCESSED = 2,
  PROCESSING_FAILED = 3,
  REFUNDED = 4,
  CANCELLED = 5,
  CLOSED = 6,
}

export enum OrderState {
  PROCESSING = 1,
  ORDER_PLACED_SUCCESSFULLY = 2,
  CLOSED = 3,
}

export interface PaymentOrderList {
  outTradeNo: string;
  orderNo: string;
  transactionNo: string;
  transactionAmount: number;
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
  };
}
