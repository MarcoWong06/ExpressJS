import { Request, Response } from "express";
import { ResultRequest, ResultResponse } from "../types/typeResult";
import { validateResultRequest } from "../middleware/validation.middleware";
import { KPayApiError, KPayService } from "../services/kpay.service";
import { CONFIG } from "../config/constants";
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
    const managedOrderNo = dataContent.managedOrderNo || "";
    const managedOutTradeNo = dataContent.managedOutTradeNo || "";
    const baseURL = dataContent.kpayApiUrl ?? CONFIG.API.BASE_URL;
    const queryCheckoutOrderEndpoint =
      dataContent.kpayApiQueryAllHostedCheckoutOrderEndpoint ??
      CONFIG.API.ENDPOINTS.QUERY_ALL_HOSTED_CHECKOUT_ORDER;
    const queryPaymentOrderEndpoint =
      dataContent.kpayApiQueryPaymentOrderEndpoint ??
      CONFIG.API.ENDPOINTS.QUERY_PAYMENT_ORDER;

    const kpayQueryOrderService = new KPayService<
      QueryAllHostedCheckoutOrderRequest,
      QueryAllHostedCheckoutOrderResponse
    >(baseURL, queryCheckoutOrderEndpoint);
    const orderData = await kpayQueryOrderService
      .get(
        { managedOrderNo, managedOutTradeNo },
        merchantCode,
        kpayApiKey,
        language
      )
      .then((response: QueryAllHostedCheckoutOrderResponse) => {
        if (
          !CONFIG.API.SUCCESS_CODES.includes(response.code) ||
          !response.data
        ) {
          throw new KPayApiError(
            `Failed to create order: ${response.message} with code ${response.code}`,
            undefined,
            response.code
          );
        }
        return response.data;
      });
    console.log("Order Data:", orderData);

    const paymentOrderList = orderData.paymentOrderList || [];
    if (!paymentOrderList[0]) {
      res.status(200).json({
        resultType: "SUCCESS",
        resultMessage:
          "Order information retrieved successfully, but no payment data found",
        dataContent: {
          merchantCode,
          managedOrderNo,
          managedOutTradeNo,
          payAmount: orderData.payAmount,
          payCurrency: orderData.payCurrency,
          managedOrderState: orderData.managedOrderState,
        },
        metaData: CONFIG.META_DATA,
      });

      return;
    }

    const payAmount = orderData.payAmount;
    const payCurrency = orderData.payCurrency;
    const managedOrderState = orderData.managedOrderState;
    const outTradeNo = paymentOrderList[0].outTradeNo;
    const orderNo = paymentOrderList[0].orderNo;
    const transactionNo = paymentOrderList[0].transactionNo ?? undefined;
    const transactionAccount =
      paymentOrderList[0].transactionAccount ?? undefined;
    const result = paymentOrderList[0].result;
    const orderState = paymentOrderList[0].orderState;

    const kpayQueryPaymentService = new KPayService<
      QueryPaymentOrderRequest,
      QueryPaymentOrderResponse
    >(baseURL, queryPaymentOrderEndpoint);
    const paymentData = await kpayQueryPaymentService
      .get({ outTradeNo, orderNo }, merchantCode, kpayApiKey, language)
      .then((response: QueryPaymentOrderResponse) => {
        if (
          !CONFIG.API.SUCCESS_CODES.includes(response.code) ||
          !response.data
        ) {
          throw new KPayApiError(
            `Failed to create order: ${response.message} with code ${response.code}`,
            undefined,
            response.code
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
        managedOrderState,
        outTradeNo,
        orderNo,
        transactionNo,
        transactionAccount,
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
