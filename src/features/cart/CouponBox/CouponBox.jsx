"use client";

import { useState } from "react";
import { TicketPercent, Check, X } from "lucide-react";
import styles from "./couponBox.module.scss";

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function CouponBox({
  appliedCode,
  discount = 0,
  percent,
  error,
  loading,
  onApply,
  onRemove,
}) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();
    onApply?.(value);
  };

  if (appliedCode) {
    return (
      <div className={styles.box}>
        <div className={styles.applied}>
          <div className={styles.appliedIcon}>
            <Check size={16} strokeWidth={3} />
          </div>
          <div className={styles.appliedBody}>
            <div className={styles.appliedCode}>{appliedCode}</div>
            <div className={styles.appliedSave}>
              {discount > 0
                ? !Number.isNaN(Number(percent)) && Number(percent) > 0
                  ? `${percent}% off · You saved ${formatINR(discount)}`
                  : `You saved ${formatINR(discount)}`
                : "Coupon applied"}
            </div>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={onRemove}
            aria-label="Remove coupon"
          >
            <X size={16} />
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <TicketPercent size={18} />
        <span>Have a coupon?</span>
      </div>
      <form className={styles.row} onSubmit={submit}>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          autoCapitalize="characters"
          autoComplete="off"
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.apply}
          disabled={loading || !value.trim()}
        >
          {loading ? "..." : "APPLY"}
        </button>
      </form>
      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
