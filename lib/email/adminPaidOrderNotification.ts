import { Resend } from "resend";

type OrderItem = {
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type AdminPaidOrderNotificationData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string | null;
  deliveryState: string | null;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentReference: string;
  items: OrderItem[];
  notificationType?: "paid-order" | "cancelled-order-payment";
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

export async function sendAdminPaidOrderNotification(
  order: AdminPaidOrderNotificationData,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured.");
  if (!adminEmail) throw new Error("ADMIN_NOTIFICATION_EMAIL is not configured.");

  const isCancelledPayment = order.notificationType === "cancelled-order-payment";
  const resend = new Resend(apiKey);
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.product_name)}</strong><br />
            <span style="color:#666;font-size:13px;">
              ${escapeHtml(item.color || "No colour specified")} / ${escapeHtml(item.size || "No size specified")}
            </span>
          </td>
          <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">${escapeHtml(item.quantity)}</td>
          <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">${escapeHtml(formatNaira(Number(item.total_price)))}</td>
        </tr>`,
    )
    .join("");

  const subject = isCancelledPayment
    ? `URGENT: Payment received for CANCELLED order ${order.orderNumber}`
    : `Payment received — Order ${order.orderNumber}`;
  const heading = isCancelledPayment
    ? "URGENT — Manual review required"
    : "New paid order";
  const intro = isCancelledPayment
    ? "Paystack confirms a successful payment for an order that is marked cancelled. Do not fulfil or deduct inventory automatically. Review the order and decide whether a refund or other resolution is required."
    : "DCClothings has received a successful payment.";

  const { data, error } = await resend.emails.send(
    {
      from,
      to: [adminEmail],
      subject,
      html: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:8px;padding:28px;">
      <h1 style="margin:0 0 8px;font-size:24px;">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 24px;color:#555;">${escapeHtml(intro)}</p>
      <p><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p><strong>Order status:</strong> ${isCancelledPayment ? "Cancelled — do not fulfil until reviewed" : "Paid order"}</p>
      <p><strong>Payment status:</strong> Paid</p>
      <p><strong>Paystack reference:</strong> ${escapeHtml(order.paymentReference)}</p>
      <h2 style="font-size:18px;margin-top:28px;">Customer details</h2>
      <p><strong>Name:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customerEmail || "Not provided")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>
      <p><strong>Delivery address:</strong><br />${escapeHtml(order.deliveryAddress)}<br />${escapeHtml(order.deliveryCity)}, ${escapeHtml(order.deliveryState)}</p>
      <h2 style="font-size:18px;margin-top:28px;">Items ordered</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead><tr>
          <th style="padding:10px;text-align:left;border-bottom:2px solid #ddd;">Item</th>
          <th style="padding:10px;text-align:center;border-bottom:2px solid #ddd;">Qty</th>
          <th style="padding:10px;text-align:right;border-bottom:2px solid #ddd;">Amount</th>
        </tr></thead>
        <tbody>${itemsHtml || '<tr><td colspan="3" style="padding:10px;">No item details available.</td></tr>'}</tbody>
      </table>
      <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
        <p><strong>Subtotal:</strong> ${escapeHtml(formatNaira(order.subtotal))}</p>
        <p><strong>Delivery fee:</strong> ${escapeHtml(formatNaira(order.deliveryFee))}</p>
        <p style="font-size:18px;"><strong>Total paid:</strong> ${escapeHtml(formatNaira(order.totalAmount))}</p>
      </div>
      <p style="margin-top:28px;color:#777;font-size:12px;">Automated payment notification for order ID ${escapeHtml(order.orderId)}.</p>
    </div>
  </body>
</html>`,
    },
    {
      idempotencyKey: `${isCancelledPayment ? "admin-cancelled-order-payment" : "admin-paid-order"}/${order.orderId}`,
    },
  );

  if (error) {
    console.error("Resend admin order notification error:", error);
    throw new Error("Unable to send admin order notification.");
  }

  return data;
}
