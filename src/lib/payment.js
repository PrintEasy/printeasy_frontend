import { load } from "@cashfreepayments/cashfree-js";
import api from "@/axiosInstance/axiosInstance";

export const PAYMENT_METHOD = {
  ONLINE: "ONLINE",
  COD: "COD",
  PARTIAL_COD: "PARTIAL_COD",
};

const API_KEY =
  "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10";

const DEFAULT_PARTIAL_ADVANCE_PERCENT = 25;

const apiHeaders = { "x-api-key": API_KEY };

/** @param {string | undefined} token */
export function getFirebaseUidFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.sub || null;
  } catch {
    return null;
  }
}

/** @param {import("@/types/orderPayment").Address | undefined} addr */
export function mapAddressForOrder(addr) {
  if (!addr) return undefined;
  return {
    name: addr.name,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    country: addr.country,
    pincode: addr.pincode,
    phone: addr.phone,
  };
}

/**
 * Client-side estimate before create (backend returns authoritative amounts).
 * @param {number} totalAmount
 * @param {number} [percent]
 */
export function estimatePartialCodAmounts(
  totalAmount,
  percent = DEFAULT_PARTIAL_ADVANCE_PERCENT
) {
  const advanceAmount = Math.round((totalAmount * percent) / 100);
  const codAmount = Math.max(0, Math.round(totalAmount - advanceAmount));
  return { advancePercent: percent, advanceAmount, codAmount };
}

/**
 * @param {import("@/types/orderPayment").CreateOrderPayload} payload
 * @returns {Promise<import("@/types/orderPayment").CreateOrderResponse>}
 */
export async function createOrder(payload) {
  const { paymentMethod, items, couponCode, user, totalAmount } = payload;

  const body = {
    paymentMethod,
    items,
    ...(couponCode ? { couponCode } : {}),
    ...(user ? { user } : {}),
    ...(totalAmount != null ? { totalAmount } : {}),
  };

  const res = await api.post("/v1/orders/create", body, { headers: apiHeaders });
  return res?.data?.data;
}

/** @param {import("@/types/orderPayment").CreateOrderResponse} orderData */
export function getCashfreeSessionError(orderData) {
  if (!orderData) return "Order could not be created.";
  if (orderData.__cashfree_error) return orderData.__cashfree_error;
  const needsCashfree =
    orderData.paymentMethod === PAYMENT_METHOD.ONLINE ||
    orderData.paymentMethod === PAYMENT_METHOD.PARTIAL_COD;
  if (needsCashfree && !orderData.cashfree?.sessionId) {
    return "Payment session not generated. Please check Cashfree configuration.";
  }
  return null;
}

/**
 * @param {import("@/types/orderPayment").CreateOrderResponse} orderData
 * @param {import("@/types/orderPayment").PaymentMethod} paymentMethod
 */
export function persistPendingOrder(orderData, paymentMethod) {
  const { orderId, cashfree, totalAmount, advanceAmount, codAmount } = orderData;

  localStorage.setItem("pendingOrderId", orderId);
  localStorage.setItem("pendingPaymentMethod", paymentMethod);

  if (cashfree?.orderId) {
    localStorage.setItem("pendingCashfreeOrderId", cashfree.orderId);
  }

  if (paymentMethod === PAYMENT_METHOD.PARTIAL_COD) {
    localStorage.setItem(
      "pendingOrderAmount",
      String(advanceAmount ?? totalAmount ?? "")
    );
    if (advanceAmount != null) {
      localStorage.setItem("pendingAdvanceAmount", String(advanceAmount));
    }
    if (codAmount != null) {
      localStorage.setItem("pendingCodAmount", String(codAmount));
    }
    if (orderData.advancePercent != null) {
      localStorage.setItem(
        "pendingAdvancePercent",
        String(orderData.advancePercent)
      );
    }
  } else {
    localStorage.setItem("pendingOrderAmount", String(totalAmount ?? ""));
    localStorage.removeItem("pendingAdvanceAmount");
    localStorage.removeItem("pendingCodAmount");
    localStorage.removeItem("pendingAdvancePercent");
  }
}

export function clearPendingOrderStorage() {
  localStorage.removeItem("pendingOrderId");
  localStorage.removeItem("pendingCashfreeOrderId");
  localStorage.removeItem("pendingOrderAmount");
  localStorage.removeItem("pendingPaymentMethod");
  localStorage.removeItem("pendingAdvanceAmount");
  localStorage.removeItem("pendingCodAmount");
  localStorage.removeItem("pendingAdvancePercent");
}

/** @param {string} paymentSessionId */
export async function launchCashfreeCheckout(paymentSessionId) {
  const cashfree = await load({ mode: "production" });
  return cashfree.checkout({
    paymentSessionId,
    redirect: true,
  });
}

/**
 * Build verify payload from Cashfree return URL + stored ids.
 * @param {URLSearchParams} searchParams
 * @param {string} backendOrderId
 */
export function buildVerifyPaymentPayload(searchParams, backendOrderId) {
  const pick = (...keys) => {
    for (const key of keys) {
      const v = searchParams.get(key);
      if (v != null && v !== "") return v;
    }
    return undefined;
  };

  const cashfreeOrderId =
    pick(
      "order_id",
      "cashfreeOrderId",
      "cf_order_id",
      "cfOrderId"
    ) || localStorage.getItem("pendingCashfreeOrderId") || undefined;

  const orderAmount =
    pick(
      "order_amount",
      "orderAmount",
      "orderAmountPaid",
      "amount"
    ) || localStorage.getItem("pendingOrderAmount") || undefined;

  return {
    orderId: backendOrderId,
    cashfreeOrderId,
    orderAmount,
    referenceId: pick(
      "reference_id",
      "referenceId",
      "cf_payment_id",
      "payment_id"
    ),
    txStatus:
      pick("txStatus", "tx_status", "payment_status", "status") || "SUCCESS",
    paymentMode: pick("paymentMode", "payment_mode", "payment_method"),
    txMsg: pick("txMsg", "tx_msg", "message"),
    txTime: pick("txTime", "tx_time", "payment_time"),
    cashfreeSignature: pick(
      "cashfreeSignature",
      "signature",
      "cf_signature"
    ),
  };
}

/**
 * @param {import("@/types/orderPayment").VerifyPaymentPayload} body
 */
export async function verifyPayment(body) {
  try {
    const res = await api.post("/v1/payment/verify", body, {
      headers: apiHeaders,
    });
    return res?.data?.data;
  } catch (postError) {
    const res = await api.patch("/v1/payment/verify", body, {
      headers: apiHeaders,
    });
    return res?.data?.data;
  }
}

/** @param {string} orderId */
export async function fetchOrderStatus(orderId) {
  const response = await api.get(`/v1/payment/order-status?orderId=${orderId}`, {
    headers: apiHeaders,
  });
  return response.data;
}

/** @param {string} orderId */
export async function fetchOrderById(orderId) {
  const res = await api.get(`/v1/orders/${orderId}`, { headers: apiHeaders });
  return res?.data?.data;
}

export function isPartialCodOrder(order) {
  return order?.paymentMethod === PAYMENT_METHOD.PARTIAL_COD;
}
