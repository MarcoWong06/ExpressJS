import { Request, Response } from "express";
import type { OrderRequest, OrderResponse } from "../types/typeCheckout";
import { createOrderRequestBody } from "../services/kpay.service";
import {
  generateSignature,
  generateTimestampAndNonce,
  createCheckoutUrl,
} from "../utils/crypto.utils";
import { validateOrderRequest } from "../middleware/validation.middleware";
import {
  KPayService,
  KPayApiError,
  createApiHeaders,
} from "../services/kpay.service";
import { CONFIG } from "../config/constants";
import { ValidationError } from "../middleware/error.middleware";

export const checkoutController = async (
  req: Request<OrderRequest>,
  res: Response<OrderResponse>
) => {
  try {
    // Validate request body
    validateOrderRequest(req.body);

    const dataContent = req.body.dataContent || {};
    const metaData = req.body.metaData || {};

    // Create order request
    const orderRequest = createOrderRequestBody(req.body);
    const { timestamp, nonceStr } = generateTimestampAndNonce();
    const bodyString = JSON.stringify(orderRequest);
    const baseURL = dataContent.kpayApiUrl ?? CONFIG.API.BASE_URL;
    const createOrderEndpoint =
      dataContent.kpayApiCreateAllHostedCheckoutOrderEndpoint ??
      CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER;
    const generateOrderEndpoint =
      dataContent.kpayApiGenerateAllHostedCheckoutOrderEndpoint ??
      CONFIG.API.ENDPOINTS.GENERATE_ALL_HOSTED_CHECKOUT_ORDER;
    const language = metaData.language;
    const kpayApiKey = metaData.kpayApiKey;
    const merchantCode = metaData.merchantCode;

    // Generate signature for order creation
    const signature = generateSignature(
      {
        requestMethod: "POST",
        requestUri: CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER,
        body: bodyString,
        merchantCode,
        timestamp,
        nonceStr,
      },
      kpayApiKey
    );

    // Create API headers
    const headers = createApiHeaders({
      MerchantCode: merchantCode,
      NonceStr: nonceStr,
      Timestamp: timestamp.toString(),
      Signature: signature,
      Language: language,
    });

    // Create order via KPay API
    const kpayService = new KPayService(baseURL, createOrderEndpoint);
    const apiResponse = await kpayService.createOrder(orderRequest, headers);
    if (
      !CONFIG.API.SUCCESS_CODES.includes(apiResponse.code) ||
      !apiResponse.data
    ) {
      throw new KPayApiError(
        `Failed to create order: ${apiResponse.message} with code ${apiResponse.code}`,
        undefined,
        apiResponse.code
      );
    }

    const managedOrderNo = apiResponse.data.managedOrderNo;

    // Generate new signature for checkout URL
    const { timestamp: newTimestamp, nonceStr: newNonceStr } =
      generateTimestampAndNonce();
    const checkoutSignature = generateSignature(
      {
        requestMethod: "GET",
        requestUri: `${generateOrderEndpoint}?managedOrderNo=${managedOrderNo}&language=${language}&K-Merchant-Code=${merchantCode}&K-Nonce-Str=${newNonceStr}&K-Timestamp=${newTimestamp}`,
        body: "",
        merchantCode,
        timestamp: newTimestamp,
        nonceStr: newNonceStr,
      },
      kpayApiKey
    );

    // Create checkout URL
    const checkoutUrl = createCheckoutUrl(
      `${baseURL}${generateOrderEndpoint}`,
      managedOrderNo,
      language,
      merchantCode,
      newNonceStr,
      newTimestamp,
      checkoutSignature
    );

    res.status(200).json({
      resultType: "SUCCESS",
      resultMessage: "Hosted checkout order created successfully",
      dataContent: {
        checkoutUrl,
      },
      metaData: CONFIG.META_DATA,
    });
  } catch (error) {
    console.error("Error processing hosted checkout order:", error);

    if (error instanceof ValidationError) {
      res.status(400).json({
        resultType: "ERROR",
        resultMessage: "Validation Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    if (error instanceof KPayApiError) {
      res.status(error.statusCode || 502).json({
        resultType: "ERROR",
        resultMessage: "Payment API Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    res.status(500).json({
      resultType: "ERROR",
      resultMessage: "Internal Server Error: " + (error as Error).message,
      metaData: CONFIG.META_DATA,
    });
  }
};
