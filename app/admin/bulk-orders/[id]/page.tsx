import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import BulkOrderStatusControls from "../../components/BulkOrderStatusControls";

type BulkOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BulkOrderPage({
  params,
}: BulkOrderPageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: enquiry, error } = await supabase
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
      created_at,
      updated_at
      `
    )
    .eq("id", id)
    .single();

  if (error || !enquiry) {
    notFound();
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <Link
          href="/admin/bulk-orders"
          className="admin-back-link"
        >
          ← Back to Bulk Orders
        </Link>

        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">
              DC CLOTHINGS / BULK ENQUIRY
            </p>

            <h1>{enquiry.organisation_name}</h1>

            <p className="admin-page-introduction">
              Enquiry submitted on{" "}
              {formatDate(enquiry.created_at)}
            </p>
          </div>

          <div className="admin-order-status-group">
            <span
              className={`admin-status admin-status-${enquiry.status}`}
            >
              {formatStatus(enquiry.status)}
            </span>
          </div>
        </div>
      </div>

      <section className="admin-detail-grid">
        <div className="admin-detail-card">
          <p className="admin-eyebrow">CONTACT</p>

          <h2>{enquiry.contact_person}</h2>

          <div className="admin-detail-list">
            <div>
              <span>Email</span>
              <strong>{enquiry.email}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{enquiry.phone}</strong>
            </div>
          </div>
        </div>

        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            ORGANISATION
          </p>

          <h2>{enquiry.organisation_name}</h2>

          <div className="admin-detail-list">
            <div>
              <span>Organisation Type</span>
              <strong>
                {enquiry.organisation_type}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {enquiry.city}, {enquiry.country}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-detail-grid">
        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            ORDER REQUIREMENTS
          </p>

          <h2>{enquiry.garment_needed}</h2>

          <div className="admin-detail-list">
            <div>
              <span>Estimated Quantity</span>
              <strong>
                {enquiry.estimated_quantity.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Branding Required</span>
              <strong>
                {enquiry.branding_required
                  ? "Yes"
                  : "No"}
              </strong>
            </div>

            <div>
              <span>Delivery Deadline</span>
              <strong>
                {enquiry.delivery_deadline
                  ? formatDate(
                      enquiry.delivery_deadline
                    )
                  : "Not specified"}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            ADDITIONAL INFORMATION
          </p>

          <h2>Notes</h2>

          <p className="admin-notes">
            {enquiry.notes || "No additional notes provided."}
          </p>
        </div>
      </section>

      <BulkOrderStatusControls
        enquiryId={enquiry.id}
        initialStatus={enquiry.status}
      />
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
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