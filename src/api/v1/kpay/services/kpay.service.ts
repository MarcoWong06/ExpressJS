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
import { Language, type Headers } from "../types/typeKpayApi";
import {
  QueryPaymentOrderRequest,
  QueryPaymentOrderResponse,
} from "../types/typeKpayQueryPayment";
import {
  generateSignature,
  generateTimestampAndNonce,
} from "../utils/crypto.utils";

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
    merchantCode: string,
    kpayApiKey: string,
    language: Language
  ): Promise<ResponseType> {
    try {
      const requestUri = new URL(this.endPoints, this.baseURL);
      requestUri.search = new URLSearchParams(requestBody as any).toString();

      // Generate signature for order query
      const { timestamp, nonceStr } = generateTimestampAndNonce();
      const signature = generateSignature(
        {
          requestMethod: "POST",
          endPoints: this.endPoints,
          timestamp,
          nonceStr,
          merchantCode,
          body: JSON.stringify(requestBody),
        },
        kpayApiKey
      );

      const headers = createApiHeaders({
        MerchantCode: merchantCode,
        NonceStr: nonceStr,
        Timestamp: timestamp.toString(),
        Signature: signature,
        Language: language,
      });
      const response = await axios.post<ResponseType>(
        requestUri.toString(),
        requestBody,
        {
          headers,
          timeout: this.timeout,
        }
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
    merchantCode: string,
    kpayApiKey: string,
    language: Language
  ): Promise<ResponseType> {
    try {
      const requestUri = new URL(this.endPoints, this.baseURL);
      requestUri.search = new URLSearchParams(requestBody as any).toString();

      // Generate signature for order query
      const { timestamp, nonceStr } = generateTimestampAndNonce();
      const signature = generateSignature(
        {
          requestMethod: "GET",
          endPoints: this.endPoints + requestUri.search,
          timestamp,
          nonceStr,
          merchantCode,
          body: "",
        },
        kpayApiKey
      );

      const headers = createApiHeaders({
        MerchantCode: merchantCode,
        NonceStr: nonceStr,
        Timestamp: timestamp.toString(),
        Signature: signature,
        Language: language,
      });
      const response = await axios.get<ResponseType>(requestUri.toString(), {
        headers,
        timeout: this.timeout,
      });

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
        `Failed to create order: ${message} with code ${code}`,
        undefined,
        code
    );
  }
};
