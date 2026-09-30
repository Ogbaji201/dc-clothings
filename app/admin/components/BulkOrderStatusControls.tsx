"use client";

import { useState } from "react";

type BulkOrderStatusControlsProps = {
  enquiryId: string;
  initialStatus: string;
};

const statuses = [
  "new",
  "reviewing",
  "quoted",
  "approved",
  "rejected",
  "completed",
];

export default function BulkOrderStatusControls({
  enquiryId,
  initialStatus,
}: BulkOrderStatusControlsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveStatus() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/bulk-orders/${enquiryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update bulk enquiry status."
        );
      }

      setMessage("Bulk enquiry status updated successfully.");
    } catch (error) {
      console.error(
        "Bulk enquiry status update error:",
        error
      );

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
            BULK ORDER MANAGEMENT
          </p>

          <h2>Update Status</h2>
        </div>
      </div>

      <div className="admin-status-controls-grid">
        <div className="admin-status-control">
          <label htmlFor="bulk-order-status">
            Enquiry Status
          </label>

          <select
            id="bulk-order-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-status-controls-footer">
        <button
          type="button"
          onClick={saveStatus}
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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}