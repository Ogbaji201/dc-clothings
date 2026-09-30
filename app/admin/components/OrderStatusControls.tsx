"use client";

import { useState } from "react";

type OrderStatusControlsProps = {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function OrderStatusControls({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: OrderStatusControlsProps) {
  const [orderStatus, setOrderStatus] =
    useState(initialOrderStatus);

  const [paymentStatus, setPaymentStatus] =
    useState(initialPaymentStatus);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveChanges() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update order."
        );
      }

      setMessage("Order updated successfully.");
    } catch (error) {
      console.error("Order status update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-status-controls">
      <div className="admin-status-controls-header">
        <div>
          <p className="admin-eyebrow">
            ORDER MANAGEMENT
          </p>

          <h2>Update Status</h2>
        </div>
      </div>

      <div className="admin-status-controls-grid">
        <div className="admin-status-control">
          <label htmlFor="order-status">
            Order Status
          </label>

          <select
            id="order-status"
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(event.target.value)
            }
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-status-control">
          <label htmlFor="payment-status">
            Payment Status
          </label>

          <select
            id="payment-status"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value)
            }
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-status-controls-footer">
        <button
          type="button"
          onClick={saveChanges}
          disabled={saving}
          className="admin-save-status-button"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <span className="admin-success-message">
            {message}
          </span>
        )}

        {error && (
          <span className="admin-error-message">
            {error}
          </span>
        )}
      </div>
    </section>
  );
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}