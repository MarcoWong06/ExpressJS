import axios, { isAxiosError } from "axios";
import { CONFIG } from "../config/constants";
import { Language, type Headers } from "../types/typeKpayApi";
import {
  generateSignature,
  generateTimestampAndNonce,
} from "../utils/crypto.utils";
import { Request, Response } from "../types/typeKpayService";

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

  private handleError(error: unknown, method: "POST" | "GET"): never {
    if (error instanceof KPayApiError) {
      throw error;
    }

    if (isAxiosError(error)) {
      if (error.response) {
        throw new KPayApiError(
          `API ${method.toLowerCase()} request failed with status ${error.response.status}`,
          error.response.status
        );
      }
      throw new KPayApiError(
        `Network error during API ${method} request: ${error.message}`
      );
    }
    throw new KPayApiError(`Unknown error occurred during API ${method} request`);
  }

  async post(
    requestBody: RequestType,
    merchantCode: string,
    kpayApiKey: string,
    language: Language
  ): Promise<ResponseType> {
    try {
      const requestUri = new URL(this.endPoints, this.baseURL);

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
      this.handleError(error, "POST");
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
      this.handleError(error, "GET");
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
      "Invalid response from payment API - no data received",
      response.status
    );
  }

  const { code, message } = response.data;
  if (!CONFIG.API.SUCCESS_CODES.includes(code)) {
    throw new KPayApiError(
      `API request failed: ${message} (code ${code})`,
      response.status,
      code
    );
  }
};
