import jsrsasign from "jsrsasign";
const formatPrivateKey = (privateKey) => {
    if (privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        return privateKey;
    }
    return `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
};
export const generateSignature = ({ requestMethod, requestUri, timestamp, nonceStr, merchantCode, body, }, kpayApiKey) => {
    try {
        const signString = `${requestMethod}\n${requestUri}\n${timestamp}\n${nonceStr}\n${merchantCode}\n${body}\n`;
        const formattedPrivateKey = formatPrivateKey(kpayApiKey);
        const sha256withrsa = new jsrsasign.KJUR.crypto.Signature({
            alg: "SHA256withRSA",
        });
        sha256withrsa.init(formattedPrivateKey);
        sha256withrsa.updateString(signString);
        return jsrsasign.hextob64(sha256withrsa.sign());
    }
    catch (error) {
        console.error("Signature generation failed:", error);
        throw new Error("Failed to generate signature");
    }
};
export const generateTimestampAndNonce = () => ({
    timestamp: Date.now(),
    nonceStr: Math.random().toString(36).substring(2, 34),
});
export const createCheckoutUrl = (managedOrderNo, language, baseUrl, merchantCode, nonceStr, timestamp, signature) => {
    const params = new URLSearchParams({
        managedOrderNo,
        language,
        "K-Merchant-Code": merchantCode,
        "K-Nonce-Str": nonceStr,
        "K-Timestamp": timestamp.toString(),
        "K-Signature": signature,
    });
    return `${baseUrl}?${params.toString()}`;
};
//# sourceMappingURL=crypto.js.map