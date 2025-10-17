import {
  CardOrganization,
  Language,
  OrderState,
  PaymentMethod,
  Result,
  TransactionType,
  WalletType,
} from "./typeKpayApi";

export interface ResultRequestMetaData {
  language: Language;
  kpayApiUrl?: string;
  kpayApiKey: string;
  merchantCode: string;
  kpayApiQueryAllHostedCheckoutOrderEndpoint?: string;
  kpayApiQueryPaymentOrderEndpoint?: string;
}

export interface ResultRequestDataContent {
  managedOrderNo?: string;
  managedOutTradeNo?: string;
}

export interface ResultResponseDataContent {
  merchantCode: string;
  managedOrderNo: string;
  managedOutTradeNo: string;
  payAmount: number;
  payCurrency: string;
  managedOrderStatus: number;
  outTradeNo: string;
  orderNo: string;
  transactionNo?: string | undefined;
  transactionAmount?: number | undefined;
  payMethodId?: PaymentMethod | undefined;
  transactionTypeId?: TransactionType | undefined;
  cardOrganizationId?: CardOrganization | undefined;
  walletType?: WalletType | undefined;
  channelSerialNo?: string | undefined;
  localPayAmount: number | undefined;
  localPayCurrency: string | undefined;
  transactionFinishTime?: string | undefined;
  result: Result | undefined;
  reason?: string | undefined;
  orderState: OrderState | undefined;
}

export interface ResultRequest
  extends RequestObject<ResultRequestDataContent, ResultRequestMetaData> {}

export interface ResultResponse
  extends ResultObject<ResultResponseDataContent> {}
