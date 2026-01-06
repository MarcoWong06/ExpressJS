import {
  CardOrganization,
  OrderState,
  PaymentMethod,
  Result,
  TransactionType,
  WalletType,
} from "./typeKpayApi";

export interface QueryPaymentOrderRequest {
  outTradeNo?: string;
  orderNo?: string;
}

export interface QueryPaymentOrderResponse {
  code: number | string;
  message?: string;
  data?: {
    merchantCode: string;
    outTradeNo: string;
    orderNo: string;
    transactionNo?: string;
    transactionAmount?: number;
    payMethodId?: PaymentMethod;
    transactionTypeId?: TransactionType;
    cardOrganizationId?: CardOrganization;
    walletType?: WalletType;
    channelSerialNo?: string;
    payAmount: number;
    payCurrency: string;
    localPayAmount: number;
    localPayCurrency: string;
    transactionFinishTime?: string;
    result: Result;
    reason?: string;
    orderState: OrderState;
  };
}
