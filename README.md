# KPay API Endpoint

A TypeScript Express.js API service for integrating with KPay payment gateway to create hosted checkout orders. This service provides a secure interface for generating payment checkout URLs with proper signature authentication.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MarcoWong06/kpay-api-endpoint.git
cd kpay-api-endpoint
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).

## Available Endpoints

The API provides two main endpoints:

1. **`POST /api/v1/kpay/checkout`** - Create a new hosted checkout order and get a payment URL
2. **`POST /api/v1/kpay/result`** - Query order status and payment result details

## API Documentation

### 1. Create Hosted Checkout Order

Creates a new hosted checkout order and returns a secure checkout URL.

**Endpoint:** `POST /api/v1/kpay/checkout`

**Request Body:**

```typescript
{
  metaData: {
    language: "en_US" | "zh_CN" | "zh_HK",    // Language preference
    kpayApiKey: string,                        // RSA private key for signature
    merchantIcon: string | null,               // Merchant icon URL
    merchantCode: string,                      // KPay merchant code
    notifyUrl: string | null,                  // Payment notification URL
    returnUrl: string | null                   // Return URL after payment
  },
  dataContent: {
    payAmount: number,                         // Exact payment amount (positive number)
    discountAmount: number | null,             // Discount amount (optional)
    orderRemark: string | null,                // Order remarks
    itemNo: string,                           // Item number/SKU
    itemName: string,                         // Item name
    itemIcon: string | null,                  // Item icon URL
    quantity: number,                         // Item quantity
    firstName: string | null,                 // Customer first name
    lastName: string | null,                  // Customer last name
    email: string | null,                     // Customer email
    phone: string | null                      // Customer phone
  }
}
```

**Success Response (200):**

```json
{
  "resultType": "SUCCESS",
  "resultMessage": "Hosted checkout order created successfully",
  "dataContent": {
    "managedOrderNo": "KP202411040001",
    "managedOutTradeNo": "order_1730707200000",
    "checkoutUrl": "https://payment.uat.kpay-group.com/v1/web/managed/order?..."
  },
  "metaData": {
    "version": "1.0.0"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Validation Error: Missing required field: merchantCode",
  "metaData": {
    "version": "1.0.0"
  }
}
```

- **502 Bad Gateway** - KPay API errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Payment API Error: Failed to create order: Invalid merchant code",
  "metaData": {
    "version": "1.0.0"
  }
}
```

- **500 Internal Server Error** - Server errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Internal Server Error: Unknown error occurred",
  "metaData": {
    "version": "1.0.0"
  }
}
```

### 2. Query Order and Payment Result

Queries the status and payment details of a hosted checkout order using either `managedOrderNo` or `managedOutTradeNo`.

**Endpoint:** `POST /api/v1/kpay/result`

**Request Body:**

```typescript
{
  metaData: {
    language: "en_US" | "zh_CN" | "zh_HK",    // Language preference
    kpayApiKey: string,                        // RSA private key for signature
    merchantCode: string                       // KPay merchant code
  },
  dataContent: {
    managedOrderNo?: string,                   // KPay managed order number (optional if managedOutTradeNo provided)
    managedOutTradeNo?: string                 // Merchant order trade number (optional if managedOrderNo provided)
  }
}
```

**Note:** At least one of `managedOrderNo` or `managedOutTradeNo` must be provided.

**Success Response (200) - With Payment Data:**

```json
{
  "resultType": "SUCCESS",
  "resultMessage": "Order and Payment information retrieved successfully",
  "dataContent": {
    "merchantCode": "your_merchant_code",
    "managedOrderNo": "KP202411040001",
    "managedOutTradeNo": "order_1730707200000",
    "payAmount": 100.00,
    "payCurrency": "HKD",
    "managedOrderState": "ORDER_PAID",
    "outTradeNo": "merchant_payment_001",
    "orderNo": "KP_ORDER_001",
    "transactionNo": "TXN123456789",
    "transactionAccount": "user@example.com",
    "payMethodId": "CREDIT_CARD",
    "transactionTypeId": "PAYMENT",
    "cardOrganizationId": "VISA",
    "walletType": "DIGITAL_WALLET",
    "channelSerialNo": "CH123456",
    "localPayAmount": 100.00,
    "localPayCurrency": "HKD",
    "transactionFinishTime": "2024-11-04T10:30:00Z",
    "result": "SUCCESSFULLY_PROCESSED",
    "reason": "Payment completed successfully",
    "orderState": "ORDER_PLACED_SUCCESSFULLY"
  },
  "metaData": {
    "version": "1.0.0"
  }
}
```

