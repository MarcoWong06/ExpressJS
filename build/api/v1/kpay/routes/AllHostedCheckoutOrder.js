import express from "express";
import { generateSignature, generateTimestampAndNonce, createCheckoutUrl, } from "../utils/crypto";
import { validateOrderRequest, ValidationError } from "../utils/validation";
import { KPayService, KPayApiError, createApiHeaders, } from "../services/kpayService";
import { CONFIG } from "../config/constants";
const router = express.Router();
const createOrderRequestBody = (body) => ({
    merchantIcon: body.dataContent?.merchantIcon || null,
    managedOutTradeNo: `order_${Date.now()}`,
    payAmount: body.metaData.payAmount,
    payCurrency: CONFIG.DEFAULTS.CURRENCY,
    discountAmount: body.dataContent?.discountAmount || null,
    notifyUrl: body.dataContent?.notifyUrl || null,
    returnUrl: body.dataContent?.returnUrl || null,
    orderRemark: body.dataContent?.orderRemark || null,
    itemList: [
        {
            itemNo: body.metaData.itemNo,
            itemName: body.metaData.itemName,
            itemIcon: body.dataContent?.itemIcon || null,
            price: body.metaData.payAmount + (body.dataContent?.discountAmount || 0),
            priceCurrency: CONFIG.DEFAULTS.CURRENCY,
            quantity: body.metaData.quantity,
        },
    ],
});
router.post("/", async (req, res) => {
    try {
        validateOrderRequest(req.body);
        const orderRequest = createOrderRequestBody(req.body);
        const { timestamp, nonceStr } = generateTimestampAndNonce();
        const bodyString = JSON.stringify(orderRequest);
        const baseURL = req.body.kpayApiUrl || CONFIG.API.BASE_URL;
        const createOrderEndpoint = req.body.kpayApiCreateAllHostedCheckoutOrderEndpoint ||
            CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER;
        const generateOrderEndpoint = req.body.kpayApiGenerateAllHostedCheckoutOrderEndpoint ||
            CONFIG.API.ENDPOINTS.GENERATE_ALL_HOSTED_CHECKOUT_ORDER;
        const signature = generateSignature({
            requestMethod: "POST",
            requestUri: CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER,
            body: bodyString,
            merchantCode: req.body.merchantCode,
            timestamp,
            nonceStr,
        }, req.body.kpayApiKey);
        const headers = createApiHeaders({
            MerchantCode: req.body.merchantCode,
            NonceStr: nonceStr,
            Timestamp: timestamp.toString(),
            Signature: signature,
            Language: req.body.language,
        });
        const kpayService = new KPayService(baseURL, createOrderEndpoint);
        const apiResponse = await kpayService.createOrder(orderRequest, headers);
        if (!CONFIG.API.SUCCESS_CODES.includes(apiResponse.code) ||
            !apiResponse.data) {
            throw new KPayApiError(`Failed to create order: ${apiResponse.message} with code ${apiResponse.code}`, undefined, apiResponse.code);
        }
        const managedOrderNo = apiResponse.data.managedOrderNo;
        const { timestamp: newTimestamp, nonceStr: newNonceStr } = generateTimestampAndNonce();
        const checkoutSignature = generateSignature({
            requestMethod: "GET",
            requestUri: `${generateOrderEndpoint}?managedOrderNo=${managedOrderNo}&K-Merchant-Code=${req.body.merchantCode}&K-Nonce-Str=${newNonceStr}&K-Timestamp=${newTimestamp}`,
            body: "",
            merchantCode: req.body.merchantCode,
            timestamp: newTimestamp,
            nonceStr: newNonceStr,
        }, req.body.kpayApiKey);
        const checkoutUrl = createCheckoutUrl(`${baseURL}${generateOrderEndpoint}`, managedOrderNo, req.body.language, req.body.merchantCode, newNonceStr, newTimestamp, checkoutSignature);
        res.status(200).json({
            resultType: "SUCCESS",
            resultMessage: "Hosted checkout order created successfully",
            dataContent: {
                checkoutUrl,
            },
            metaData: CONFIG.META_DATA,
        });
    }
    catch (error) {
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
            resultMessage: "Internal Server Error: " + error.message,
            metaData: CONFIG.META_DATA,
        });
    }
});
export default router;
//# sourceMappingURL=AllHostedCheckoutOrder.js.map