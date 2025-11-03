export declare const CONFIG: {
    readonly API: {
        readonly BASE_URL: "https://payment.uat.kpay-group.com";
        readonly ENDPOINTS: {
            readonly CREATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/add";
            readonly GENERATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/web/managed/order";
        };
        readonly SUCCESS_CODES: readonly (number | string)[];
    };
    readonly DEFAULTS: {
        readonly CURRENCY: "HKD";
    };
    readonly TIMEOUTS: {
        readonly REQUEST: 30000;
    };
    readonly VERSION: "1.0";
    readonly META_DATA: {
        readonly version: "1.0";
    };
};
