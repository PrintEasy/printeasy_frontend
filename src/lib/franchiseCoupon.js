const API_KEY =
  "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10";

function asList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (
    typeof raw === "object" &&
    "data" in raw &&
    ("success" in raw || "message" in raw)
  ) {
    return asList(raw.data);
  }
  if (Array.isArray(raw.franchises)) return raw.franchises.filter(Boolean);
  if (Array.isArray(raw.items)) return raw.items.filter(Boolean);
  if (typeof raw === "object") return [raw];
  return [];
}

function pickString(obj, keys) {
  if (!obj || typeof obj !== "object") return "";
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function pickNumber(obj, keys) {
  if (!obj || typeof obj !== "object") return NaN;
  for (const key of keys) {
    const n = Number(obj[key]);
    if (!Number.isNaN(n) && obj[key] != null && obj[key] !== "") return n;
  }
  return NaN;
}

export function getFranchiseCode(franchise) {
  return pickString(franchise, [
    "couponCode",
    "coupon_code",
    "code",
    "franchiseCode",
    "franchise_code",
    "coupon",
  ]);
}

export function franchiseMatchesCode(franchise, code) {
  const entered = String(code || "").trim().toLowerCase();
  if (!entered) return false;
  const actual = getFranchiseCode(franchise).toLowerCase();
  return actual === entered;
}

export function isFranchiseActive(franchise) {
  if (!franchise || typeof franchise !== "object") return false;
  const status = String(
    franchise.status ?? franchise.state ?? franchise.couponStatus ?? ""
  )
    .trim()
    .toLowerCase();
  if (["inactive", "disabled", "expired", "blocked"].includes(status)) {
    return false;
  }
  if (franchise.isActive === false || franchise.active === false) return false;
  return true;
}

export function getFranchiseMinOrder(franchise) {
  return pickNumber(franchise, [
    "minOrderAmount",
    "min_order_amount",
    "minOrder",
    "min_order",
  ]);
}

export function getFranchiseDiscountPercent(franchise) {
  return pickNumber(franchise, [
    "discountPercentage",
    "discountPercent",
    "discount_percentage",
    "percentage",
    "percent",
    "discount",
    "commissionPercentage",
    "commission_percentage",
  ]);
}

/** Discount rupees for the current bag total. `discount: 15` means 15% off. */
export function getFranchiseCouponDiscount(franchise, bagTotal) {
  const bag = Number(bagTotal) || 0;
  if (!franchise || bag <= 0) return 0;

  const pct = getFranchiseDiscountPercent(franchise);
  const amt = pickNumber(franchise, [
    "discountAmount",
    "discount_amount",
    "flatDiscount",
    "flat_discount",
  ]);

  let value = 0;
  if (!Number.isNaN(pct) && pct > 0) {
    value = (bag * pct) / 100;
  } else if (!Number.isNaN(amt) && amt > 0) {
    value = amt;
  }

  return Number(Math.min(bag, Math.max(0, value)).toFixed(2));
}

export async function fetchFranchiseByCode(api, code) {
  const headers = { "x-api-key": API_KEY };
  const trimmed = String(code || "").trim();
  if (!trimmed) return null;

  const matchFromPayload = (payload) => {
    const list = asList(payload?.data ?? payload);
    return (
      list.find(
        (item) =>
          franchiseMatchesCode(item, trimmed) && isFranchiseActive(item)
      ) || null
    );
  };

  try {
    const byCode = await api.get(
      `/v2/franchise/${encodeURIComponent(trimmed)}`,
      { headers, skipAuth: true }
    );
    const match = matchFromPayload(byCode?.data);
    if (match) return match;
    const inner = byCode?.data?.data ?? byCode?.data;
    if (
      inner &&
      typeof inner === "object" &&
      !Array.isArray(inner) &&
      !("success" in inner) &&
      isFranchiseActive(inner)
    ) {
      return inner;
    }
  } catch {
    // Fall through to the list endpoint.
  }

  const res = await api.get("/v2/franchise", { headers, skipAuth: true });
  return matchFromPayload(res?.data);
}
