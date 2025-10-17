import axios from "axios";
import type {
  CreateAllHostedCheckoutOrderRequest,
  CreateAllHostedCheckoutOrderResponse,
} from "../types/typeKpayCreateOrder";
import type {
  QueryAllHostedCheckoutOrderRequest,
  QueryAllHostedCheckoutOrderResponse,
} from "../types/typeKpayQueryOrder";
import { CONFIG } from "../config/constants";
import type { Headers } from "../types/typeKpayApi";
import {
  QueryPaymentOrderRequest,
  QueryPaymentOrderResponse,
} from "../types/typeKpayQueryPayment";

type Request =
  | CreateAllHostedCheckoutOrderRequest
  | QueryAllHostedCheckoutOrderRequest
  | QueryPaymentOrderRequest;
type Response =
  | CreateAllHostedCheckoutOrderResponse
  | QueryAllHostedCheckoutOrderResponse
  | QueryPaymentOrderResponse;

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

export class KPayService<
  RequestType extends Request,
  ResponseType extends Response
> {
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

  async post(
    requestBody: RequestType,
    headers: Record<string, string>
  ): Promise<ResponseType> {
    try {
      const response = await axios.post<ResponseType>(
        `${this.baseURL}${this.endPoints}`,
        requestBody,
        { headers, timeout: this.timeout }
      );
      handleResponseError(response);
      return response.data;
    } catch (error) {
      if (error instanceof KPayApiError) {
        throw error;
      }

      throw new KPayApiError("Unknown error occurred during API POST request");
    }
  }

  async get(
    requestBody: RequestType,
    headers: Record<string, string>
  ): Promise<ResponseType> {
    try {
      const queryParams = new URLSearchParams(requestBody as any).toString();
      const response = await axios.get<ResponseType>(
        `${this.baseURL}${this.endPoints}?${queryParams}`,
        { headers, timeout: this.timeout }
      );
      handleResponseError(response);
      return response.data;
    } catch (error) {
      if (error instanceof KPayApiError) {
        throw error;
      }

      throw new KPayApiError("Unknown error occurred during API GET request");
    }
  }
}

export const createApiHeaders = (headers: Headers) => ({
  "content-type": "application/json",
  "K-Merchant-Code": headers.MerchantCode,
  "K-Nonce-Str": headers.NonceStr,
  "K-Timestamp": headers.Timestamp,
  "K-Signature": headers.Signature,
  "K-Language": headers.Language,
});

const handleResponseError = (response: any) => {
  if (!response || !response.data) {
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
};
