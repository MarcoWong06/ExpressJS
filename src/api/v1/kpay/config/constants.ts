const VERSION = "1.0";

export const CONFIG = {
  API: {
    BASE_URL: "https://payment.uat.kpay-group.com",
    ENDPOINTS: {
      CREATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/add",
      GENERATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/web/managed/order",
      QUERY_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/result",
      QUERY_PAYMENT_ORDER: "/v1/order/sales/result",
    },
    SUCCESS_CODES: [10000, "10000"] as readonly (number | string)[],
  },
  DEFAULTS: {
    CURRENCY: "HKD",
  },
  TIMEOUTS: {
    REQUEST: 30000,
  },
  VERSION: VERSION,
  META_DATA: { version: VERSION } as const,
} as const;
