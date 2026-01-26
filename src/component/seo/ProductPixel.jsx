"use client";
import { useEffect } from "react";

export default function ProductPixel({ product }) {
  useEffect(() => {
    if (!product?.id) return;

    window.fbq?.("track", "ViewContent", {
      content_ids: [product.id], // MUST match catalog ID
      content_type: "product",
      value: product.discountedPrice || product.basePrice,
      currency: "INR",
    });
  }, [product?.id]);

  return null;
}
