import { Request, Response } from "express";
import { ResultRequest, ResultResponse } from "../types/typeResult";
import { validateResultRequest } from "../middleware/validation.middleware";
import {
  createApiHeaders,
  KPayApiError,
  KPayService,
} from "../services/kpay.service";
import { CONFIG } from "../config/constants";
import {
  generateSignature,
  generateTimestampAndNonce,
} from "../utils/crypto.utils";
import {
  QueryAllHostedCheckoutOrderRequest,
  QueryAllHostedCheckoutOrderResponse,
} from "../types/typeKpayQueryOrder";
import { ValidationError } from "../middleware/error.middleware";
import {
  QueryPaymentOrderRequest,
  QueryPaymentOrderResponse,
} from "../types/typeKpayQueryPayment";

export const resultController = async (
  req: Request<ResultRequest>,
  res: Response<ResultResponse>
) => {
  try {
    // Extract and validate request data
    validateResultRequest(req.body);

    const dataContent = req.body.dataContent || {};
    const metaData = req.body.metaData || {};
    const language = metaData.language;
    const kpayApiKey = metaData.kpayApiKey;
    const merchantCode = metaData.merchantCode;
    const managedOrderNo = dataContent.managedOrderNo;
    const managedOutTradeNo = dataContent.managedOutTradeNo;
    const baseURL = dataContent.kpayApiUrl ?? CONFIG.API.BASE_URL;
    const queryCheckoutOrderEndpoint =
      dataContent.kpayApiQueryAllHostedCheckoutOrderEndpoint ??
      CONFIG.API.ENDPOINTS.QUERY_ALL_HOSTED_CHECKOUT_ORDER;
    const queryPaymentOrderEndpoint =
      dataContent.kpayApiQueryPaymentOrderEndpoint ??
      CONFIG.API.ENDPOINTS.QUERY_PAYMENT_ORDER;

    // Generate signature for order query
    const { timestamp, nonceStr } = generateTimestampAndNonce();
    const queryOrderRequestUri = `${queryCheckoutOrderEndpoint}?managedOrderNo=${
      managedOrderNo || ""
    }&managedOutTradeNo=${managedOutTradeNo || ""}`;
    const queryOrderSignature = generateSignature(
      {
        requestMethod: "GET",
        requestUri: queryOrderRequestUri,
        body: "",
        merchantCode,
        timestamp,
        nonceStr,
      },
      kpayApiKey
    );
    const kpayQueryOrderService = new KPayService<
      QueryAllHostedCheckoutOrderRequest,
      QueryAllHostedCheckoutOrderResponse
    >(baseURL, queryCheckoutOrderEndpoint);
    const queryOrderHeaders = createApiHeaders({
      MerchantCode: merchantCode,
      NonceStr: nonceStr,
      Timestamp: timestamp.toString(),
      Signature: queryOrderSignature,
      Language: language,
    });
    const orderData = await kpayQueryOrderService
      .get({ managedOrderNo, managedOutTradeNo }, queryOrderHeaders)
      .then((response: QueryAllHostedCheckoutOrderResponse) => {
        if (!response || response.code !== 200 || !response.data) {
          throw new KPayApiError(
            "Failed to retrieve order information",
            response.code as number
          );
        }
        return response.data;
      });
    const paymentOrderList = orderData.paymentOrderList || [];
    if (!paymentOrderList[0]) {
      throw new KPayApiError(
        "No payment orders found for the given managed order",
        404
      );
    }

    const payAmount = orderData.payAmount;
    const payCurrency = orderData.payCurrency;
    const managedOrderStatus = orderData.managedOrderStatus;
    const outTradeNo = paymentOrderList[0].outTradeNo;
    const orderNo = paymentOrderList[0].orderNo;
    const transactionNo = paymentOrderList[0].transactionNo ?? undefined;
    const transactionAmount =
      paymentOrderList[0].transactionAmount ?? undefined;
    const result = paymentOrderList[0].result;
    const orderState = paymentOrderList[0].orderState;

    const queryPaymentRequestUri = `${queryPaymentOrderEndpoint}?outTradeNo=${outTradeNo}&orderNo=${orderNo}`;
    const queryPaymentSignature = generateSignature(
      {
        requestMethod: "GET",
        requestUri: queryPaymentRequestUri,
        body: "",
        merchantCode,
        timestamp,
        nonceStr,
      },
      kpayApiKey
    );
    const kpayQueryPaymentService = new KPayService<
      QueryPaymentOrderRequest,
      QueryPaymentOrderResponse
    >(baseURL, queryPaymentOrderEndpoint);
    const queryPaymentHeaders = createApiHeaders({
      MerchantCode: merchantCode,
      NonceStr: nonceStr,
      Timestamp: timestamp.toString(),
      Signature: queryPaymentSignature,
      Language: language,
    });
    const paymentData = await kpayQueryPaymentService
      .get({ outTradeNo, orderNo }, queryPaymentHeaders)
      .then((response: QueryPaymentOrderResponse) => {
        if (!response || response.code !== 200 || !response.data) {
          throw new KPayApiError(
            "Failed to retrieve payment information",
            response.code as number
          );
        }
        return response.data;
      });
      const payMethodId = paymentData.payMethodId;
      const transactionTypeId = paymentData.transactionTypeId;
      const cardOrganizationId = paymentData.cardOrganizationId;
      const walletType = paymentData.walletType;
      const channelSerialNo = paymentData.channelSerialNo;
      const localPayAmount = paymentData.localPayAmount;
      const localPayCurrency = paymentData.localPayCurrency;
      const transactionFinishTime = paymentData.transactionFinishTime;
      const reason = paymentData.reason;

    // Send successful response
    res.status(200).json({
      resultType: "SUCCESS",
      resultMessage: "Order and Payment information retrieved successfully",
      dataContent: {
        merchantCode,
        managedOrderNo,
        managedOutTradeNo,
        payAmount,
        payCurrency,
        managedOrderStatus,
        outTradeNo,
        orderNo,
        transactionNo,
        transactionAmount,
        payMethodId,
        transactionTypeId,
        cardOrganizationId,
        walletType,
        channelSerialNo,
        localPayAmount,
        localPayCurrency,
        transactionFinishTime,
        result,
        reason,
        orderState,
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
