
"use client";

import { useState, useTransition } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,

} from "recharts";

import {
  DashboardData,
  DashboardRange,
  getAdminDashboardData,
} from "../actions";

const currency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat("en-NG").format(value);

const statusColours = [
  "#38241c",
  "#9a7862",
  "#c9aa91",
  "#d8cfc3",
  "#8c9184",
  "#b8a38f",
];

const rangeOptions: {
  label: string;
  value: DashboardRange;
}[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
  { label: "90 Days", value: "90days" },
  { label: "This Year", value: "year" },
];

function MetricCard({
  label,
  value,
  detail,
  change,
}: {
  label: string;
  value: string;
  detail?: string;
  change?: number;
}) {
  return (
    <div className="analytics-metric-card">
      <p className="analytics-metric-label">{label}</p>

      <h3 className="analytics-metric-value">
        {value}
      </h3>

      <div className="analytics-metric-footer">
        {change !== undefined ? (
          <span
            className={
              change >= 0
                ? "analytics-change-positive"
                : "analytics-change-negative"
            }
          >
            {change >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(change)}%
          </span>
        ) : null}

        {detail && (
          <span className="analytics-metric-detail">
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const [data, setData] = useState(initialData);

  const [range, setRange] =
    useState<DashboardRange>("30days");

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] = useState("");

  const changeRange = (nextRange: DashboardRange) => {
    setRange(nextRange);
    setError("");

    startTransition(async () => {
      try {
        const result = await getAdminDashboardData(nextRange);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to refresh dashboard."
        );
      }
    });
  };

  return (
    <div className="analytics-dashboard">

      <div className="analytics-toolbar">
        <div>
          <p className="admin-section-eyebrow">
            BUSINESS PERFORMANCE
          </p>

          <h2 className="analytics-page-title">
            Store overview
          </h2>

          <p className="analytics-subtitle">
            Your DCClothings business at a glance.
          </p>
        </div>

        <div className="analytics-toolbar-actions">
          <select
            value={range}
            onChange={(event) =>
              changeRange(
                event.target.value as DashboardRange
              )
            }
            className="analytics-range-select"
            aria-label="Select analytics date range"
          >
            {rangeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="analytics-refresh-button"
            disabled={isPending}
            onClick={() => changeRange(range)}
          >
            {isPending ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Sales performance</h3>
          <span>Paid orders only</span>
        </div>

        <div className="analytics-metrics-grid">
          <MetricCard
            label="Total revenue"
            value={currency(data.period.revenue)}
            detail="For selected period"
            change={data.period.revenueChange}
          />

          <MetricCard
            label="Total orders"
            value={number(data.period.orders)}
            detail={`${number(data.period.paidOrders)} paid`}
          />

          <MetricCard
            label="Average order value"
            value={currency(data.period.averageOrderValue)}
            detail="Based on paid orders"
          />

          <MetricCard
            label="Awaiting payment"
            value={number(data.period.pendingOrders)}
            detail="Orders requiring attention"
          />
        </div>
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Revenue trend</h3>
          <span>Revenue generated over time</span>
        </div>

        <div className="analytics-chart-card analytics-revenue-chart">
          {data.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#76513d"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="#76513d"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e9e4dc"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#77716b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={25}
                />

                <YAxis
                  tickFormatter={(value) =>
                    `₦${Number(value).toLocaleString("en-NG", {
                      notation: "compact",
                    })}`
                  }
                  tick={{ fill: "#77716b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />

                <Tooltip
                  formatter={(value) => [
                    currency(Number(value)),
                    "Revenue",
                  ]}
                  contentStyle={{
                    border: "1px solid #e8e1d8",
                    borderRadius: "8px",
                    background: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#76513d"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="analytics-empty">
              No revenue data for this period.
            </p>
          )}
        </div>
      </section>

      <div className="analytics-two-column">

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <h3>Order status</h3>
            <span>Selected period</span>
          </div>

          <div className="analytics-chart-card analytics-pie-card">
            {data.orderStatuses.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={data.orderStatuses}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {data.orderStatuses.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            statusColours[
                              index % statusColours.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="analytics-status-list">
                  {data.orderStatuses.map((item, index) => (
                    <div
                      className="analytics-status-item"
                      key={item.name}
                    >
                      <span className="analytics-status-name">
                        <i
                          style={{
                            background:
                              statusColours[
                                index % statusColours.length
                              ],
                          }}
                        />
                        {item.name}
                      </span>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="analytics-empty">
                No orders for this period.
              </p>
            )}
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <h3>Fulfilment</h3>
            <span>Delivery versus pickup</span>
          </div>

          <div className="analytics-chart-card analytics-fulfilment-card">
            <div className="analytics-fulfilment-row">
              <div>
                <span>Delivery orders</span>
                <strong>{number(data.fulfilment.delivery)}</strong>
              </div>

              <div className="analytics-fulfilment-icon">
                ↗
              </div>
            </div>

            <div className="analytics-fulfilment-row">
              <div>
                <span>Store pickup orders</span>
                <strong>{number(data.fulfilment.pickup)}</strong>
              </div>

              <div className="analytics-fulfilment-icon">
                ↓
              </div>
            </div>

            <div className="analytics-fulfilment-note">
              Fulfilment figures include all orders,
              regardless of payment status.
            </div>
          </div>
        </section>

      </div>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Top-selling products</h3>
          <span>Ranked by units sold from paid orders</span>
        </div>

        <div className="analytics-chart-card analytics-products-card">
          {data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e9e4dc"
                />

                <XAxis
                  type="number"
                  tick={{ fill: "#77716b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={125}
                  tick={{ fill: "#4b4540", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="quantity"
                  name="Units sold"
                  fill="#76513d"
                  radius={[0, 5, 5, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="analytics-empty">
              No paid product sales for this period.
            </p>
          )}
        </div>
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Inventory overview</h3>
          <span>Active product variants</span>
        </div>

        <div className="analytics-metrics-grid">
          <MetricCard
            label="Active variants"
            value={number(data.inventory.variants)}
          />

          <MetricCard
            label="Total stock units"
            value={number(data.inventory.stock)}
          />

          <MetricCard
            label="Low stock"
            value={number(data.inventory.lowStock)}
            detail="1–5 units remaining"
          />

          <MetricCard
            label="Out of stock"
            value={number(data.inventory.outOfStock)}
            detail="Restocking required"
          />
        </div>

        {data.inventory.lowStock > 0 ||
        data.inventory.outOfStock > 0 ? (
          <div className="analytics-inventory-alert">
            <strong>Inventory attention required</strong>
            <p>
              {data.inventory.lowStock} variants have five
              or fewer units remaining, including{" "}
              {data.inventory.outOfStock} out-of-stock variants.
            </p>
            <a href="/admin/inventory">
              Review inventory →
            </a>
          </div>
        ) : null}
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Customer and enquiries</h3>
          <span>Store activity</span>
        </div>

        <div className="analytics-metrics-grid">
          <MetricCard
            label="Total customers"
            value={number(data.customers.total)}
          />

          <MetricCard
            label="New customers"
            value={number(data.customers.newCustomers)}
            detail="Selected period"
          />

          <MetricCard
            label="Contact enquiries"
            value={number(data.enquiries.contact)}
          />

          <MetricCard
            label="Bulk and custom requests"
            value={number(
              data.enquiries.bulk + data.enquiries.custom
            )}
            detail={`${data.enquiries.bulk} bulk · ${data.enquiries.custom} custom`}
          />
        </div>
      </section>

      <section className="analytics-section">
        <div className="analytics-section-heading">
          <h3>Recent orders</h3>
          <a href="/admin/orders">View all orders →</a>
        </div>

        <div className="analytics-table-wrapper">
          {data.recentOrders.length > 0 ? (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{currency(order.total)}</td>
                    <td>
                      <span className="analytics-status-badge">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{order.orderStatus}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="analytics-empty">
              No orders found for this period.
            </p>
          )}
        </div>
      </section>

      <p className="analytics-footer">
        DC CLOTHINGS · BUSINESS ANALYTICS
      </p>

    </div>
  );
}
