import { OrderRequest } from "./typeCheckout";
import { CONFIG } from "../config/constants";
import { PageFeatureControl } from "./typeKpayApi";


export interface OrderItem {
  itemNo: string;
  itemName: string;
  itemIcon?: string | null;
  price: number;
  priceCurrency: string;
  quantity: number;
}

export interface PaymentEnvironmentInfo {
  browser?: string;
  ipAddress?: string;
  copyFlag: boolean;
  timeZone?: number;
  language?: string;
  webSite?: string;
  screenWidth?: number;
  screenHeight?: number;
}

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  telephone: string;
  telephoneAreaCode: string;
  countryId?: number;
  provinceId?: number;
  address: string;
  postCode: string;
}

export interface BillInfo {
  firstName: string;
  lastName: string;
  telephone: string;
  telephoneAreaCode: string;
  countryId?: number;
  provinceId?: number;
  address: string;
  postCode: string;
}

export interface CreateAllHostedCheckoutOrderRequest {
  merchantIcon?: string | null;
  managedOutTradeNo: string;
  payAmount: number;
  payCurrency: string;
  discountAmount?: number | null;
  notifyUrl?: string | null;
  returnUrl?: string | null;
  orderRemark?: string | null;
  pageFeatureControls?: PageFeatureControl[];
  itemList: OrderItem[];
  paymentEnvironmentInfo?: PaymentEnvironmentInfo;
  deliveryInfo?: DeliveryInfo;
  billInfo?: BillInfo;
}

export interface CreateAllHostedCheckoutOrderResponse {
  code: number | string;
  message?: string;
  data?: {
    managedOrderNo: string;
  };
}

export const createOrderRequestBody = (
  body: OrderRequest
): CreateAllHostedCheckoutOrderRequest => ({
  merchantIcon: body.metaData.merchantIcon || null,
  managedOutTradeNo: `order_${Date.now()}`,
  payAmount: body.dataContent.payAmount,
  payCurrency: CONFIG.DEFAULTS.CURRENCY,
  discountAmount: body.dataContent.discountAmount || null,
  notifyUrl: body.metaData.notifyUrl || null,
  returnUrl: body.metaData.returnUrl || null,
  orderRemark: body.dataContent.orderRemark || null,
  itemList: [
    {
      itemNo: body.dataContent.itemNo,
      itemName: body.dataContent.itemName,
      itemIcon: body.dataContent.itemIcon || null,
      price: body.dataContent.payAmount + (body.dataContent.discountAmount || 0),
      priceCurrency: CONFIG.DEFAULTS.CURRENCY,
      quantity: body.dataContent.quantity,
    },
  ],
});