**Success Response (200) - Without Payment Data:**

```json
{
  "resultType": "SUCCESS",
  "resultMessage": "Order information retrieved successfully, but no valid payment data found",
  "dataContent": {
    "merchantCode": "your_merchant_code",
    "managedOrderNo": "KP202411040001",
    "managedOutTradeNo": "order_1730707200000",
    "payAmount": 100.00,
    "payCurrency": "HKD",
    "managedOrderState": "ORDER_NOT_PAID"
  },
  "metaData": {
    "version": "1.0.0"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Validation Error: Either managedOrderNo or managedOutTradeNo must be provided in metaData",
  "metaData": {
    "version": "1.0.0"
  }
}
```

- **502 Bad Gateway** - KPay API errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Payment API Error: Failed to query order: Order not found",
  "metaData": {
    "version": "1.0.0"
  }
}
```

- **500 Internal Server Error** - Server errors

```json
{
  "resultType": "ERROR",
  "resultMessage": "Internal Server Error: Unknown error occurred",
  "metaData": {
    "version": "1.0.0"
  }
}
```

## API Flow Diagram

### 1. Create Hosted Checkout Order Flow

The following sequence diagram illustrates the complete flow of the `/api/v1/kpay/checkout` endpoint:

```mermaid
sequenceDiagram
    actor Client
    participant Server as Express Server
    participant Router as Checkout Router
    participant Controller as Checkout Controller
    participant Validation as Validation Middleware
    participant Crypto as Crypto Utils
    participant KPay as KPayService
    participant API as KPay API

    Client->>Server: POST /api/v1/kpay/checkout
    Server->>Router: Route request
    Router->>Controller: checkoutController(req, res)
    
    Controller->>Validation: validateOrderRequest(req.body)
    Validation->>Validation: Check metaData & dataContent objects
    Validation->>Validation: Validate required fields
    Validation->>Validation: Validate payAmount > 0
    Validation->>Validation: Validate discountAmount >= 0
    Validation->>Validation: Validate email format (if provided)
    Validation->>Validation: Validate phone format (if provided)
    
    alt Invalid data
        Validation-->>Controller: throw ValidationError
        Controller-->>Client: 400 Bad Request<br/>{resultType: "ERROR", resultMessage: "Validation Error"}
    end
    
    Validation-->>Controller: Validation passed
    
    Controller->>Controller: createOrderRequestBody(req.body)
    Note right of Controller: Creates order with<br/>auto-generated managedOutTradeNo
    
    Controller->>KPay: new KPayService(baseURL, endpoint)
    Controller->>Crypto: generateTimestampAndNonce()
    Crypto-->>Controller: {timestamp, nonceStr}
    
    Controller->>Crypto: generateSignature(params, kpayApiKey)
    Note right of Crypto: POST signature with:<br/>requestMethod + endpoint<br/>+ timestamp + nonceStr<br/>+ merchantCode + body
    Crypto->>Crypto: Sign with RSA SHA256 using private key
    Crypto-->>Controller: signature
    
    Controller->>KPay: post(orderRequest, merchantCode, kpayApiKey, language)
    KPay->>API: POST /v1/managed/order/add
    Note right of API: Headers include:<br/>K-Merchant-Code<br/>K-Nonce-Str<br/>K-Timestamp<br/>K-Signature<br/>K-Language
    
    alt API Error
        API-->>KPay: Error response
        KPay-->>Controller: throw KPayApiError
        Controller-->>Client: 502 Bad Gateway<br/>{resultType: "ERROR", resultMessage: "Payment API Error"}
    end
    
    API-->>KPay: Success response<br/>{code, message, data: {managedOrderNo}}
    KPay-->>Controller: managedOrder data
    
    Controller->>Controller: Extract managedOrderNo
    
    Controller->>Crypto: generateTimestampAndNonce()
    Crypto-->>Controller: {timestamp, nonceStr}
    
    Controller->>Controller: Build checkout URL with params
    Note right of Controller: managedOrderNo, language<br/>K-Merchant-Code<br/>K-Nonce-Str, K-Timestamp
    
    Controller->>Crypto: generateSignature(checkoutParams, kpayApiKey)
    Note right of Crypto: GET signature for<br/>checkout URL access
    Crypto-->>Controller: checkoutSignature
    
    Controller->>Controller: Append K-Signature to URL
    
    Controller-->>Client: 200 OK<br/>{resultType: "SUCCESS",<br/>dataContent: {managedOrderNo,<br/>managedOutTradeNo, checkoutUrl}}
