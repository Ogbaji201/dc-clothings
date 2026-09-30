import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import CustomOrderStatusControls from "../../components/CustomOrderStatusControls";

type CustomOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomOrderPage({
  params,
}: CustomOrderPageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: enquiry, error } = await supabase
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
      created_at,
      updated_at
      `
    )
    .eq("id", id)
    .single();

  if (error || !enquiry) {
    notFound();
  }

  let referenceImageUrl: string | null = null;

  if (enquiry.reference_image_url) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("custom-order-images")
        .createSignedUrl(
          enquiry.reference_image_url,
          60 * 10
        );

    if (signedUrlError) {
      console.error(
        "Reference image signed URL error:",
        signedUrlError
      );
    } else {
      referenceImageUrl =
        signedUrlData?.signedUrl ?? null;
    }
  }

  return (
    <main className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <Link
          href="/admin/custom-orders"
          className="admin-back-link"
        >
          ← Back to Custom Orders
        </Link>

        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">
              DC CLOTHINGS / CUSTOM ENQUIRY
            </p>

            <h1>{enquiry.full_name}</h1>

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

      {/* Customer */}
      <section className="admin-detail-grid">
        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            CUSTOMER
          </p>

          <h2>{enquiry.full_name}</h2>

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

        {/* Garment */}
        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            GARMENT REQUIREMENTS
          </p>

          <h2>{enquiry.garment_type}</h2>

          <div className="admin-detail-list">
            <div>
              <span>Preferred Colour</span>
              <strong>
                {enquiry.preferred_colour ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Preferred Size</span>
              <strong>
                {enquiry.preferred_size ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>
                {enquiry.quantity.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              CUSTOMER BRIEF
            </p>

            <h2>Custom Idea</h2>
          </div>
        </div>

        <div className="admin-message-detail">
          {enquiry.description}
        </div>
      </section>

      {/* Reference Image */}
      {enquiry.reference_image_url && (
        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <p className="admin-eyebrow">
                CUSTOMER REFERENCE
              </p>

              <h2>Reference Image</h2>
            </div>
          </div>

          {referenceImageUrl ? (
            <div className="admin-reference-image-wrapper">
              <img
                src={referenceImageUrl}
                alt="Customer reference"
                className="admin-reference-image"
              />
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>Reference image unavailable</h3>

              <p>
                The reference image could not be loaded.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Status */}
      <CustomOrderStatusControls
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