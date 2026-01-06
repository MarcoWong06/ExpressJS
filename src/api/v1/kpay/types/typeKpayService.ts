import { CreateAllHostedCheckoutOrderRequest, CreateAllHostedCheckoutOrderResponse } from "./typeKpayCreateOrder";
import { PaymentRefundRequest, PaymentRefundResponse } from "./typeKpayPaymentRefund";
import { QueryAllHostedCheckoutOrderRequest, QueryAllHostedCheckoutOrderResponse } from "./typeKpayQueryOrder";
import { QueryPaymentOrderRequest, QueryPaymentOrderResponse } from "./typeKpayQueryPayment";

export type Request =
  | CreateAllHostedCheckoutOrderRequest
  | QueryAllHostedCheckoutOrderRequest
  | QueryPaymentOrderRequest
  | PaymentRefundRequest;
export type Response =
  | CreateAllHostedCheckoutOrderResponse
  | QueryAllHostedCheckoutOrderResponse
  | QueryPaymentOrderResponse
  | PaymentRefundResponse;
