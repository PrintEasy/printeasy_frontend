import React from "react";
import styles from "./pricelist.module.scss";
import { getApplicableRewards } from "@/lib/price";
import { PAYMENT_METHOD, estimatePartialCodAmounts } from "@/lib/payment";

const PriceList = ({
  bagTotal,
  grandTotal,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
  offerData,
  hasCustomizable,
  isSubmitting,
}) => {
  const { discount, freeDelivery } = getApplicableRewards(offerData, bagTotal);

  const shippingCost = freeDelivery ? 0 : 50;
  const finalPayable = Number((grandTotal + shippingCost - discount).toFixed(2));

  const partialEstimate =
    paymentMethod === PAYMENT_METHOD.PARTIAL_COD
      ? estimatePartialCodAmounts(finalPayable)
      : null;

  const payButtonLabel = (() => {
    if (paymentMethod === PAYMENT_METHOD.PARTIAL_COD && partialEstimate) {
      return `PAY ₹${partialEstimate.advanceAmount} NOW`;
    }
    if (paymentMethod === PAYMENT_METHOD.COD) {
      return "PLACE ORDER (COD)";
    }
    return `PAY ₹${finalPayable}`;
  })();

  return (
    <div className={styles.priceDetails}>
      <div className={styles.priceHeader}>
        <h2>Order Summary</h2>
      </div>

      <div className={styles.priceContent}>
        <div className={styles.priceRow}>
          <span>Bag Total</span>
          <span>₹{bagTotal}</span>
        </div>

        <div className={styles.priceRow}>
          <span>Shipping</span>
          {freeDelivery ? (
            <span className={styles.freePriceWrapper}>
              <strong className={styles.discountText}>Free</strong>
              <span className={styles.strikeValue}>₹50</span>
            </span>
          ) : (
            <span>₹50</span>
          )}
        </div>

        {discount > 0 && (
          <div className={`${styles.priceRow} ${styles.discountRow}`}>
            <span>Discount Applied</span>
            <span>- ₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className={styles.finalAmount}>
          <p>Total</p>
          <p>₹{finalPayable}</p>
        </div>

        {paymentMethod === PAYMENT_METHOD.PARTIAL_COD && partialEstimate && (
          <div className={styles.partialCodBreakdown}>
            <div className={styles.priceRow}>
              <span>Pay now ({partialEstimate.advancePercent}%)</span>
              <strong>₹{partialEstimate.advanceAmount}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Pay on delivery</span>
              <strong>₹{partialEstimate.codAmount}</strong>
            </div>
            <p className={styles.partialCodNote}>
              You will pay ₹{partialEstimate.advanceAmount} online via Cashfree.
              ₹{partialEstimate.codAmount} will be collected in cash on delivery.
            </p>
          </div>
        )}

        <div className={styles.paymentMethods}>
          <p className={styles.paymentMethodsTitle}>Payment method</p>

          <label className={styles.paymentOption}>
            <input
              type="radio"
              name="paymentMethod"
              value={PAYMENT_METHOD.ONLINE}
              checked={paymentMethod === PAYMENT_METHOD.ONLINE}
              onChange={() => onPaymentMethodChange(PAYMENT_METHOD.ONLINE)}
            />
            <span>Pay online (full amount)</span>
          </label>

          <label className={styles.paymentOption}>
            <input
              type="radio"
              name="paymentMethod"
              value={PAYMENT_METHOD.PARTIAL_COD}
              checked={paymentMethod === PAYMENT_METHOD.PARTIAL_COD}
              onChange={() =>
                onPaymentMethodChange(PAYMENT_METHOD.PARTIAL_COD)
              }
            />
            <span>Pay 25% now, rest on delivery</span>
          </label>

          {!hasCustomizable && (
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value={PAYMENT_METHOD.COD}
                checked={paymentMethod === PAYMENT_METHOD.COD}
                onChange={() => onPaymentMethodChange(PAYMENT_METHOD.COD)}
              />
              <span>Cash on delivery (full amount)</span>
            </label>
          )}
        </div>

        <button
          type="button"
          className={styles.payBtn}
          onClick={() => onPlaceOrder(paymentMethod, finalPayable)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "PLEASE WAIT..." : payButtonLabel}
        </button>
      </div>
    </div>
  );
};

export default PriceList;
