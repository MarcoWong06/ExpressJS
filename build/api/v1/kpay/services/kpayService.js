import axios from "axios";
import { CONFIG } from "../config/constants";
export class KPayApiError extends Error {
    statusCode;
    apiCode;
    constructor(message, statusCode, apiCode) {
        super(message);
        this.statusCode = statusCode;
        this.apiCode = apiCode;
        this.name = "KPayApiError";
    }
}
export class KPayService {
    baseURL;
    endPoints;
    timeout;
    constructor(baseURL, endPoints, timeout = CONFIG.TIMEOUTS.REQUEST) {
        this.baseURL = baseURL;
        this.endPoints = endPoints;
        this.timeout = timeout;
    }
    async createOrder(requestBody, headers) {
        try {
            const response = await axios.post(`${this.baseURL}${this.endPoints}`, requestBody, { headers, timeout: this.timeout });
            if (!response.data) {
                throw new KPayApiError("Invalid response from payment API - no data received");
            }
            const { code, message } = response.data;
            if (!CONFIG.API.SUCCESS_CODES.includes(code)) {
                throw new KPayApiError(`Payment API error: ${message || code}`, response.status, code);
            }
            return response.data;
        }
        catch (error) {
            if (error instanceof KPayApiError) {
                throw error;
            }
            throw new KPayApiError("Unknown error occurred during API request");
        }
    }
}
export const createApiHeaders = (headers) => ({
    "K-Merchant-Code": headers.MerchantCode,
    "K-Nonce-Str": headers.NonceStr,
    "K-Timestamp": headers.Timestamp,
    "K-Signature": headers.Signature,
    "K-Language": headers.Language,
});
//# sourceMappingURL=kpayService.js.map