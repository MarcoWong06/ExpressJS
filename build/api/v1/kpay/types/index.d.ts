import { Language } from "./kpayApi";
export interface OrderRequestMetaData {
    language: Language;
    kpayApiKey: string;
    merchantCode: string;
    payAmount: number;
    itemNo: string;
    itemName: string;
    quantity: number;
}
export interface OrderRequestDataContent {
    kpayApiUrl?: string;
    kpayApiCreateAllHostedCheckoutOrderEndpoint?: string;
    kpayApiGenerateAllHostedCheckoutOrderEndpoint?: string;
    merchantIcon?: string;
    discountAmount?: number;
    notifyUrl?: string;
    returnUrl?: string;
    orderRemark?: string;
    itemIcon?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}
export interface OrderResponseDataContent {
    checkoutUrl?: string;
}
export interface OrderRequest extends ResultObject<OrderRequestDataContent, OrderRequestMetaData> {
}
export interface OrderResponse extends ResultObject<OrderResponseDataContent> {
}
export interface SignatureParams {
    requestMethod: string;
    requestUri: string;
    timestamp: number;
    nonceStr: string;
    merchantCode: string;
    body: string;
}
