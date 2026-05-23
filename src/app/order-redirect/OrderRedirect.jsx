"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "@/lib/db";
import {
  PAYMENT_METHOD,
  buildVerifyPaymentPayload,
  clearPendingOrderStorage,
  fetchOrderStatus,
  verifyPayment,
} from "@/lib/payment";
import styles from "./orderRedirect.module.scss";

export default function OrderRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");
  const [partialSummary, setPartialSummary] = useState(null);

  const pollingRef = useRef(null);
  const attemptsRef = useRef(0);
  const maxAttempts = 15;

  const handleSuccess = async (orderId) => {
    clearInterval(pollingRef.current);
    setStatus("success");
    localStorage.setItem("orderId", orderId);
    clearPendingOrderStorage();
    await db.cart.clear();
    setLoading(false);
  };

  const handleFailure = () => {
    clearInterval(pollingRef.current);
    setStatus("failed");
    toast.error("Payment failed or cancelled");
    clearPendingOrderStorage();
    setLoading(false);
  };

  const checkOrderStatus = async (orderId) => {
    try {
      const response = await fetchOrderStatus(orderId);
      if (!response?.success) return;

      const orderData = response.data;
      const orderStatus = orderData.status;

      if (orderStatus === "confirmed") {
        if (orderData.paymentMethod === PAYMENT_METHOD.PARTIAL_COD) {
          setPartialSummary({
            advanceAmount:
              orderData.advanceAmount ??
              localStorage.getItem("pendingAdvanceAmount"),
            codAmount:
              orderData.codAmount ?? localStorage.getItem("pendingCodAmount"),
            totalAmount: orderData.totalAmount,
          });
        }
        await handleSuccess(orderData.orderId || orderId);
      }

      if (orderStatus === "failed" || orderStatus === "cancelled") {
        handleFailure();
      }
    } catch (error) {
      console.error("Order status check failed", error);
    }
  };

  const pollOrderStatus = (orderId) => {
    attemptsRef.current = 0;
    checkOrderStatus(orderId);

    pollingRef.current = setInterval(() => {
      attemptsRef.current += 1;

      if (attemptsRef.current >= maxAttempts) {
        clearInterval(pollingRef.current);
        setStatus("timeout");
        setLoading(false);
        return;
      }

      checkOrderStatus(orderId);
    }, 1000);
  };

  useEffect(() => {
    const backendOrderId =
      searchParams.get("backend_order_id") ||
      localStorage.getItem("pendingOrderId");

    if (!backendOrderId) {
      queueMicrotask(() => {
        toast.error("Order information not found");
        setStatus("error");
        setLoading(false);
      });
      return undefined;
    }

    const pendingMethod = localStorage.getItem("pendingPaymentMethod");
    if (pendingMethod === PAYMENT_METHOD.PARTIAL_COD) {
      setPartialSummary({
        advanceAmount: localStorage.getItem("pendingAdvanceAmount"),
        codAmount: localStorage.getItem("pendingCodAmount"),
      });
    }

    let cancelled = false;

    const run = async () => {
      try {
        const verifyPayload = buildVerifyPaymentPayload(
          searchParams,
          backendOrderId
        );
        const txStatus = (verifyPayload.txStatus || "").toUpperCase();

        if (txStatus && txStatus !== "SUCCESS") {
          handleFailure();
          return;
        }

        const verifyResult = await verifyPayment(verifyPayload);
        if (verifyResult?.status === "confirmed") {
          if (pendingMethod === PAYMENT_METHOD.PARTIAL_COD) {
            setPartialSummary({
              advanceAmount:
                verifyResult.advanceAmount ??
                localStorage.getItem("pendingAdvanceAmount"),
              codAmount:
                verifyResult.codAmount ??
                localStorage.getItem("pendingCodAmount"),
              totalAmount: verifyResult.totalAmount,
            });
          }
          if (!cancelled) {
            await handleSuccess(verifyResult.orderId || backendOrderId);
          }
          return;
        }
      } catch (error) {
        console.error("Payment verify failed, falling back to polling", error);
      }

      if (!cancelled) {
        pollOrderStatus(backendOrderId);
      }
    };

    queueMicrotask(() => {
      if (!cancelled) void run();
    });

    return () => {
      cancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [searchParams]);

  const isPartialCod =
    partialSummary?.advanceAmount != null && partialSummary?.codAmount != null;

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.card}>
        {loading && status === "processing" && (
          <div className={styles.content}>
            <div className={styles.spinner} />
            <h2>Processing Payment</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        )}

        {status === "success" && (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✓</div>
            <h2>Payment Successful!</h2>

            {isPartialCod && (
              <div className={styles.partialCodSuccess}>
                <p>₹{partialSummary.advanceAmount} paid online</p>
                <p>₹{partialSummary.codAmount} to be collected on delivery</p>
                {partialSummary.totalAmount != null && (
                  <p className={styles.partialCodTotal}>
                    Order total: ₹{partialSummary.totalAmount}
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => router.push("/orders")}
                style={primaryBtn}
              >
                View Orders
              </button>

              <button onClick={() => router.push("/")} style={secondaryBtn}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className={styles.failedContent}>
            <div className={styles.failedIcon}>✕</div>
            <h2>Payment Failed</h2>

            <div style={{ marginTop: "20px" }}>
              <button onClick={() => router.push("/")} style={primaryBtn}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {status === "timeout" && (
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⏱</div>
            <h2>Payment Pending</h2>
            <p>
              We could not confirm your payment yet. If money was deducted,
              check your orders or contact support.
            </p>

            <button onClick={() => router.push("/orders")} style={primaryBtn}>
              View Orders
            </button>
          </div>
        )}

        {status === "error" && (
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>!</div>
            <h2>Something went wrong</h2>

            <button
              onClick={() => router.push("/")}
              style={{ ...primaryBtn, marginTop: "16px" }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: "12px",
  backgroundColor: "#ff6b00",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

const secondaryBtn = {
  padding: "12px",
  backgroundColor: "#95a5a6",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};