```

### 2. Query Order and Payment Result Flow

The following sequence diagram illustrates the complete flow of the `/api/v1/kpay/result` endpoint:

```mermaid
sequenceDiagram
    actor Client
    participant Server as Express Server
    participant Router as Result Router
    participant Controller as Result Controller
    participant Validation as Validation Middleware
    participant Crypto as Crypto Utils
    participant KPay as KPayService
    participant OrderAPI as KPay Order Query API
    participant PaymentAPI as KPay Payment Query API

    Client->>Server: POST /api/v1/kpay/result
    Server->>Router: Route request
    Router->>Controller: resultController(req, res)
    
    Controller->>Validation: validateResultRequest(req.body)
    Validation->>Validation: Check metaData & dataContent objects
    Validation->>Validation: Validate managedOrderNo or managedOutTradeNo exists
    
    alt Invalid data
        Validation-->>Controller: throw ValidationError
        Controller-->>Client: 400 Bad Request<br/>{resultType: "ERROR", resultMessage: "Validation Error"}
    end
    
    Validation-->>Controller: Validation passed
    
    Controller->>KPay: new KPayService(baseURL, queryCheckoutOrderEndpoint)
    
    Controller->>Crypto: generateTimestampAndNonce()
    Crypto-->>Controller: {timestamp, nonceStr}
    
    Controller->>Crypto: generateSignature(params, kpayApiKey)
    Note right of Crypto: GET signature with:<br/>requestMethod + endpoint<br/>+ timestamp + nonceStr<br/>+ merchantCode
    Crypto-->>Controller: signature
    
    Controller->>KPay: get({managedOrderNo, managedOutTradeNo}, ...)
    KPay->>OrderAPI: GET /v1/managed/order/result
    Note right of OrderAPI: Headers include:<br/>K-Merchant-Code<br/>K-Nonce-Str<br/>K-Timestamp<br/>K-Signature<br/>K-Language
    
    alt API Error
        OrderAPI-->>KPay: Error response
        KPay-->>Controller: throw KPayApiError
        Controller-->>Client: 502 Bad Gateway<br/>{resultType: "ERROR", resultMessage: "Payment API Error"}
    end
    
    OrderAPI-->>KPay: Success response<br/>{code, message, data: {orderData, paymentOrderList}}
    KPay-->>Controller: orderData
    
    Controller->>Controller: Filter paymentOrderList for successful payment
    
    alt No valid payment found
        Controller-->>Client: 200 OK<br/>{resultType: "SUCCESS",<br/>resultMessage: "...no valid payment data found",<br/>dataContent: {basic order info}}
    end
    
    Controller->>Controller: Extract paymentOrder details
    
    Controller->>KPay: new KPayService(baseURL, queryPaymentOrderEndpoint)
    
    Controller->>Crypto: generateTimestampAndNonce()
    Crypto-->>Controller: {timestamp, nonceStr}
    
    Controller->>Crypto: generateSignature(paymentParams, kpayApiKey)
    Crypto-->>Controller: paymentSignature
    
    Controller->>KPay: get({outTradeNo, orderNo}, ...)
    KPay->>PaymentAPI: GET /v1/order/sales/result
    
    alt Payment API Error
        PaymentAPI-->>KPay: Error response
        KPay-->>Controller: throw KPayApiError
        Controller-->>Client: 502 Bad Gateway<br/>{resultType: "ERROR", resultMessage: "Payment API Error"}
    end
    
    PaymentAPI-->>KPay: Success response<br/>{code, message, data: {paymentDetails}}
    KPay-->>Controller: paymentData
    
    Controller->>Controller: Combine order and payment data
    
    Controller-->>Client: 200 OK<br/>{resultType: "SUCCESS",<br/>dataContent: {complete order and payment info}}
