"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type CustomOrder = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  garment_type: string;
  preferred_colour: string | null;
  preferred_size: string | null;
  quantity: number;
  description: string;
  reference_image_url: string | null;
  status: string;
  created_at: string;
};

type CustomOrderFiltersProps = {
  enquiries: CustomOrder[];
};

const statuses = [
  "all",
  "new",
  "reviewing",
  "quoted",
  "approved",
  "rejected",
  "completed",
];

export default function CustomOrderFilters({
  enquiries,
}: CustomOrderFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredEnquiries = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !searchTerm ||
        enquiry.full_name
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.email
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.phone
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.garment_type
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.description
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.preferred_colour
          ?.toLowerCase()
          .includes(searchTerm) ||
        enquiry.preferred_size
          ?.toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        status === "all" ||
        enquiry.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, status]);

  return (
    <>
      <div className="admin-message-filters">
        <div className="admin-message-search">
          <label htmlFor="custom-search">
            Search Custom Enquiries
          </label>

          <input
            id="custom-search"
            type="search"
            placeholder="Name, email, phone, garment..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-message-status-filter">
          <label htmlFor="custom-status">
            Status
          </label>

          <select
            id="custom-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "all"
                  ? "All Enquiries"
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
        Showing {filteredEnquiries.length}{" "}
        {filteredEnquiries.length === 1
          ? "enquiry"
          : "enquiries"}
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No matching custom enquiries</h3>

          <p>
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table admin-custom-orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Garment</th>
                <th>Colour</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>
                    <div className="admin-table-primary">
                      {enquiry.full_name}
                    </div>

                    <div className="admin-table-secondary">
                      {enquiry.email}
                    </div>
                  </td>

                  <td>{enquiry.garment_type}</td>

                  <td>
                    {enquiry.preferred_colour || "—"}
                  </td>

                  <td>
                    {enquiry.preferred_size || "—"}
                  </td>

                  <td>{enquiry.quantity}</td>

                  <td>
                    {enquiry.reference_image_url
                      ? "Yes"
                      : "No"}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${enquiry.status}`}
                    >
                      {formatStatus(enquiry.status)}
                    </span>
                  </td>

                  <td>
                    {formatDate(enquiry.created_at)}
                  </td>

                  <td>
                    <Link
                      href={`/admin/custom-orders/${enquiry.id}`}
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}