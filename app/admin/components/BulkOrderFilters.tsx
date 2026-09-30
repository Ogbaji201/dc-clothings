"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BulkOrder = {
  id: string;
  contact_person: string;
  organisation_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  organisation_type: string;
  garment_needed: string;
  estimated_quantity: number;
  delivery_deadline: string | null;
  branding_required: boolean;
  notes: string | null;
  status: string;
  created_at: string;
};

type BulkOrderFiltersProps = {
  enquiries: BulkOrder[];
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

export default function BulkOrderFilters({
  enquiries,
}: BulkOrderFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredEnquiries = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !searchTerm ||
        enquiry.contact_person
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.organisation_name
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.email
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.phone
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.organisation_type
          .toLowerCase()
          .includes(searchTerm) ||
        enquiry.garment_needed
          .toLowerCase()
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
          <label htmlFor="bulk-search">
            Search Bulk Enquiries
          </label>

          <input
            id="bulk-search"
            type="search"
            placeholder="Contact, organisation, email, phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-message-status-filter">
          <label htmlFor="bulk-status">
            Status
          </label>

          <select
            id="bulk-status"
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
          <h3>No matching bulk enquiries</h3>

          <p>
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table admin-bulk-orders-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Organisation</th>
                <th>Garment</th>
                <th>Quantity</th>
                <th>Deadline</th>
                <th>Branding</th>
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
                      {enquiry.contact_person}
                    </div>

                    <div className="admin-table-secondary">
                      {enquiry.email}
                    </div>
                  </td>

                  <td>
                    <div className="admin-table-primary">
                      {enquiry.organisation_name}
                    </div>

                    <div className="admin-table-secondary">
                      {enquiry.organisation_type}
                    </div>
                  </td>

                  <td>{enquiry.garment_needed}</td>

                  <td>
                    {enquiry.estimated_quantity.toLocaleString()}
                  </td>

                  <td>
                    {enquiry.delivery_deadline
                      ? formatDate(
                          enquiry.delivery_deadline
                        )
                      : "—"}
                  </td>

                  <td>
                    {enquiry.branding_required
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
                      href={`/admin/bulk-orders/${enquiry.id}`}
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