import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderStatusControls from "../../components/OrderStatusControls";

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_state,
      subtotal,
      delivery_fee,
      total_amount,
      order_status,
      payment_status,
      payment_reference,
      notes,
      created_at
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
      id,
      product_name,
      size,
      color,
      quantity,
      unit_price,
      total_price
    `
    )
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Order items fetch error:", itemsError);
  }

  const orderItems = items ?? [];

  return (
    <main className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <Link href="/admin/orders" className="admin-back-link">
          ← Back to Orders
        </Link>

        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">
              DC CLOTHINGS / ORDER
            </p>

            <h1>{order.order_number}</h1>

            <p className="admin-page-introduction">
              Order placed on{" "}
              {formatDate(order.created_at)}
            </p>
          </div>

          <div className="admin-order-status-group">
            <span
              className={`admin-status admin-status-${order.order_status}`}
            >
              {formatStatus(order.order_status)}
            </span>

            <span
              className={`admin-status admin-status-${order.payment_status}`}
            >
              Payment: {formatStatus(order.payment_status)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer + Delivery */}
      <section className="admin-detail-grid">
        <div className="admin-detail-card">
          <p className="admin-eyebrow">CUSTOMER</p>

          <h2>{order.customer_name}</h2>

          <div className="admin-detail-list">
            {order.customer_email && (
              <div>
                <span>Email</span>
                <strong>{order.customer_email}</strong>
              </div>
            )}

            <div>
              <span>Phone</span>
              <strong>{order.customer_phone}</strong>
            </div>
          </div>
        </div>

        <div className="admin-detail-card">
          <p className="admin-eyebrow">DELIVERY</p>

          <h2>Delivery Address</h2>

          <div className="admin-address">
            <p>{order.delivery_address}</p>

            {order.delivery_city && (
              <p>{order.delivery_city}</p>
            )}

            {order.delivery_state && (
              <p>{order.delivery_state}</p>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">ORDER CONTENTS</p>

            <h2>Products</h2>
          </div>

          <span className="admin-record-count">
            {orderItems.length}{" "}
            {orderItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table admin-order-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Colour</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product_name}</strong>
                  </td>

                  <td>{item.size || "—"}</td>

                  <td>{item.color || "—"}</td>

                  <td>{item.quantity}</td>

                  <td>{formatCurrency(item.unit_price)}</td>

                  <td>
                    <strong>
                      {formatCurrency(item.total_price)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order Summary */}
      <section className="admin-order-summary-section">
        <div className="admin-order-summary">
          <p className="admin-eyebrow">ORDER SUMMARY</p>

          <div className="admin-summary-row">
            <span>Subtotal</span>
            <strong>
              {formatCurrency(order.subtotal)}
            </strong>
          </div>

          <div className="admin-summary-row">
            <span>Delivery</span>
            <strong>
              {formatCurrency(order.delivery_fee)}
            </strong>
          </div>

          <div className="admin-summary-total">
            <span>Total</span>
            <strong>
              {formatCurrency(order.total_amount)}
            </strong>
          </div>
        </div>
      </section>


{/* Order Status Controls */}
<OrderStatusControls
  orderId={order.id}
  initialOrderStatus={order.order_status}
  initialPaymentStatus={order.payment_status}
/>

{/* Payment + Notes */}
{(order.payment_reference || order.notes) && (
  <section className="admin-detail-grid">
    {order.payment_reference && (
      <div className="admin-detail-card">
        <p className="admin-eyebrow">PAYMENT</p>

        <h2>Payment Reference</h2>

        <p className="admin-reference">
          {order.payment_reference}
        </p>
      </div>
    )}

    {order.notes && (
      <div className="admin-detail-card">
        <p className="admin-eyebrow">CUSTOMER NOTES</p>

        <h2>Notes</h2>

        <p className="admin-notes">
          {order.notes}
        </p>
      </div>
    )}
  </section>
)}
    
    </main>
  );
}

function formatCurrency(value: number | string) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}