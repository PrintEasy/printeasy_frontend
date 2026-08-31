"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart } from "lucide-react";
import styles from "./cartMobile.module.scss";
import CartOfferCard from "../CartOfferCard/CartOfferCard";
import { getApplicableRewards } from "@/lib/price";
import { PAYMENT_METHOD, estimatePartialCodAmounts } from "@/lib/payment";
import { getCartItemAttributeTags } from "@/lib/cartItemMeta";
import CouponBox from "../CouponBox/CouponBox";

const COD_FEE = 49;

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const CartMobile = ({
  cartItems,
  bagTotal,
  couponDiscount = 0,
  couponPercent,
  appliedCouponCode,
  couponError,
  couponLoading,
  onApplyCoupon,
  onRemoveCoupon,
  offerData,
  paymentMethod,
  onPaymentMethodChange,
  hasCustomizable,
  isSubmitting,
  onPlaceOrder,
  onQuantityChange,
  onRemove,
  onWishlist,
  onBack,
  cartCount,
}) => {
  const router = useRouter();
  const { discount, freeDelivery } = useMemo(
    () => getApplicableRewards(offerData, bagTotal),
    [offerData, bagTotal]
  );

  const shippingCost = freeDelivery ? 0 : 50;
  const total = Number(
    (bagTotal + shippingCost - discount - couponDiscount).toFixed(2)
  );
  const partial = estimatePartialCodAmounts(total);
  const codBalance = Math.max(0, total - partial.advanceAmount);
  const codDoorTotal = codBalance + COD_FEE;
  const savings =
    Math.max(0, 50 - shippingCost) + discount + Number(couponDiscount || 0);

  const rewardProgress = useMemo(
    () => Math.min(100, Math.round((bagTotal / 900) * 100)),
    [bagTotal]
  );

  /* ---------- PAYMENT COPY ---------- */
  const payCtaLabel =
    paymentMethod === PAYMENT_METHOD.PARTIAL_COD
      ? "Book Now"
      : paymentMethod === PAYMENT_METHOD.COD
      ? "Place Order"
      : "Proceed to Pay";

  const payCtaSub =
    paymentMethod === PAYMENT_METHOD.PARTIAL_COD
      ? "Book now · Pay rest at door"
      : paymentMethod === PAYMENT_METHOD.COD
      ? "Pay cash on delivery"
      : "Pay Online · Total";

  const payCtaAmount =
    paymentMethod === PAYMENT_METHOD.PARTIAL_COD
      ? formatINR(partial.advanceAmount)
      : formatINR(total);

  return (
    <div className={styles.mobileCart}>
      {/* NAV */}
      <div className={styles.nav}>
        <button className={styles.navBack} onClick={onBack} aria-label="Back">
          <ChevronLeft size={18} />
        </button>
        <div className={styles.navTitle}>
          <span>ON</span>RISE — MY CART
        </div>
        <div className={styles.navBadge}>
          {cartCount} {cartCount === 1 ? "Item" : "Items"}
        </div>
      </div>

      {/* REWARDS */}
      <div className={styles.rw}>
        <div className={styles.rwTitle}>🎁 Unlock Rewards with Your Orders</div>
        <div className={styles.rwTrack}>
          <div className={styles.rwBg} />
          <div
            className={styles.rwFill}
            style={{ width: `${rewardProgress}%` }}
          />
          <div className={styles.rwDots}>
            <div className={styles.rwDot}>
              <div className={styles.rwCircle}>🛒</div>
              <div className={styles.rwLbl}>START</div>
            </div>
            <div className={styles.rwDot}>
              <div className={styles.rwCircle}>🚚</div>
              <div className={styles.rwLbl}>₹500</div>
            </div>
            <div className={styles.rwDot}>
              <div className={styles.rwCircle}>🏷️</div>
              <div className={styles.rwLbl}>₹600</div>
            </div>
            <div className={styles.rwDot}>
              <div className={styles.rwCircle}>🎁</div>
              <div className={styles.rwLbl}>₹900</div>
            </div>
          </div>
        </div>
        <div className={styles.rwStatus}>
          {freeDelivery && discount > 0
            ? "🎉 All rewards unlocked!"
            : freeDelivery
            ? "🚚 Free shipping unlocked"
            : "Keep shopping to unlock rewards"}
        </div>
      </div>

      {/* MARQUEE */}
      <div className={styles.mq}>
        <div className={styles.mqInner}>
          {[0, 1].map((dup) => (
            <span key={dup} className={styles.mqGroup}>
              <span className={styles.mqT}>✦ FREE PERSONALISATION</span>
              <span className={styles.mqD} />
              <span className={styles.mqT}>THEIR WORD. YOUR LOVE. FREE TODAY</span>
              <span className={styles.mqD} />
              <span className={styles.mqT}>⚡ LIMITED SLOTS TODAY</span>
              <span className={styles.mqD} />
            </span>
          ))}
        </div>
      </div>

      <CartOfferCard />

      {/* OFFER STRIP */}
      {(freeDelivery || discount > 0) && (
        <div className={styles.os}>
          <span className={styles.osIcon}>🏷️</span>
          <div className={styles.osTxt}>
            {discount > 0 && (
              <>
                <span className={styles.osHighlight}>
                  {formatINR(discount)} OFF
                </span>{" "}
                applied{freeDelivery ? " · " : ""}
              </>
            )}
            {freeDelivery && <>Free shipping unlocked 🚚</>}
          </div>
          <span className={styles.osChev}>›</span>
        </div>
      )}

      {/* ITEMS */}
      <div className={styles.sec}>
        Your Items
        <span className={styles.secCount}>
          {cartCount} {cartCount === 1 ? "shirt" : "shirts"}
        </span>
      </div>

      {cartItems.map((item) => {
        const presetText = item?.presetText;
        const attributeTags = getCartItemAttributeTags(item);
        const basePrice = Number(item?.basePrice) || 0;
        const discPrice = Number(item?.discountPrice) || basePrice;
        const save = Math.max(0, basePrice - discPrice) * (item.quantity || 1);

        return (
          <div key={item.id} className={styles.ci}>
            <div className={styles.ciTop}>
              <div className={styles.ciImg}>
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.name} />
                ) : (
                  <div className={styles.ciEmoji}>🎽</div>
                )}
                {item.isCustomizable && (
                  <div className={styles.ciBadge}>PERSONALISED</div>
                )}
              </div>
              <div className={styles.ciInfo}>
                <div className={styles.ciName}>{item.name}</div>
                {presetText && presetText !== "Empty Text" && (
                  <div className={styles.ciWord}>
                    <span className={styles.ciWordStar}>✦</span>
                    <span className={styles.ciWordLbl}>
                      {String(presetText).toUpperCase()}
                    </span>
                  </div>
                )}
                {attributeTags.length > 0 ? (
                  <div className={styles.ciTags}>
                    {attributeTags.map((tag) => (
                      <span key={tag.key} className={styles.ciTag}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.ciR}>
                {basePrice > discPrice && (
                  <div className={styles.ciOld}>₹{basePrice}</div>
                )}
                <div className={styles.ciPrice}>₹{discPrice}</div>
                {save > 0 && (
                  <div className={styles.ciSave}>Save ₹{save}</div>
                )}
              </div>
            </div>

            <div className={styles.ciBot}>
              <div className={styles.ciActs}>
                <button
                  type="button"
                  className={styles.ciWish}
                  onClick={() => onWishlist(item.productId)}
                >
                  <Heart size={14} fill="#ff4500" strokeWidth={0} />
                  Wishlist
                </button>
                <button
                  type="button"
                  className={styles.ciDel}
                  onClick={() => onRemove(item.productId)}
                  aria-label="Remove item"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>

              <div className={styles.ciQty}>
                <button
                  type="button"
                  className={styles.qBtn}
                  onClick={() =>
                    onQuantityChange(item.id, (item.quantity || 1) - 1)
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className={styles.qN}>{item.quantity || 1}</div>
                <button
                  type="button"
                  className={styles.qBtn}
                  onClick={() =>
                    onQuantityChange(item.id, (item.quantity || 1) + 1)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* COUPON */}
      <div className={styles.couponWrap}>
        <CouponBox
          appliedCode={appliedCouponCode}
          discount={couponDiscount}
          percent={couponPercent}
          error={couponError}
          loading={couponLoading}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
        />
      </div>

      {/* ORDER SUMMARY */}
      <div className={styles.sec}>Order Summary</div>
      <div className={styles.sum}>
        <div className={styles.sumRows}>
          <div className={styles.sumRow}>
            <div className={styles.sl}>
              Bag Total ({cartCount} {cartCount === 1 ? "item" : "items"})
            </div>
            <div className={styles.sv}>{formatINR(bagTotal)}</div>
          </div>
          <div className={styles.sumRow}>
            <div className={styles.sl}>Shipping</div>
            <div className={styles.sv}>
              {freeDelivery ? (
                <>
                  <span className={styles.svStrike}>₹50</span>
                  &nbsp;
                  <span className={`${styles.sv} ${styles.svGreen}`}>
                    FREE 🎉
                  </span>
                </>
              ) : (
                "₹50"
              )}
            </div>
          </div>
          {couponDiscount > 0 && (
            <div className={styles.sumRow}>
              <div className={styles.sl}>
                Coupon
                {appliedCouponCode ? ` (${appliedCouponCode})` : ""}
                {!Number.isNaN(Number(couponPercent)) && couponPercent > 0
                  ? ` · ${couponPercent}% off`
                  : ""}
              </div>
              <div className={`${styles.sv} ${styles.svGreen}`}>
                − {formatINR(couponDiscount)}
              </div>
            </div>
          )}
          {discount > 0 && (
            <div className={styles.sumRow}>
              <div className={styles.sl}>Discount</div>
              <div className={`${styles.sv} ${styles.svGreen}`}>
                − {formatINR(discount)}
              </div>
            </div>
          )}
          <div className={styles.sdiv} />
        </div>
        <div className={styles.sumTot}>
          <div className={styles.stL}>Total</div>
          <div className={styles.stV}>{formatINR(total)}</div>
        </div>
        <div className={styles.sumTax}>
          Inclusive of all taxes · No hidden charges at door
        </div>
      </div>

      {/* PAYMENT */}
      <div className={styles.paySec}>
        <div className={styles.payLbl}>Payment Method</div>
        <div className={styles.payOpts}>
          <button
            type="button"
            className={`${styles.payOpt} ${
              paymentMethod === PAYMENT_METHOD.ONLINE ? styles.payOptSel : ""
            }`}
            onClick={() => onPaymentMethodChange(PAYMENT_METHOD.ONLINE)}
          >
            <div className={styles.pr}>
              <div className={styles.prDot} />
            </div>
            <div className={`${styles.piWrap} ${styles.piWrapOn}`}>⚡</div>
            <div className={styles.pi}>
              <div className={styles.piRow}>
                <div className={styles.piName}>Pay Full Online</div>
                <div className={styles.piSave}>SAVE ₹{COD_FEE}</div>
              </div>
              <div className={styles.piSub}>
                UPI · Cards · Net Banking · Wallets
              </div>
            </div>
            <div className={styles.piPrice}>{formatINR(total)}</div>
          </button>

          <button
            type="button"
            className={`${styles.payOpt} ${
              paymentMethod === PAYMENT_METHOD.PARTIAL_COD
                ? styles.payOptSel
                : ""
            }`}
            onClick={() => onPaymentMethodChange(PAYMENT_METHOD.PARTIAL_COD)}
          >
            <div className={styles.pr}>
              <div className={styles.prDot} />
            </div>
            <div className={`${styles.piWrap} ${styles.piWrapCo}`}>🚚</div>
            <div className={styles.pi}>
              <div className={styles.piRow}>
                <div className={styles.piName}>Book Now, Pay Later</div>
                <div className={styles.piPop}>POPULAR</div>
              </div>
              <div className={styles.piSub}>
                ₹{partial.advanceAmount} now + ₹{codBalance} cash on delivery
                <span className={styles.piCod}>
                  + ₹{COD_FEE} convenience fee included
                </span>
              </div>
            </div>
            <div className={styles.piPrice}>
              {formatINR(partial.advanceAmount)}
            </div>
          </button>
        </div>
      </div>

      {/* COD BREAKDOWN */}
      {paymentMethod === PAYMENT_METHOD.PARTIAL_COD && (
        <div className={`${styles.cod} ${styles.codShow}`}>
          <div className={styles.codHd}>
            <div className={styles.codIcon}>🚚</div>
            <div>
              <div className={styles.codTitle}>
                Book Now, Pay Later — Breakdown
              </div>
              <div className={styles.codSub}>
                What you pay now vs at your door
              </div>
            </div>
          </div>
          <div className={styles.codRows}>
            <div className={styles.codRow}>
              <div className={styles.codRl}>
                <span className={styles.codDt} />
                Order total
              </div>
              <div className={styles.codRv}>{formatINR(total)}</div>
            </div>
            <div className={styles.codRow}>
              <div className={styles.codRl}>
                <span className={styles.codDt} />
                Pay online now ({partial.advancePercent}%)
              </div>
              <div className={`${styles.codRv} ${styles.codRvOr}`}>
                {formatINR(partial.advanceAmount)}
              </div>
            </div>
            <div className={styles.codDiv} />
            <div className={styles.codRow}>
              <div className={styles.codRl}>
                <span className={styles.codDt} />
                Balance at door
              </div>
              <div className={styles.codRv}>{formatINR(codBalance)}</div>
            </div>
            <div className={styles.codRow}>
              <div className={styles.codRl}>
                <span className={styles.codDt} />
                convenience fee
              </div>
              <div className={`${styles.codRv} ${styles.codRvOr}`}>
                + ₹{COD_FEE}
              </div>
            </div>
          </div>
          <div className={styles.codTot}>
            <div className={styles.codTl}>Cash at door total</div>
            <div className={styles.codTv}>{formatINR(codDoorTotal)}</div>
          </div>
        </div>
      )}

      {/* TRUST ROW */}
      <div className={styles.tr}>
        <div className={styles.trI}>
          <div className={styles.trIc}>🔒</div>
          <div className={styles.trT}>100% Secure</div>
          <div className={styles.trS}>Cashfree powered</div>
        </div>
        <div className={styles.trI}>
          <div className={styles.trIc}>🎁</div>
          <div className={styles.trT}>Made Only for You</div>
          <div className={styles.trS}>Personalised &amp; packed with love</div>
        </div>
        <div className={styles.trI}>
          <div className={styles.trIc}>⚡</div>
          <div className={styles.trT}>Ships in 4 Days</div>
          <div className={styles.trS}>Pan India delivery</div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className={styles.icWrap}>
        <div className={`${styles.ic} ${styles.icHappy}`}>
          <div className={`${styles.icIcon} ${styles.icIconH}`}>🏆</div>
          <div className={styles.icBody}>
            <div className={styles.icTitle}>
              2,000+ Happy Parents
            </div>
            <div className={styles.icSub}>
              Families across India trust Onrise for personalised kids&apos;
              clothing. Every order made with love and checked before shipping.
            </div>
          </div>
          <div className={`${styles.icBdg} ${styles.icBdgO}`}>★ 4.9</div>
        </div>

        <div className={`${styles.ic} ${styles.icRet}`}>
          <div className={`${styles.icIcon} ${styles.icIconR}`}>↩️</div>
          <div className={styles.icBody}>
            <div className={styles.icTitle}>8-Day Easy Returns</div>
            <div className={styles.icSub}>
              Not happy? Return or exchange within 8 days of delivery. No
              questions asked.
            </div>
          </div>
          <div className={`${styles.icBdg} ${styles.icBdgG}`}>FREE</div>
        </div>

        <div className={`${styles.ic} ${styles.icWa}`}>
          <div className={`${styles.icIcon} ${styles.icIconW}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.843L.057 23.428a.5.5 0 0 0 .609.61l5.7-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.213-3.722.964.992-3.617-.233-.373A9.818 9.818 0 1 1 12 21.818z" />
            </svg>
          </div>
          <div className={styles.icBody}>
            <div className={styles.icTitle}>WhatsApp Confirmation</div>
            <div className={styles.icSub}>
              After ordering you&apos;ll receive a WhatsApp message confirming
              your child&apos;s name, design &amp; delivery date. Production
              starts only after your confirmation.
            </div>
          </div>
        </div>
      </div>

      {/* WA ENQUIRY */}
      <a
        className={styles.waBtn}
        href="https://wa.me/919019909704?text=Hi%2C%20I%20have%20an%20enquiry%20about%20my%20Onrise%20order"
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.waIc}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.843L.057 23.428a.5.5 0 0 0 .609.61l5.7-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.213-3.722.964.992-3.617-.233-.373A9.818 9.818 0 1 1 12 21.818z" />
          </svg>
        </div>
        <div className={styles.waText}>
          <div className={styles.waT}>Any questions? Chat with us</div>
          <div className={styles.waS}>
            +91 90199 09704 · Usually replies in minutes
          </div>
        </div>
        <div className={styles.waA}>→</div>
      </a>

      <div className={styles.brandTrust}>
        <div className={styles.btLock}>🔒</div>
        <div className={styles.btTxt}>
          Onrise is a <span className={styles.pe}>PrintEasy</span> brand
          &nbsp;·&nbsp;
          <strong>Trusted by 2,000+ families</strong> &nbsp;·&nbsp; Safe
          &amp; secure checkout
        </div>
      </div>
      {savings > 0 && (
        <div className={styles.svPill}>
          <div className={styles.svPillIn}>
            🎉 You&apos;re saving {formatINR(savings)} on this order
          </div>
        </div>
      )}

      <div className={styles.pageSpacer} aria-hidden />

      <div className={styles.shopMoreFloat}>
        <span className={styles.shopMoreLbl}>Shop More</span>
        <button
          type="button"
          className={styles.shopMoreBtn}
          onClick={() => router.push("/")}
          aria-label="Shop more products"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 10h16l-1.5 14H9.5L8 10z"
              fill="#5B9BD5"
              stroke="#4A8BC4"
              strokeWidth="0.5"
            />
            <path
              d="M12 10V8a4 4 0 0 1 8 0v2"
              stroke="#4A8BC4"
              strokeWidth="1.5"
              fill="none"
            />
            <rect x="18" y="16" width="10" height="12" rx="2" fill="#FF4500" />
            <path
              d="M21 16v-2a2 2 0 0 1 4 0v2"
              stroke="#E63E00"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* STICKY FOOTER */}
      <div className={styles.sticky}>
        <button
          type="button"
          className={styles.coBtn}
          onClick={() => onPlaceOrder(paymentMethod, total)}
          disabled={isSubmitting}
        >
          <div className={styles.coL}>
            <div className={styles.coSub}>
              {isSubmitting ? "Processing..." : payCtaSub}
            </div>
            <div className={styles.coAmt}>{payCtaAmount}</div>
          </div>
          <div className={styles.coR}>
            <div className={styles.coLbl}>
              {isSubmitting ? "Please wait" : payCtaLabel}
            </div>
            <div className={styles.coArr}>→</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CartMobile;
