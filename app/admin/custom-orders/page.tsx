import { createAdminClient } from "@/lib/supabase/admin";
import CustomOrderFilters from "../components/CustomOrderFilters";

export default async function AdminCustomOrdersPage() {
  const supabase = createAdminClient();

  const { data: enquiries, error } = await supabase
    .from("custom_order_requests")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      garment_type,
      preferred_colour,
      preferred_size,
      quantity,
      description,
      reference_image_url,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Custom orders fetch error:", error);
  }

  const enquiryList = enquiries ?? [];

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DC CLOTHINGS / ADMINISTRATION
          </p>

          <h1>Custom Orders</h1>

          <p className="admin-page-introduction">
            Manage customer requests for personalised and
            made-to-order garments.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              CUSTOM ORDER MANAGEMENT
            </p>

            <h2>All Custom Enquiries</h2>
          </div>

          <span className="admin-record-count">
            {enquiryList.length}{" "}
            {enquiryList.length === 1
              ? "enquiry"
              : "enquiries"}
          </span>
        </div>

        {error ? (
          <div className="admin-empty-state">
            <h3>Unable to load custom enquiries</h3>

            <p>
              There was a problem retrieving custom order
              enquiries from the database. Please refresh
              the page and try again.
            </p>
          </div>
        ) : (
          <CustomOrderFilters enquiries={enquiryList} />
        )}
      </section>
    </main>
  );
}