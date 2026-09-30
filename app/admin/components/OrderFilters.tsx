"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  created_at: string;
};

type OrderFiltersProps = {
  orders: Order[];
};

const orderStatuses = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "all",
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function OrderFilters({
  orders,
}: OrderFiltersProps) {
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm) ||
        order.customer_email?.toLowerCase().includes(searchTerm) ||
        order.customer_phone.toLowerCase().includes(searchTerm);

      const matchesOrderStatus =
        orderStatus === "all" ||
        order.order_status === orderStatus;

      const matchesPaymentStatus =
        paymentStatus === "all" ||
        order.payment_status === paymentStatus;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });
  }, [orders, search, orderStatus, paymentStatus]);

  return (
    <>
      {/* Filters */}
      <div className="admin-order-filters">
        <div className="admin-order-search">
          <label htmlFor="order-search">
            Search Orders
          </label>

          <input
            id="order-search"
            type="search"
            placeholder="Order number, customer, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-order-filter">
          <label htmlFor="order-status-filter">
            Order Status
          </label>

          <select
            id="order-status-filter"
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(event.target.value)
            }
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? "All Orders"
                  : formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-order-filter">
          <label htmlFor="payment-status-filter">
            Payment Status
          </label>

          <select
            id="payment-status-filter"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value)
            }
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? "All Payments"
                  : formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {(search ||
          orderStatus !== "all" ||
          paymentStatus !== "all") && (
          <button
            type="button"
            className="admin-clear-filters"
            onClick={() => {
              setSearch("");
              setOrderStatus("all");
              setPaymentStatus("all");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="admin-filter-results">
        Showing {filteredOrders.length}{" "}
        {filteredOrders.length === 1 ? "order" : "orders"}
      </div>

      {/* Results */}
      {filteredOrders.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No matching orders</h3>

          <p>
            Try changing your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                  </td>

                  <td>
                    <div className="admin-table-primary">
                      {order.customer_name}
                    </div>

                    {order.customer_email && (
                      <div className="admin-table-secondary">
                        {order.customer_email}
                      </div>
                    )}
                  </td>

                  <td>{order.customer_phone}</td>

                  <td>
                    ₦
                    {Number(
                      order.total_amount
                    ).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${order.order_status}`}
                    >
                      {formatStatus(order.order_status)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status-${order.payment_status}`}
                    >
                      {formatStatus(order.payment_status)}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
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