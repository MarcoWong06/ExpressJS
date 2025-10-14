import type { OrderRequest } from "../types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateOrderRequest = (body: Partial<OrderRequest>): void => {
  const requiredMetaDataFields = [
    "language",
    "kpayApiKey",
    "merchantCode",
    "payAmount",
    "itemNo",
    "itemName",
    "quantity",
  ] as const;

  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  for (const field of requiredMetaDataFields) {
    if (!body.metaData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (typeof body.metaData?.payAmount !== "number" || body.metaData?.payAmount <= 0) {
    throw new ValidationError("payAmount must be a positive number");
  }

  if (body.metaData?.discountAmount !== null && body.metaData?.discountAmount !== undefined) {
    if (typeof body.metaData?.discountAmount !== "number" || body.metaData?.discountAmount < 0) {
      throw new ValidationError("discountAmount must be a non-negative number");
    }
  }

  if (body.dataContent?.email && !isValidEmail(body.dataContent.email)) {
    throw new ValidationError("Invalid email format");
  }

  if (body.dataContent?.phone && !isValidPhone(body.dataContent.phone)) {
    throw new ValidationError("Invalid phone format");
  }
};


const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[2-9]\d{7}$/; // Hong Kong phone number format
  return phoneRegex.test(phone);
};
