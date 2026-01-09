"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import styles from "./handlePaymentRedirect.module.scss";
import axios from "axios";
import { db } from "@/lib/indexedDb";



const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 60 * 1000;

export default function HandlePaymentRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [status, setStatus] = useState<PaymentStatus>("processing");

  // ✅ CHECK ORDER STATUS
  const checkOrderStatus = async () => {
    try {
      if (!orderId) throw new Error("Order ID missing");

      const { data } = await axios.get(
        `/api/payment/status?orderId=${orderId}`
      );

      const orderStatus = data?.status;

      // 🟢 CONFIRMED
      if (orderStatus === "confirmed") {
        if (pollingRef.current) clearInterval(pollingRef.current);

        setStatus("confirmed");
        toast.success("Payment successful!");

        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("pendingCashfreeOrderId");
        localStorage.removeItem("pendingOrderAmount");

        await db.cart.clear();
        return;
      }

      // 🔴 FAILED
      if (orderStatus === "failed") {
        if (pollingRef.current) clearInterval(pollingRef.current);

        setStatus("failed");
        toast.error("Payment failed");

        setTimeout(() => router.push("/cart"), 2500);
        return;
      }

      // ⏱ TIMEOUT
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > MAX_POLLING_TIME) {
        if (pollingRef.current) clearInterval(pollingRef.current);

        setStatus("timeout");
        toast("Payment verification in progress", { icon: "⏱" });
      }
    } catch (error) {
      console.error("Payment Status Error:", error);

      if (pollingRef.current) clearInterval(pollingRef.current);

      setStatus("error");
      toast.error("Something went wrong");

      setTimeout(() => router.push("/cart"), 2000);
    }
  };

  // 🔁 START POLLING
  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      toast.error("Invalid payment redirect");
      router.push("/cart");
      return;
    }

    pollingRef.current = setInterval(checkOrderStatus, POLLING_INTERVAL);

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

      {/* ✅ SUCCESS SLIDE */}
      {status === "confirmed" && (
        <div className={styles.successSlide}>
          <div className={styles.successIcon}>✓</div>

          <h2 className={styles.successTitle}>Payment Successful</h2>
          <p className={styles.successSubtitle}>
            Your order has been placed successfully.
          </p>

          <div className={styles.successActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push("/orders")}
            >
              View Orders
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push("/")}
            >
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
          <p>Please check your orders page after some time.</p>

          <button
            className={styles.primaryBtn}
            onClick={() => router.push("/orders")}
          >
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
