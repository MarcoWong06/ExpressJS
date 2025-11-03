import type { CreateAllHostedCheckoutOrderRequest, CreateAllHostedCheckoutOrderResponse } from "../types/allHostedCheckoutOrder";
import type { Headers } from "../types/kpayApi";
export declare class KPayApiError extends Error {
    statusCode?: number | undefined;
    apiCode?: string | number | undefined;
    constructor(message: string, statusCode?: number | undefined, apiCode?: string | number | undefined);
}
export declare class KPayService {
    private baseURL;
    private endPoints;
    private timeout;
    constructor(baseURL: string, endPoints: string, timeout?: number);
    createOrder(requestBody: CreateAllHostedCheckoutOrderRequest, headers: Record<string, string>): Promise<CreateAllHostedCheckoutOrderResponse>;
}
export declare const createApiHeaders: (headers: Headers) => {
    "K-Merchant-Code": string;
    "K-Nonce-Str": string;
    "K-Timestamp": string;
    "K-Signature": string;
    "K-Language": import("../types/kpayApi").Language;
};
