import type { OrderRequest } from "../types";
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare const validateOrderRequest: (body: Partial<OrderRequest>) => void;
