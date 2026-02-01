"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentClient() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");

  useEffect(() => {
    if (!sessionId) return;

    const initPayment = () => {
      const target = document.getElementById("cashfree-dropin");
      if (!target || !window.Cashfree) return;

      document.body.style.overflow = "hidden";

      const cashfree = new window.Cashfree({ mode: "production" });

      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: target, // ✅ MUST be DOM element
      });
    };

    // ensure DOM + script both are ready
    const timer = setTimeout(initPayment, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [sessionId]);

  return (
    <div
      id="cashfree-dropin"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#fff",
        zIndex: 9999,
        overflow: "hidden",
      }}
    />
  );
}
