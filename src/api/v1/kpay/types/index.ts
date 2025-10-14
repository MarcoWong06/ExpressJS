import { Language } from "./kpayApi";

export interface OrderRequestMetaData {
  language: Language;
  kpayApiUrl?: string;
  kpayApiKey: string;
  merchantCode: string;
  merchantIcon?: string;
  kpayApiCreateAllHostedCheckoutOrderEndpoint?: string;
  kpayApiGenerateAllHostedCheckoutOrderEndpoint?: string;
  notifyUrl?: string;
  returnUrl?: string;
}
export interface OrderRequestDataContent {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  itemNo: string;
  itemName: string;
  itemIcon?: string;
  quantity: number;
  discountAmount?: number;
  payAmount: number;
  orderRemark?: string;
}

export interface OrderResponseDataContent {
  checkoutUrl?: string;
}

export interface OrderRequest extends RequestObject<OrderRequestDataContent, OrderRequestMetaData> {}

export interface OrderResponse extends ResultObject<OrderResponseDataContent> {}

export interface SignatureParams {
  requestMethod: string;
  requestUri: string;
  timestamp: number;
  nonceStr: string;
  merchantCode: string;
  body: string;
}
