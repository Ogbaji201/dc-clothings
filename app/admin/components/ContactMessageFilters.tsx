"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

type ContactMessageFiltersProps = {
  messages: ContactMessage[];
};

const statuses = [
  "all",
  "new",
  "read",
  "replied",
  "closed",
];

export default function ContactMessageFilters({
  messages,
}: ContactMessageFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredMessages = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !searchTerm ||
        message.full_name
          .toLowerCase()
          .includes(searchTerm) ||
        message.email
          .toLowerCase()
          .includes(searchTerm) ||
        message.subject
          .toLowerCase()
          .includes(searchTerm) ||
        message.message
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        status === "all" ||
        message.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, status]);

  return (
    <>
      <div className="admin-message-filters">
        <div className="admin-message-search">
          <label htmlFor="message-search">
            Search Messages
          </label>

          <input
            id="message-search"
            type="search"
            placeholder="Name, email, subject or message..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-message-status-filter">
          <label htmlFor="message-status">
            Status
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
                {item === "all"
                  ? "All Messages"
                  : formatStatus(item)}
              </option>
            ))}
          </select>
        </div>

        {(search || status !== "all") && (
          <button
            type="button"
            className="admin-clear-filters"
            onClick={() => {
              setSearch("");
              setStatus("all");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="admin-filter-results">
        Showing {filteredMessages.length}{" "}
        {filteredMessages.length === 1
          ? "message"
          : "messages"}
      </div>

      {filteredMessages.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No matching messages</h3>

          <p>
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Subject</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <div className="admin-table-primary">
                      {message.full_name}
                    </div>

                    <div className="admin-table-secondary">
                      {message.email}
                    </div>
                  </td>

                  <td>
                    <strong>{message.subject}</strong>
                  </td>

                  <td>
                    {message.phone || "—"}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${message.status}`}
                    >
                      {formatStatus(message.status)}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      message.created_at
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td>
                    <Link
                      href={`/admin/contact/${message.id}`}
                      className="admin-table-action"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}