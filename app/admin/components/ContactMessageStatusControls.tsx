"use client";

import { useState } from "react";

type ContactMessageStatusControlsProps = {
  messageId: string;
  initialStatus: string;
};

const statuses = [
  "new",
  "read",
  "replied",
  "closed",
];

export default function ContactMessageStatusControls({
  messageId,
  initialStatus,
}: ContactMessageStatusControlsProps) {
  const [status, setStatus] =
    useState(initialStatus);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveStatus() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/contact/${messageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update message status."
        );
      }

      setMessage("Message status updated successfully.");
    } catch (error) {
      console.error(
        "Contact message status update error:",
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
            MESSAGE MANAGEMENT
          </p>

          <h2>Update Status</h2>
        </div>
      </div>

      <div className="admin-status-controls-grid">
        <div className="admin-status-control">
          <label htmlFor="message-status">
            Message Status
          </label>

          <select
            id="message-status"
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