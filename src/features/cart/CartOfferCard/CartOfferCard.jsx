"use client";

import React, { useEffect, useState } from "react";
import styles from "./cartOfferCard.module.scss";

const NAMES = ["Priya", "Rahul", "Meena", "Aisha", "Kabir", "Simran"];
const TOTAL_SLOTS = 7;
const INITIAL_SECONDS = 14 * 60 + 55;
const INITIAL_CLAIMED = 4;

const CartOfferCard = ({ onClaim }) => {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [claimed, setClaimed] = useState(INITIAL_CLAIMED);
  const [toast, setToast] = useState(null);
  const [barPulse, setBarPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setClaimed((current) => {
        if (current >= TOTAL_SLOTS - 1) return current;
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        setToast(`🎉 ${name} just claimed a free slot!`);
        setBarPulse(true);
        setTimeout(() => setBarPulse(false), 900);
        setTimeout(() => setToast(null), 2600);
        return current + 1;
      });
    }, 5200);
    return () => clearInterval(tick);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const slotsLeft = TOTAL_SLOTS - claimed;
  const pct = Math.round((claimed / TOTAL_SLOTS) * 100);

  const handleClaim = () => {
    setToast("🎉 Free personalisation applied! Complete your order.");
    setTimeout(() => setToast(null), 2600);
    onClaim?.();
  };

  return (
    <div className={styles.card}>
        <span className={styles.sparkleA} aria-hidden>
          ✦
        </span>
        <span className={styles.sparkleB} aria-hidden>
          ✧
        </span>

        <div className={styles.header}>
          <span className={styles.liveLabel}>
            <span className={styles.liveDot} />
            FREE PERSONALISATION
          </span>
          <span className={styles.timer}>⏱ {mm}:{ss}</span>
        </div>

        <div className={styles.bodyRow}>
          <span className={styles.gift} aria-hidden>
            🎁
          </span>
          <div className={styles.bodyCopy}>
            <div className={styles.title}>Add your word or emotion, free</div>
            <div className={styles.subtitle}>
              Worth ₹199 · auto-applied at checkout
            </div>
          </div>
          <span className={styles.slotsBadge}>{slotsLeft} left</span>
        </div>

        {toast ? <div className={styles.toast}>{toast}</div> : null}

        <div
          className={`${styles.barTrack} ${barPulse ? styles.barTrackPulse : ""}`}
        >
          <div className={styles.barFill} style={{ width: `${pct}%` }}>
            <div className={styles.barShimmer} />
          </div>
        </div>
        <div className={styles.claimedText}>
          {claimed}/{TOTAL_SLOTS} claimed
        </div>

        <button type="button" className={styles.cta} onClick={handleClaim}>
          <span className={styles.ctaShine} aria-hidden />
          <span className={styles.ctaText}>Claim free — was ₹199 →</span>
        </button>
    </div>
  );
};

export default CartOfferCard;
