"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./orderRedirect.module.scss";
import api from "@/axiosInstance/axiosInstance";
import { db } from "@/lib/db";

const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 60 * 1000;

export default function HandlePaymentRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");

  const pollingRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const [status, setStatus] = useState("processing");

  // ✅ CHECK ORDER STATUS
  const checkOrderStatus = async () => {
    try {
      const response = await api.get(
        `/v1/payment/order-status?orderId=${orderId}`,
        {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          },
        }
      );

      console.log("ORDER STATUS RESPONSE:", response.data);

      if (!response.data?.success) return;

      const orderStatus = response.data.data.status;
      console.log("ORDER STATUS:", orderStatus);

      // ✅ SUCCESS
      if (orderStatus === "confirmed") {
        clearInterval(pollingRef.current);

        setStatus("confirmed");

        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("pendingCashfreeOrderId");
        localStorage.removeItem("pendingOrderAmount");

        await db.cart.clear();
        return;
      }

      // ❌ FAILED
      if (orderStatus === "failed" || orderStatus === "cancelled") {
        clearInterval(pollingRef.current);
        setStatus("failed");
        return;
      }

      // ⏱ TIMEOUT CHECK
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > MAX_POLLING_TIME) {
        clearInterval(pollingRef.current);
        setStatus("timeout");
      }
    } catch (error) {
      console.error("Order status error:", error);
      clearInterval(pollingRef.current);
      setStatus("error");
    }
  };

  // 🔁 START POLLING
  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      router.push("/cart");
      return;
    }

    // check immediately
    checkOrderStatus();

    pollingRef.current = setInterval(
      checkOrderStatus,
      POLLING_INTERVAL
    );

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  return (
    <div className={styles.container}>
      {/* PROCESSING */}
      {status === "processing" && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <h2>Processing Payment</h2>
          <p>Please wait while we confirm your payment</p>
        </div>
      )}

      {/* ✅ SUCCESS */}
      {status === "confirmed" && (
        <div className={styles.successSlide}>
          <div className={styles.successIcon}>✓</div>
          <h2>Payment Successful</h2>
          <p>Your order has been placed successfully.</p>

          <div className={styles.successActions}>
            <button onClick={() => router.push("/orders")}>
              View Orders
            </button>
            <button onClick={() => router.push("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* ❌ FAILED */}
      {status === "failed" && (
        <div className={styles.failed}>
          <div className={styles.failedIcon}>✕</div>
          <h2>Payment Failed</h2>
          <p>Redirecting to cart...</p>
        </div>
      )}

      {/* ⏱ TIMEOUT */}
      {status === "timeout" && (
        <div className={styles.timeout}>
          <div className={styles.timeoutIcon}>⏱</div>
          <h2>Verification Pending</h2>
          <p>Please check your orders page.</p>
          <button onClick={() => router.push("/orders")}>
            Go to Orders
          </button>
        </div>
      )}

      {/* ⚠ ERROR */}
      {status === "error" && (
        <div className={styles.error}>
          <div className={styles.errorIcon}>!</div>
          <h2>Something went wrong</h2>
          <p>Redirecting to cart...</p>
        </div>
      )}
    </div>
  );
}
