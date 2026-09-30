import { createAdminClient } from "@/lib/supabase/admin";
import BulkOrderFilters from "../components/BulkOrderFilters";

export default async function AdminBulkOrdersPage() {
  const supabase = createAdminClient();

  const { data: enquiries, error } = await supabase
    .from("bulk_order_requests")
    .select(
      `
      id,
      contact_person,
      organisation_name,
      email,
      phone,
      country,
      city,
      organisation_type,
      garment_needed,
      estimated_quantity,
      delivery_deadline,
      branding_required,
      notes,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Bulk orders fetch error:", error);
  }

  const enquiryList = enquiries ?? [];

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DC CLOTHINGS / ADMINISTRATION
          </p>

          <h1>Bulk Orders</h1>

          <p className="admin-page-introduction">
            Manage corporate, event, institutional and
            other bulk order enquiries.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              B2B ORDER MANAGEMENT
            </p>

            <h2>All Bulk Enquiries</h2>
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
            <h3>Unable to load bulk enquiries</h3>

            <p>
              There was a problem retrieving bulk order
              enquiries from the database. Please refresh
              the page and try again.
            </p>
          </div>
        ) : (
          <BulkOrderFilters enquiries={enquiryList} />
        )}
      </section>
    </main>
  );
}