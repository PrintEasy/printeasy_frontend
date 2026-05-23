export type PaymentMethod = "ONLINE" | "COD" | "PARTIAL_COD";

export interface Address {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
}

export interface OrderItem {
  name: string;
  sku?: string;
  totalPrice: number;
  quantity: number;
  categoryId?: string;
  isCustomizable?: boolean;
  productImageUrl?: string;
  sizeInfo?: unknown;
  discount?: number;
  tax?: number;
  hsn?: string | null;
  printingImgText?: Record<string, unknown>;
}

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  couponCode?: string;
  user?: { id?: string | null; address?: Address };
  totalAmount?: number;
}

export interface CashfreeSession {
  orderId: string;
  sessionId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  paymentMethod: PaymentMethod;
  status: string;
  totalAmount: number;
  advancePercent?: number;
  advanceAmount?: number;
  codAmount?: number;
  advancePaid?: boolean;
  advancePaidAt?: string;
  items?: OrderItem[];
  cashfree?: CashfreeSession;
  __cashfree_error?: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  cashfreeOrderId?: string;
  orderAmount?: string | number;
  referenceId?: string;
  txStatus?: string;
  paymentMode?: string;
  txMsg?: string;
  txTime?: string;
  cashfreeSignature?: string;
}
