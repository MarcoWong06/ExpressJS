import axios from "axios";
import type {
  CreateAllHostedCheckoutOrderRequest,
  CreateAllHostedCheckoutOrderResponse,
} from "../types/typeKpayCreateOrder";
import { CONFIG } from "../config/constants";
import type { Headers } from "../types/typeKpayApi";
import { OrderRequest } from "../types/typeCheckout";

export class KPayApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiCode?: string | number
  ) {
    super(message);
    this.name = "KPayApiError";
  }
}

export class KPayService {
  private baseURL: string;
  private endPoints: string;
  private timeout: number;

  constructor(
    baseURL: string,
    endPoints: string,
    timeout: number = CONFIG.TIMEOUTS.REQUEST
  ) {
    this.baseURL = baseURL;
    this.endPoints = endPoints;
    this.timeout = timeout;
  }

  async createOrder(
    requestBody: CreateAllHostedCheckoutOrderRequest,
    headers: Record<string, string>
  ): Promise<CreateAllHostedCheckoutOrderResponse> {
    try {
      const response = await axios.post<CreateAllHostedCheckoutOrderResponse>(
        `${this.baseURL}${this.endPoints}`,
        requestBody,
        { headers, timeout: this.timeout }
      );

      if (!response.data) {
        throw new KPayApiError(
          "Invalid response from payment API - no data received"
        );
      }

      const { code, message } = response.data;
      if (!CONFIG.API.SUCCESS_CODES.includes(code)) {
        throw new KPayApiError(
          `Payment API error: ${message || code}`,
          response.status,
          code
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof KPayApiError) {
        throw error;
      }

      throw new KPayApiError("Unknown error occurred during API request");
    }
  }
}

export const createApiHeaders = (headers: Headers) => ({
  "K-Merchant-Code": headers.MerchantCode,
  "K-Nonce-Str": headers.NonceStr,
  "K-Timestamp": headers.Timestamp,
  "K-Signature": headers.Signature,
  "K-Language": headers.Language,
});

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