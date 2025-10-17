import { Request, Response } from "express";
import type { OrderRequest, OrderResponse } from "../types/typeCheckout";
import {
  generateSignature,
  generateTimestampAndNonce,
} from "../utils/crypto.utils";
import { validateOrderRequest } from "../middleware/validation.middleware";
import {
  KPayService,
  KPayApiError,
  createApiHeaders,
} from "../services/kpay.service";
import { CONFIG } from "../config/constants";
import { ValidationError } from "../middleware/error.middleware";
import {
  CreateAllHostedCheckoutOrderRequest,
  CreateAllHostedCheckoutOrderResponse,
} from "../types/typeKpayCreateOrder";

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
    const { timestamp, nonceStr } = generateTimestampAndNonce();
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
    const kpayService = new KPayService<
      CreateAllHostedCheckoutOrderRequest,
      CreateAllHostedCheckoutOrderResponse
    >(baseURL, createOrderEndpoint);
    const apiResponse = await kpayService.post(orderRequest, headers);
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
    const requestUri = `${generateOrderEndpoint}?managedOrderNo=${managedOrderNo}&language=${language}&K-Merchant-Code=${merchantCode}&K-Nonce-Str=${newNonceStr}&K-Timestamp=${newTimestamp}`;
    const checkoutSignature = generateSignature(
      {
        requestMethod: "GET",
        requestUri,
        body: "",
        merchantCode,
        timestamp: newTimestamp,
        nonceStr: newNonceStr,
      },
      kpayApiKey
    );

    // Create checkout URL
    const checkoutUrl = requestUri + `&K-Signature=${checkoutSignature}`;

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

const createOrderRequestBody = (
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
      price:
        body.dataContent.payAmount + (body.dataContent.discountAmount || 0),
      priceCurrency: CONFIG.DEFAULTS.CURRENCY,
      quantity: body.dataContent.quantity,
    },
  ],
});
