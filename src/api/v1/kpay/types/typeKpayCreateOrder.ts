
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
