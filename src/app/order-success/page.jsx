import OrderSuccess from "@/component/OrderSuccess/OrderSuccess";
import React, { Suspense } from "react";

const OrderSuccessPage = () => {
  return (
    <div>
      <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
        <OrderSuccess />
      </Suspense>
    </div>
  );
};

export default OrderSuccessPage;
