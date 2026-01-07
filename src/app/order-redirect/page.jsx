import React, { Suspense } from "react";
import OrderRedirect from "./OrderRedirect";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading payment status...</div>}>
      <OrderRedirect />
    </Suspense>
  );
}