```

### Flow Description

#### Create Checkout Order Flow

The API endpoint follows these key steps:

1. **Request Validation** - Validates required fields, data types, and business rules
2. **Order Preparation** - Creates the order request body with auto-generated trade number
3. **First Signature Generation** - Generates RSA SHA256 signature for order creation API call
4. **KPay API Integration** - Calls external KPay API to create the hosted checkout order
5. **Second Signature Generation** - Generates another signature for checkout URL access
6. **Checkout URL Creation** - Builds the final authenticated checkout URL
7. **Response** - Returns the checkout URL to the client

The process involves two separate signature generations: one for creating the order via API, and another for generating the secure checkout URL that customers will use to complete their payment.

#### Query Order Result Flow

The query endpoint follows these key steps:

1. **Request Validation** - Validates that either `managedOrderNo` or `managedOutTradeNo` is provided
2. **First Signature Generation** - Generates RSA SHA256 signature for order query API call
3. **Order Query** - Calls KPay API to retrieve order information and payment order list
4. **Payment Filtering** - Filters the payment order list to find successfully processed payments
5. **Conditional Flow**:
   - If no valid payment found: Returns basic order information only
   - If valid payment found: Proceeds to query detailed payment information
6. **Second Signature Generation** - Generates another signature for payment query API call
7. **Payment Query** - Calls KPay API to retrieve detailed payment information
8. **Data Aggregation** - Combines order and payment data into a comprehensive response
9. **Response** - Returns complete order and payment information to the client

The process involves two separate API calls when payment data is available: one to query the order status, and another to retrieve detailed payment transaction information.

## Project Structure

```text
src/
├── server-index.ts             # Main server entry point
├── api/
│   ├── index.ts               # API router
│   └── v1/
│       └── kpay/
│           ├── index.ts                    # KPay API router
│           ├── config/
│           │   └── constants.ts           # Configuration constants
│           ├── controller/
│           │   ├── checkout.controller.ts # Checkout controller
│           │   └── result.controller.ts   # Result query controller
│           ├── middleware/
│           │   ├── error.middleware.ts    # Error handling
│           │   └── validation.middleware.ts # Request validation
│           ├── routes/
│           │   ├── checkout.routes.ts     # Checkout routes
│           │   └── result.routes.ts       # Result query routes
│           ├── services/
│           │   └── kpay.service.ts        # KPay API service
│           ├── types/
│           │   ├── typeCheckout.ts        # Checkout type definitions
│           │   ├── typeKpayApi.ts         # KPay API types
│           │   ├── typeKpayCreateOrder.ts # Order creation types
│           │   ├── typeKpayQueryOrder.ts  # Order query types
│           │   ├── typeKpayQueryPayment.ts # Payment query types
│           │   └── typeResult.ts          # Result types
│           └── utils/
│               └── crypto.utils.ts        # Cryptographic utilities
```

## Configuration

The application uses a centralized configuration system in `src/api/v1/kpay/config/constants.ts`:

```typescript
export const CONFIG = {
  API: {
    BASE_URL: "https://payment.uat.kpay-group.com",
    ENDPOINTS: {
      CREATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/add",
      GENERATE_ALL_HOSTED_CHECKOUT_ORDER: "/v1/web/managed/order",
      QUERY_ALL_HOSTED_CHECKOUT_ORDER: "/v1/managed/order/result",
      QUERY_PAYMENT_ORDER: "/v1/order/sales/result",
    },
    SUCCESS_CODES: [10000, "10000"],
  },
  DEFAULTS: {
    CURRENCY: "HKD",
  },
  TIMEOUTS: {
    REQUEST: 30000,
  },
  VERSION: "1.0",
  META_DATA: { version: "1.0" },
};
```

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build with watch mode
- `npm run clean` - Clean build directory
- `npm start` - Start production server

## Error Handling

The application implements comprehensive error handling:

### Custom Error Classes

- `ValidationError` - Input validation failures
- `KPayApiError` - KPay API communication errors

### Error Flow

1. **Request Validation** - Validates input before processing
2. **API Communication** - Handles KPay API errors with proper status codes
3. **Response Formatting** - Returns consistent error response format

## Example Usage

### 1. Create Hosted Checkout Order

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/kpay/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "metaData": {
      "language": "en_US",
      "kpayApiKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
      "merchantCode": "your_merchant_code",
      "merchantIcon": null,
      "notifyUrl": "https://your-site.com/notify",
      "returnUrl": "https://your-site.com/return"
    },
    "dataContent": {
      "payAmount": 100.00,
      "discountAmount": null,
      "orderRemark": "Test order",
      "itemNo": "ITEM001",
      "itemName": "Test Product",
      "itemIcon": null,
      "quantity": 1,
      "email": "customer@example.com",
      "phone": null,
      "firstName": null,
      "lastName": null
    }
  }'
```

