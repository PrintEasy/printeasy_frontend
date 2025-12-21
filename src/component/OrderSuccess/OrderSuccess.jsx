"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "@/axiosInstance/axiosInstance";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const txStatus = searchParams.get("txStatus");

      if (!txStatus) {
        console.log("not found")
      }

      const payload = {
        orderId: searchParams.get("orderId"),
        cashfreeOrderId: searchParams.get("orderId"),
        orderAmount: searchParams.get("orderAmount"),
        referenceId: searchParams.get("referenceId"),
        txStatus,
        paymentMode: searchParams.get("paymentMode"),
        txMsg: searchParams.get("txMsg"),
        txTime: searchParams.get("txTime"),
        cashfreeSignature: searchParams.get("signature"),
      };

      try {
        await api.patch("/v1/payment/verify", payload, {
          headers: {
            "x-api-key":
              "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          },
        });

        await db.cart.clear();
        toast.success("Order Confirmed 🎉");
        setSuccess(true);
      } catch (error) {
        toast.error("Payment verification failed");
        setSuccess(false);
      } finally {
        setLoading(false);
        window.history.replaceState({}, "", "/order-success");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Verifying payment...</p>;
  }

  if (!success) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Payment Verification Failed</h2>
        <button onClick={() => router.push("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <ToastContainer />
      <h1>🎉 Order Confirmed</h1>
      <p>Your order has been placed successfully.</p>
      <button onClick={() => router.push("/orders")}>View Orders</button>
    </div>
  );
}
