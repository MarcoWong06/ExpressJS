const VERSION = "1.0";
export const CONFIG = {
    API: {
        BASE_URL: "https://payment.uat.kpay-group.com",
        ENDPOINTS: {
            CREATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/add",
            GENERATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/web/managed/order",
        },
        SUCCESS_CODES: [10000, "10000"],
    },
    DEFAULTS: {
        CURRENCY: "HKD",
    },
    TIMEOUTS: {
        REQUEST: 30000,
    },
    VERSION: VERSION,
    META_DATA: { version: VERSION },
};
//# sourceMappingURL=constants.js.map