#### JavaScript/Node.js Example

```javascript
const response = await fetch('http://localhost:3000/api/v1/kpay/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    metaData: {
      language: 'en_US',
      kpayApiKey: 'your_rsa_private_key',
      merchantCode: 'your_merchant_code',
      merchantIcon: null,
      notifyUrl: 'https://your-site.com/notify',
      returnUrl: 'https://your-site.com/return'
    },
    dataContent: {
      payAmount: 100.00,
      discountAmount: null,
      orderRemark: 'Test order',
      itemNo: 'ITEM001',
      itemName: 'Test Product',
      itemIcon: null,
      quantity: 1,
      email: 'customer@example.com',
      phone: null,
      firstName: null,
      lastName: null
    }
  })
});

const data = await response.json();
console.log('Checkout URL:', data.dataContent.checkoutUrl);
console.log('Order Number:', data.dataContent.managedOrderNo);
```

### 2. Query Order and Payment Result

#### cURL Example

```bash
# Query by managedOrderNo
curl -X POST http://localhost:3000/api/v1/kpay/result \
  -H "Content-Type: application/json" \
  -d '{
    "metaData": {
      "language": "en_US",
      "kpayApiKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
      "merchantCode": "your_merchant_code"
    },
    "dataContent": {
      "managedOrderNo": "KP202411040001"
    }
  }'

# Or query by managedOutTradeNo
curl -X POST http://localhost:3000/api/v1/kpay/result \
  -H "Content-Type: application/json" \
  -d '{
    "metaData": {
      "language": "en_US",
      "kpayApiKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
      "merchantCode": "your_merchant_code"
    },
    "dataContent": {
      "managedOutTradeNo": "order_1730707200000"
    }
  }'
```

#### JavaScript/Node.js Example

```javascript
// Query by managedOrderNo
const response = await fetch('http://localhost:3000/api/v1/kpay/result', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    metaData: {
      language: 'en_US',
      kpayApiKey: 'your_rsa_private_key',
      merchantCode: 'your_merchant_code'
    },
    dataContent: {
      managedOrderNo: 'KP202411040001'
    }
  })
});

const data = await response.json();
if (data.resultType === 'SUCCESS') {
  console.log('Order Status:', data.dataContent.managedOrderState);
  console.log('Pay Amount:', data.dataContent.payAmount);
  
  // Check if payment information is available
  if (data.dataContent.transactionNo) {
    console.log('Transaction No:', data.dataContent.transactionNo);
    console.log('Payment Method:', data.dataContent.payMethodId);
    console.log('Transaction Time:', data.dataContent.transactionFinishTime);
  }
}

// Or query by managedOutTradeNo
const response2 = await fetch('http://localhost:3000/api/v1/kpay/result', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    metaData: {
      language: 'en_US',
      kpayApiKey: 'your_rsa_private_key',
      merchantCode: 'your_merchant_code'
    },
    dataContent: {
      managedOutTradeNo: 'order_1730707200000'
    }
  })
});
```

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Author

### WONG, Sai Lung

- GitHub: [@MarcoWong06](https://github.com/MarcoWong06)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/MarcoWong06/kpay-api-endpoint/issues) on GitHub.
