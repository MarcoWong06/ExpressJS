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
  orderTradeNo: string;
  orderNo: string;
  transactionNo?: string;
  transactionAmount?: number;
  payMethodId?: number;
  transactionTypeId?: number;
  cardOrganizationId?: number;
  walletType?: number;
  channelSerialNo?: string;
  localPayAmount: number;
  localPayCurrency: string;
  transactionFinishTime?: string;
  result: number;
  orderState: number;
}

export interface ResultRequest
  extends RequestObject<ResultRequestDataContent> {}

export interface ResultResponse
  extends ResultObject<ResultResponseDataContent> {}
