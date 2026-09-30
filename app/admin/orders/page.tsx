import { createAdminClient } from "@/lib/supabase/admin";
import OrderFilters from "../components/OrderFilters";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      total_amount,
      order_status,
      payment_status,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Orders fetch error:", error);
  }

  const orderList = orders ?? [];

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DC CLOTHINGS / ADMINISTRATION
          </p>

          <h1>Orders</h1>

          <p className="admin-page-introduction">
            Manage customer orders and monitor their
            payment and fulfilment status.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              ORDER MANAGEMENT
            </p>

            <h2>All Orders</h2>
          </div>

          <span className="admin-record-count">
            {orderList.length}{" "}
            {orderList.length === 1
              ? "order"
              : "orders"}
          </span>
        </div>

        {error ? (
          <div className="admin-empty-state">
            <h3>Unable to load orders</h3>

            <p>
              There was a problem retrieving orders
              from the database. Please refresh the
              page and try again.
            </p>
          </div>
        ) : (
          <OrderFilters orders={orderList} />
        )}
      </section>
    </main>
  );
}