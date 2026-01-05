import { Request, Response } from "express";
import { CONFIG } from "../config/constants";
import { KPayApiError, KPayService } from "../services/kpay.service";
import { RefundRequest, RefundResponse } from "../types/typeRefund";
import {
  PaymentRefundRequest,
  PaymentRefundResponse,
} from "../types/typeKpayPaymentRefund";
import { validateRefundRequest } from "../middleware/validation.middleware";
import { ValidationError } from "../middleware/error.middleware";
import { Language } from "../types/typeKpayApi";

export const refundController = async (
  req: Request<RefundRequest>,
  res: Response<RefundResponse>
) => {
  try {
    // Extract and validate request data
    validateRefundRequest(req.body);

    const dataContent = req.body.dataContent || {};
    const metaData = req.body.metaData || {};
    const language = metaData.language || Language.ZH_HK;
    const kpayApiKey = metaData.kpayApiKey;
    const merchantCode = metaData.merchantCode;
    const outTradeNo = `order_${Date.now()}`;
    const oriOrderNo = dataContent.oriOrderNo || "";
    const refundAmount = dataContent.refundAmount || 0;
    const notifyUrl = dataContent.notifyUrl || null;
    const baseURL = metaData.kpayApiUrl || CONFIG.API.BASE_URL;
    const paymentRefundEndpoint =
      metaData.kpayApiPaymentRefundEndpoint ||
      CONFIG.API.ENDPOINTS.PAYMENT_REFUND;

    // Process refund via KPay API
    const kpayPaymentRefundService = new KPayService<
      PaymentRefundRequest,
      PaymentRefundResponse
    >(baseURL, paymentRefundEndpoint);
    const refundData = await kpayPaymentRefundService
      .post(
        { outTradeNo, oriOrderNo, refundAmount, notifyUrl },
        merchantCode,
        kpayApiKey,
        language
      )
      .then((response: PaymentRefundResponse) => {
        if (
          !CONFIG.API.SUCCESS_CODES.includes(response.code) ||
          !response.data
        ) {
          throw new KPayApiError(
            `Failed to process refund: ${response.message} with code ${response.code}`,
            502,
            response.code
          );
        }
        return response.data;
      });

    const orderNoResp = refundData.orderNo;
    const result = refundData.result;
    const reason = refundData.reason;

    // Send response
    res.status(200).json({
      resultType: "SUCCESS",
      resultMessage: "Refund processed successfully",
      dataContent: {
        outTradeNo,
        orderNo: orderNoResp,
        result,
        reason,
      },
    });
  } catch (error) {
    console.error("Error processing refund:", error);

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
      resultMessage: (error as Error).message || "An unexpected error occurred",
      metaData: CONFIG.META_DATA,
    });
  }
};
