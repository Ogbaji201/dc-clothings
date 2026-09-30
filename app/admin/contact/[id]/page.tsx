import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ContactMessageStatusControls from "../../components/ContactMessageStatusControls";

type ContactMessagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContactMessagePage({
  params,
}: ContactMessagePageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: message, error } = await supabase
    .from("contact_messages")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      address,
      subject,
      message,
      status,
      created_at,
      updated_at
      `
    )
    .eq("id", id)
    .single();

  if (error || !message) {
    notFound();
  }

  return (
    <main className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <Link
          href="/admin/contact"
          className="admin-back-link"
        >
          ← Back to Contact Messages
        </Link>

        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">
              DC CLOTHINGS / CUSTOMER MESSAGE
            </p>

            <h1>{message.subject}</h1>

            <p className="admin-page-introduction">
              Submitted on{" "}
              {formatDate(message.created_at)}
            </p>
          </div>

          <div className="admin-order-status-group">
            <span
              className={`admin-status admin-status-${message.status}`}
            >
              {formatStatus(message.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <section className="admin-detail-grid">
        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            CUSTOMER
          </p>

          <h2>{message.full_name}</h2>

          <div className="admin-detail-list">
            <div>
              <span>Email</span>
              <strong>{message.email}</strong>
            </div>

            {message.phone && (
              <div>
                <span>Phone</span>
                <strong>{message.phone}</strong>
              </div>
            )}

            {message.address && (
              <div>
                <span>Address</span>
                <strong>{message.address}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="admin-detail-card">
          <p className="admin-eyebrow">
            MESSAGE INFORMATION
          </p>

          <h2>Enquiry</h2>

          <div className="admin-detail-list">
            <div>
              <span>Subject</span>
              <strong>{message.subject}</strong>
            </div>

            <div>
              <span>Submitted</span>
              <strong>
                {formatDate(message.created_at)}
              </strong>
            </div>

            <div>
              <span>Current Status</span>
              <strong>
                {formatStatus(message.status)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Message */}
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <p className="admin-eyebrow">
              CUSTOMER ENQUIRY
            </p>

            <h2>Message</h2>
          </div>
        </div>

        <div className="admin-message-detail">
          {message.message}
        </div>
      </section>

      {/* Status Controls */}
      <ContactMessageStatusControls
        messageId={message.id}
        initialStatus={message.status}
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